import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  uploadToStorage,
  getSignedUploadUrl,
  deleteFromR2,
  generateProductKey,
  generateTempKey,
  IS_REMOTE_STORAGE,
} from '@/lib/r2'
import { apiRateLimit, rateLimit } from '@/lib/rate-limit'
import { validateFileSignature, validateFileSize } from '@/lib/file-validation'
import { isStaffRole } from '@/lib/roles'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.role || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { success: limitOk } = await rateLimit(apiRateLimit, `upload:${ip}`)
  if (!limitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string
    const variantId = formData.get('variantId') as string
    const index = Number(formData.get('index') || '0')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json({ error: 'Invalid file signature' }, { status: 400 })
    }

    let key: string
    if (productId && variantId && productId !== 'temp') {
      const ext = file.type.split('/')[1] || 'webp'
      key = generateProductKey(productId, variantId, index, ext)
    } else {
      key = generateTempKey(file.name)
    }

    // Direct upload to storage or signed URL generation
    const publicUrl = await uploadToStorage(key, Buffer.from(buffer), file.type)
    const signedData = await getSignedUploadUrl(key, file.type)

    return NextResponse.json({
      uploadUrl: signedData.uploadUrl,
      publicUrl,
      key,
      isRemoteStorage: IS_REMOTE_STORAGE,
    })
  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.role || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { success: limitOk } = await rateLimit(apiRateLimit, `upload:${ip}`)
  if (!limitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 })
  }

  try {
    await deleteFromR2(key)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}