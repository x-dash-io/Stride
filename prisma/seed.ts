import { PrismaClient, UserRole, ProductStatus, GenderCategory, OrderStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stride.co.ke' },
    update: {},
    create: {
      email: 'admin@stride.co.ke',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      phone: '254700000000',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@stride.co.ke' },
    update: {},
    create: {
      email: 'customer@stride.co.ke',
      name: 'Demo Customer',
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      phone: '254711111111',
    },
  })
  console.log('✅ Demo customer created:', customer.email)

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'nike' },
      update: {},
      create: { name: 'Nike', slug: 'nike', description: 'Just Do It', isFeatured: true, isGlobalBrand: true, sortOrder: 1 },
    }),
    prisma.brand.upsert({
      where: { slug: 'adidas' },
      update: {},
      create: { name: 'Adidas', slug: 'adidas', description: 'Impossible is Nothing', isFeatured: true, isGlobalBrand: true, sortOrder: 2 },
    }),
    prisma.brand.upsert({
      where: { slug: 'puma' },
      update: {},
      create: { name: 'Puma', slug: 'puma', description: 'Forever Faster', isFeatured: true, isGlobalBrand: true, sortOrder: 3 },
    }),
    prisma.brand.upsert({
      where: { slug: 'new-balance' },
      update: {},
      create: { name: 'New Balance', slug: 'new-balance', description: 'Fearlessly Independent', isFeatured: false, isGlobalBrand: true, sortOrder: 4 },
    }),
    prisma.brand.upsert({
      where: { slug: 'african-footwear' },
      update: {},
      create: { name: 'African Footwear Co.', slug: 'african-footwear', description: 'Handcrafted in Kenya', isFeatured: true, isGlobalBrand: false, sortOrder: 5 },
    }),
  ])
  console.log('✅ Brands created:', brands.length)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sneakers' },
      update: {},
      create: { name: 'Sneakers', slug: 'sneakers', description: 'Casual and athletic sneakers', isActive: true, isFeatured: true, sortOrder: 1, level: 0 },
    }),
    prisma.category.upsert({
      where: { slug: 'formal-shoes' },
      update: {},
      create: { name: 'Formal Shoes', slug: 'formal-shoes', description: 'Office and dress shoes', isActive: true, isFeatured: true, sortOrder: 2, level: 0 },
    }),
    prisma.category.upsert({
      where: { slug: 'boots' },
      update: {},
      create: { name: 'Boots', slug: 'boots', description: 'Ankle, Chelsea, and hiking boots', isActive: true, isFeatured: true, sortOrder: 3, level: 0 },
    }),
    prisma.category.upsert({
      where: { slug: 'sandals' },
      update: {},
      create: { name: 'Sandals', slug: 'sandals', description: 'Casual and dress sandals', isActive: true, isFeatured: false, sortOrder: 4, level: 0 },
    }),
    prisma.category.upsert({
      where: { slug: 'kids' },
      update: {},
      create: { name: 'Kids', slug: 'kids', description: 'Children footwear', isActive: true, isFeatured: false, sortOrder: 5, level: 0 },
    }),
  ])
  console.log('✅ Categories created:', categories.length)

  // Create warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: { name: 'Main Warehouse', code: 'MAIN', city: 'Nairobi', country: 'KE', isActive: true },
  })
  console.log('✅ Warehouse created')

  // Create products
  const productsData = [
    {
      name: 'Air Max 270',
      slug: 'air-max-270',
      brand: brands[0],
      category: categories[0],
      shortDescription: 'Iconic Air Max cushioning with modern style',
      description: 'The Nike Air Max 270 delivers visible cushioning under every step. A lightweight mesh upper keeps you cool while the foam midsole provides soft, responsive cushioning.',
      basePrice: 18500,
      salePrice: 15900,
      costPrice: 8500,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: true,
      weightKg: 0.9,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM270-BLK-40', quantity: 15 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM270-BLK-41', quantity: 20 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM270-BLK-42', quantity: 18 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM270-BLK-43', quantity: 12 },
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'White/Red', colourHex: '#FFFFFF', sku: 'NK-AM270-WHT-40', quantity: 10 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'White/Red', colourHex: '#FFFFFF', sku: 'NK-AM270-WHT-41', quantity: 15 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'White/Red', colourHex: '#FFFFFF', sku: 'NK-AM270-WHT-42', quantity: 8 },
      ],
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    },
    {
      name: 'Ultraboost 22',
      slug: 'ultraboost-22',
      brand: brands[1],
      category: categories[0],
      shortDescription: 'Responsive running shoes with Primeknit upper',
      description: 'Experience incredible energy return with the Ultraboost 22. The Primeknit upper wraps the foot in adaptive support, while Boost midsole delivers responsive cushioning.',
      basePrice: 22000,
      salePrice: 18900,
      costPrice: 11000,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isTrending: true,
      weightKg: 0.85,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Core Black', colourHex: '#1A1A1A', sku: 'AD-UB22-BLK-40', quantity: 12 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Core Black', colourHex: '#1A1A1A', sku: 'AD-UB22-BLK-41', quantity: 18 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Core Black', colourHex: '#1A1A1A', sku: 'AD-UB22-BLK-42', quantity: 20 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Core Black', colourHex: '#1A1A1A', sku: 'AD-UB22-BLK-43', quantity: 14 },
      ],
      images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'],
    },
    {
      name: 'Classic Leather Oxford',
      slug: 'classic-leather-oxford',
      brand: brands[2],
      category: categories[1],
      shortDescription: 'Timeless formal shoe for professional settings',
      description: 'Handcrafted from premium full-grain leather, this Oxford features Goodyear welt construction for durability and a leather sole for classic elegance.',
      basePrice: 15500,
      salePrice: 13200,
      costPrice: 7200,
      gender: GenderCategory.MEN,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: false,
      weightKg: 1.1,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Black', colourHex: '#000000', sku: 'PU-OXF-BLK-40', quantity: 8 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Black', colourHex: '#000000', sku: 'PU-OXF-BLK-41', quantity: 12 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Black', colourHex: '#000000', sku: 'PU-OXF-BLK-42', quantity: 10 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Black', colourHex: '#000000', sku: 'PU-OXF-BLK-43', quantity: 6 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Dark Brown', colourHex: '#3B2418', sku: 'PU-OXF-BRN-41', quantity: 5 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Dark Brown', colourHex: '#3B2418', sku: 'PU-OXF-BRN-42', quantity: 7 },
      ],
      images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800'],
    },
    {
      name: '574 Core',
      slug: '574-core',
      brand: brands[3],
      category: categories[0],
      shortDescription: 'Classic retro silhouette with modern comfort',
      description: 'The 574 is the quintessential New Balance sneaker. A versatile blend of retro style and modern comfort with ENCAP midsole technology.',
      basePrice: 13500,
      salePrice: 11500,
      costPrice: 6200,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: true,
      weightKg: 0.95,
      variants: [
        { size: '39', sizeEu: '39', sizeUs: '6', sizeUk: '5.5', colour: 'Grey/Navy', colourHex: '#5A6A8A', sku: 'NB-574-GRY-39', quantity: 15 },
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Grey/Navy', colourHex: '#5A6A8A', sku: 'NB-574-GRY-40', quantity: 20 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Grey/Navy', colourHex: '#5A6A8A', sku: 'NB-574-GRY-41', quantity: 18 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Grey/Navy', colourHex: '#5A6A8A', sku: 'NB-574-GRY-42', quantity: 14 },
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Green/Grey', colourHex: '#4A5D4A', sku: 'NB-574-GRN-40', quantity: 10 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Green/Grey', colourHex: '#4A5D4A', sku: 'NB-574-GRN-41', quantity: 12 },
      ],
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'],
    },
    {
      name: 'Nairobi Handcrafted Leather Boot',
      slug: 'nairobi-handcrafted-leather-boot',
      brand: brands[4],
      category: categories[2],
      shortDescription: 'Premium Kenyan leather boots made by local artisans',
      description: 'Each pair is handcrafted in Nairobi using locally sourced leather. Features Vibram sole for durability and comfort. Supports local craftsmen.',
      basePrice: 12500,
      costPrice: 5800,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: false,
      isLimitedEdition: true,
      weightKg: 1.3,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Natural Tan', colourHex: '#D2B48C', sku: 'AF-BOOT-TAN-40', quantity: 5 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Natural Tan', colourHex: '#D2B48C', sku: 'AF-BOOT-TAN-41', quantity: 8 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Natural Tan', colourHex: '#D2B48C', sku: 'AF-BOOT-TAN-42', quantity: 6 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Natural Tan', colourHex: '#D2B48C', sku: 'AF-BOOT-TAN-43', quantity: 4 },
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Dark Brown', colourHex: '#3B2418', sku: 'AF-BOOT-DBR-40', quantity: 3 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Dark Brown', colourHex: '#3B2418', sku: 'AF-BOOT-DBR-41', quantity: 5 },
      ],
      images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800'],
    },
  ]

  for (const productData of productsData) {
    const { variants, images, ...productInfo } = productData
    
    const product = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      update: {},
      create: {
        ...productInfo,
        brandId: productInfo.brand.id,
        categoryId: productInfo.category.id,
        status: ProductStatus.ACTIVE,
        publishedAt: new Date(),
      },
    })

    // Create product images
    for (const [index, imageUrl] of images.entries()) {
      await prisma.productImage.create({
        data: { productId: product.id, url: imageUrl, altText: product.name, isPrimary: index === 0, sortOrder: index },
      })
    }

    // Create variants and inventory
    for (const variantData of variants) {
      const { quantity, ...variantInfo } = variantData
      
      const variant = await prisma.productVariant.create({
        data: {
          ...variantInfo,
          productId: product.id,
          basePrice: variantInfo.basePrice || productInfo.basePrice,
          salePrice: variantInfo.salePrice || productInfo.salePrice,
        },
      })

      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          warehouseId: warehouse.id,
          quantityOnHand: quantity,
          quantityReserved: 0,
          lowStockThreshold: 5,
        },
      })
    }

    console.log(`✅ Product created: ${product.name} with ${variants.length} variants`)
  }

  // Create banners
  await prisma.banner.upsert({
    where: { id: 'hero-banner-1' },
    update: {},
    create: {
      id: 'hero-banner-1',
      title: 'Step Into Luxury',
      subtitle: 'Discover premium footwear from global and local brands',
      ctaText: 'Shop Collection',
      ctaUrl: '/products',
      desktopImageUrl: 'https://images.unsplash.com/photo-1460353589641-1a2e3e3e3e3e?w=1920',
      mobileImageUrl: 'https://images.unsplash.com/photo-1460353589641-1a2e3e3e3e3e?w=800',
      placement: 'hero',
      isActive: true,
      sortOrder: 1,
    },
  })
  console.log('✅ Banners created')

  // Create CMS pages
  const cmsPages = [
    { slug: 'shipping', title: 'Shipping Information', content: 'Free delivery on orders over KES 10,000. Standard delivery 3-5 business days. Express delivery 1-2 business days for KES 1,000.' },
    { slug: 'returns', title: 'Returns & Exchanges', content: '30-day return policy. Items must be unworn with original packaging. Free return shipping on first order.' },
    { slug: 'privacy-policy', title: 'Privacy Policy', content: 'We respect your privacy. This policy explains how we collect, use, and protect your personal information.' },
    { slug: 'terms-of-service', title: 'Terms of Service', content: 'By using STRIDE, you agree to these terms. Please read them carefully.' },
    { slug: 'size-guide', title: 'Size Guide', content: 'Measure your foot length in cm and compare to our size chart. EU 39 = 24.5cm, EU 40 = 25cm, EU 41 = 26cm, EU 42 = 26.5cm, EU 43 = 27.5cm.' },
  ]

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, isPublished: true, publishedAt: new Date() },
    })
  }
  console.log('✅ CMS pages created')

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })