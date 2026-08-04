import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting database image URL fix...')
  
  // 1. Fix ProductImage URLs
  const productImages = await prisma.productImage.findMany()
  console.log(`🔍 Found ${productImages.length} product images in database.`)
  
  let productImagesUpdated = 0
  for (const img of productImages) {
    if (img.url.startsWith('http://localhost:3000/api/images/')) {
      const fixedUrl = img.url.replace('http://localhost:3000/api/images/', '/api/images/')
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: fixedUrl }
      })
      productImagesUpdated++
    }
  }
  console.log(`✅ Updated ${productImagesUpdated} product image URLs.`)

  // 2. Fix Banner URLs
  const banners = await prisma.banner.findMany()
  console.log(`🔍 Found ${banners.length} banners in database.`)

  let bannersUpdated = 0
  for (const banner of banners) {
    let needsUpdate = false
    const updateData: { desktopImageUrl?: string; mobileImageUrl?: string } = {}

    if (banner.desktopImageUrl.startsWith('http://localhost:3000/api/images/')) {
      updateData.desktopImageUrl = banner.desktopImageUrl.replace('http://localhost:3000/api/images/', '/api/images/')
      needsUpdate = true
    }

    if (banner.mobileImageUrl && banner.mobileImageUrl.startsWith('http://localhost:3000/api/images/')) {
      updateData.mobileImageUrl = banner.mobileImageUrl.replace('http://localhost:3000/api/images/', '/api/images/')
      needsUpdate = true
    }

    if (needsUpdate) {
      await prisma.banner.update({
        where: { id: banner.id },
        data: updateData
      })
      bannersUpdated++
    }
  }
  console.log(`✅ Updated ${bannersUpdated} banner image URLs.`)

  console.log('🎉 Database image URLs fixed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error fixing database URLs:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
