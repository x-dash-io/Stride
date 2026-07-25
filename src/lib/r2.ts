import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const createR2Client = () => {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return null
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
}

export const r2 = createR2Client()

export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'stride-media'
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_DOMAIN
  ? `https://${process.env.R2_PUBLIC_DOMAIN}`
  : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType: string
): Promise<string> {
  if (!r2) throw new Error('R2 not configured')

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body as any,
    ContentType: contentType,
  }))

  return `${R2_PUBLIC_URL}/${key}`
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!r2) throw new Error('R2 not configured')

  const url = await getSignedUrl(r2, new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  }), { expiresIn })

  return { uploadUrl: url, publicUrl: `${R2_PUBLIC_URL}/${key}` }
}

export async function deleteFromR2(key: string): Promise<void> {
  if (!r2) throw new Error('R2 not configured')

  await r2.send(new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  }))
}

export async function objectExists(key: string): Promise<boolean> {
  if (!r2) return false

  try {
    await r2.send(new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }))
    return true
  } catch {
    return false
  }
}

export function generateProductKey(productId: string, variantId: string, index: number, extension: string): string {
  return `products/${productId}/${variantId}/${index}.${extension}`
}

export function generateTempKey(filename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = filename.split('.').pop() || 'bin'
  return `uploads/temp/${timestamp}-${random}.${ext}`
}