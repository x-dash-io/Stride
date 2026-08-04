import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '../.env.local') })

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'stride-media'
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN

// Use public R2 URL format if no custom domain is set
const getPublicUrl = (key: string) => {
  if (R2_PUBLIC_DOMAIN) {
    return `https://${R2_PUBLIC_DOMAIN}/${key}`
  }
  // Use R2's public URL format
  return `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`
}

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('[ERROR] Missing R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.')
  process.exit(1)
}

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const SOURCE_DIR = join(__dirname, '../seed-prod-img')
const UPLOAD_PREFIX = 'products/'

async function uploadImage(filePath: string, fileName: string) {
  const fileContent = readFileSync(filePath)
  const key = `${UPLOAD_PREFIX}${fileName}`

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: 'image/jpeg',
  })

  try {
    await s3Client.send(command)
    const publicUrl = getPublicUrl(key)
    
    console.log(`[SUCCESS] Uploaded: ${fileName} -> ${publicUrl}`)
    return { fileName, publicUrl, key }
  } catch (error) {
    console.error(`[ERROR] Failed to upload ${fileName}:`, error)
    throw error
  }
}

async function listExistingImages() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: UPLOAD_PREFIX,
    })
    const response = await s3Client.send(command)
    return response.Contents?.map(obj => obj.Key) || []
  } catch (error) {
    console.error('[ERROR] Failed to list existing images:', error)
    return []
  }
}

async function main() {
  console.log(' Starting image upload to R2...')
  console.log(` Source directory: ${SOURCE_DIR}`)
  console.log(` Bucket: ${R2_BUCKET_NAME}`)
  console.log(` Public domain: ${R2_PUBLIC_DOMAIN || 'R2 default'}`)
  console.log()

  // Check existing images
  const existingKeys = await listExistingImages()
  console.log(`[DATA] Found ${existingKeys.length} existing images in bucket`)

  // Read local images
  const files = readdirSync(SOURCE_DIR).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  )

  console.log(` Found ${files.length} local images to upload`)
  console.log()

  const uploadResults = []

  for (const file of files) {
    const filePath = join(SOURCE_DIR, file)
    const key = `${UPLOAD_PREFIX}${file}`

    // Skip if already exists
    if (existingKeys.includes(key)) {
      const publicUrl = getPublicUrl(key)
      console.log(`⏭️  Skipping existing: ${file}`)
      uploadResults.push({ fileName: file, publicUrl, key, skipped: true })
      continue
    }

    try {
      const result = await uploadImage(filePath, file)
      uploadResults.push({ ...result, skipped: false })
    } catch (error) {
      console.error(`[ERROR] Failed to upload ${file}`)
    }
  }

  console.log()
  console.log('[DONE] Upload complete!')
  console.log()
  console.log(' Image URLs for seed data:')
  console.log(JSON.stringify(uploadResults, null, 2))
}

main().catch(console.error)
