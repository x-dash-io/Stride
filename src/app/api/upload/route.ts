import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { r2, R2_BUCKET, getSignedUploadUrl, generateProductKey, generateTempKey } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!r2) {
    return NextResponse.json({ error: 'R2 not configured' }, { status: 503 })
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

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    let key: string
    if (productId && variantId && productId !== 'temp') {
      const ext = file.type.split('/')[1] || 'webp'
      key = generateProductKey(productId, variantId, index, ext)
    } else {
      key = generateTempKey(file.name)
    }

    const { uploadUrl, publicUrl } = await getSignedUploadUrl(key, file.type)

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    })
  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!r2) {
    return NextResponse.json({ error: 'R2 not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 })
  }

  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    await r2.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}