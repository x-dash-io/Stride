'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToR2, generateProductKey } from '@/lib/r2'
import { revalidatePath } from 'next/cache'

export async function uploadProductImages(
  productId: string,
  variantId: string,
  files: File[]
): Promise<{ urls: string[]; error?: string }> {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return { urls: [], error: 'Unauthorized' }
  }

  if (!files.length) return { urls: [] }

  try {
    const urls = await Promise.all(
      files.map(async (file, index) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const key = generateProductKey(productId, variantId, index, file.type.split('/')[1] || 'webp')
        return uploadToR2(key, buffer, file.type)
      })
    )

    // Update product variant with image URLs
    await prisma.productImage.createMany({
      data: urls.map((url, index) => ({
        productId,
        variantId,
        url,
        altText: `Product image ${index + 1}`,
        isPrimary: index === 0,
        sortOrder: index,
      })),
    })

    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/products/${productId}`)

    return { urls }
  } catch (error) {
    console.error('Upload error:', error)
    return { urls: [], error: 'Failed to upload images' }
  }
}

export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } })
    if (!image) return { success: false, error: 'Image not found' }

    // Extract key from URL
    const url = new URL(image.url)
    const key = url.pathname.slice(1) // Remove leading slash

    const { deleteFromR2 } = await import('@/lib/r2')
    await deleteFromR2(key)

    await prisma.productImage.delete({ where: { id: imageId } })

    return { success: true }
  } catch (error) {
    console.error('Delete image error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

export async function reorderProductImages(
  imageIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.$transaction(
      imageIds.map((id, index) =>
        prisma.productImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    return { success: true }
  } catch (error) {
    console.error('Reorder error:', error)
    return { success: false, error: 'Failed to reorder images' }
  }
}

export async function setPrimaryImage(
  imageId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ])

    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/products/${productId}`)

    return { success: true }
  } catch (error) {
    console.error('Set primary error:', error)
    return { success: false, error: 'Failed to set primary image' }
  }
}