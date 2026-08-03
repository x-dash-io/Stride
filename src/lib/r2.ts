import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs/promises'
import path from 'path'

// Helper to determine storage configuration
const getStorageConfig = () => {
  // Check AWS S3 standard variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'stride-media'
    const region = process.env.AWS_REGION || 'us-east-1'
    const endpoint = process.env.S3_ENDPOINT || undefined
    const publicDomain = process.env.S3_PUBLIC_DOMAIN
      ? `https://${process.env.S3_PUBLIC_DOMAIN}`
      : endpoint
        ? `${endpoint}/${bucket}`
        : `https://${bucket}.s3.${region}.amazonaws.com`

    const client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    return { client, bucket, publicUrl: publicDomain, isRemote: true, type: 'S3' }
  }

  // Check Cloudflare R2 variables
  if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    const bucket = process.env.R2_BUCKET_NAME || 'stride-media'
    const publicDomain = process.env.R2_PUBLIC_DOMAIN
      ? `https://${process.env.R2_PUBLIC_DOMAIN}`
      : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}`

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })

    return { client, bucket, publicUrl: publicDomain, isRemote: true, type: 'R2' }
  }

  // Fallback for local development
  return {
    client: null,
    bucket: 'local-uploads',
    publicUrl: '/uploads',
    isRemote: false,
    type: 'LOCAL',
  }
}

const storageConfig = getStorageConfig()

export const r2 = storageConfig.client
export const R2_BUCKET = storageConfig.bucket
export const R2_PUBLIC_URL = storageConfig.publicUrl
export const IS_REMOTE_STORAGE = storageConfig.isRemote

export async function uploadToStorage(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  if (storageConfig.client) {
    await storageConfig.client.send(
      new PutObjectCommand({
        Bucket: storageConfig.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )
    return `${storageConfig.publicUrl}/${key}`
  }

  // Local development fallback
  const localPath = path.join(process.cwd(), 'public', 'uploads', key)
  await fs.mkdir(path.dirname(localPath), { recursive: true })
  await fs.writeFile(localPath, body)
  return `/uploads/${key}`
}

export const uploadToR2 = uploadToStorage

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<{ uploadUrl: string; publicUrl: string; isLocalFallback?: boolean }> {
  if (storageConfig.client) {
    const url = await getSignedUrl(
      storageConfig.client,
      new PutObjectCommand({
        Bucket: storageConfig.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn }
    )
    return { uploadUrl: url, publicUrl: `${storageConfig.publicUrl}/${key}` }
  }

  // Local fallback endpoint for direct upload
  return {
    uploadUrl: `/api/upload/direct?key=${encodeURIComponent(key)}`,
    publicUrl: `/uploads/${key}`,
    isLocalFallback: true,
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  if (storageConfig.client) {
    await storageConfig.client.send(
      new DeleteObjectCommand({
        Bucket: storageConfig.bucket,
        Key: key,
      })
    )
    return
  }

  try {
    const localPath = path.join(process.cwd(), 'public', 'uploads', key)
    await fs.unlink(localPath)
  } catch {
    // File may not exist locally
  }
}

export async function objectExists(key: string): Promise<boolean> {
  if (storageConfig.client) {
    try {
      await storageConfig.client.send(
        new HeadObjectCommand({
          Bucket: storageConfig.bucket,
          Key: key,
        })
      )
      return true
    } catch {
      return false
    }
  }

  try {
    const localPath = path.join(process.cwd(), 'public', 'uploads', key)
    await fs.access(localPath)
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