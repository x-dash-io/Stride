'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function removeFromWishlist(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const itemId = formData.get('itemId') as string

  if (!itemId) {
    return { error: 'Item ID is required' }
  }

  try {
    await prisma.wishlistItem.delete({
      where: {
        id: itemId,
        wishlist: { userId },
      },
    })

    revalidatePath('/account/wishlist')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    return { error: 'Failed to remove item from wishlist' }
  }
}

export async function addToWishlist(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const variantId = formData.get('variantId') as string

  if (!variantId) {
    return { error: 'Variant ID is required' }
  }

  try {
    // Get or create wishlist
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId },
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
      })
    }

    // Check if item already exists
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_variantId: {
          wishlistId: wishlist.id,
          variantId,
        },
      },
    })

    if (existing) {
      return { success: true, message: 'Item already in wishlist' }
    }

    // Add item to wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        variantId,
      },
    })

    revalidatePath('/account/wishlist')
    return { success: true }
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    return { error: 'Failed to add item to wishlist' }
  }
}
