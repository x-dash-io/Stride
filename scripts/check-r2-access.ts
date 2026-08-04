import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../.env.local') })

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'stride-media'

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ Missing required R2 environment variables')
  process.exit(1)
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
})

async function checkBucketAccess() {
  try {
    console.log('🔍 Checking R2 bucket access...')
    
    // List objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'products/',
    })
    
    const response = await s3Client.send(listCommand)
    console.log(`📋 Found ${response.Contents?.length || 0} objects in bucket`)
    
    if (response.Contents && response.Contents.length > 0) {
      const firstObject = response.Contents[0]
      console.log(`📁 First object: ${firstObject.Key}`)
      console.log(`📏 Size: ${firstObject.Size} bytes`)
      
      // Try to get the object
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: firstObject.Key,
      })
      
      const objectResponse = await s3Client.send(getCommand)
      console.log(`✅ Successfully retrieved object: ${firstObject.Key}`)
      console.log(`📄 Content-Type: ${objectResponse.ContentType}`)
      console.log(`📏 Content-Length: ${objectResponse.ContentLength}`)
      
      // Test public URL
      const publicUrl = `https://pub-${R2_ACCOUNT_ID}.r2.dev/${firstObject.Key}`
      console.log(`🌐 Public URL: ${publicUrl}`)
      console.log('⚠️  Note: Public access may still be configuring...')
    }
    
  } catch (error) {
    console.error('❌ Error accessing R2 bucket:', error)
  }
}

checkBucketAccess()