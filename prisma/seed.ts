import { PrismaClient, UserRole, ProductStatus, GenderCategory, OrderStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
  console.log('[START] Seeding database...')

  // Get credentials from environment
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@stride.co.ke'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123'
  const adminPhone = process.env.SEED_ADMIN_PHONE || '254700000000'
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin User'

  const customerEmail = process.env.SEED_CUSTOMER_EMAIL || 'customer@stride.co.ke'
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || 'customer123'
  const customerPhone = process.env.SEED_CUSTOMER_PHONE || '254711111111'
  const customerName = process.env.SEED_CUSTOMER_NAME || 'Demo Customer'

  // Create super admin user (Platform Manager)
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.SUPER_ADMIN },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      phone: adminPhone,
    },
  })
  console.log('[SUCCESS] Super Admin user created:', admin.email)

  // Create store admin user (Client / Store Owner)
  const ownerEmail = 'owner@stride.co.ke'
  const ownerPassword = 'owner123'
  const ownerPasswordHash = await bcrypt.hash(ownerPassword, 12)
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { role: UserRole.ADMIN },
    create: {
      email: ownerEmail,
      name: 'Store Owner',
      passwordHash: ownerPasswordHash,
      role: UserRole.ADMIN,
      phone: '254722222222',
    },
  })
  console.log('[SUCCESS] Store Owner Admin user created:', owner.email)

  // Create demo customer
  const customerPasswordHash = await bcrypt.hash(customerPassword, 12)
  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      name: customerName,
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      phone: customerPhone,
    },
  })
  console.log('[SUCCESS] Demo customer created:', customer.email)

  // Create additional regular users
  const user2Password = await bcrypt.hash('user123', 12)
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@stride.co.ke' },
    update: {},
    create: {
      email: 'user2@stride.co.ke',
      name: 'John Doe',
      passwordHash: user2Password,
      role: UserRole.CUSTOMER,
      phone: '254722222222',
    },
  })
  console.log('[SUCCESS] User 2 created:', user2.email)

  const user3Password = await bcrypt.hash('user123', 12)
  const user3 = await prisma.user.upsert({
    where: { email: 'user3@stride.co.ke' },
    update: {},
    create: {
      email: 'user3@stride.co.ke',
      name: 'Jane Smith',
      passwordHash: user3Password,
      role: UserRole.CUSTOMER,
      phone: '254733333333',
    },
  })
  console.log('[SUCCESS] User 3 created:', user3.email)

  const user4Password = await bcrypt.hash('user123', 12)
  const user4 = await prisma.user.upsert({
    where: { email: 'user4@stride.co.ke' },
    update: {},
    create: {
      email: 'user4@stride.co.ke',
      name: 'Mike Johnson',
      passwordHash: user4Password,
      role: UserRole.CUSTOMER,
      phone: '254744444444',
    },
  })
  console.log('[SUCCESS] User 4 created:', user4.email)

  // Create brands
  // brands[0]=Nike, brands[1]=Adidas, brands[2]=Puma, brands[3]=New Balance,
  // brands[4]=African Footwear Co., brands[5]=Birkenstock, brands[6]=Clarks, brands[7]=Timberland
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'nike' },
      update: {},
      create: { name: 'Nike', slug: 'nike', description: 'Just Do It', isFeatured: true, sortOrder: 1 },
    }),
    prisma.brand.upsert({
      where: { slug: 'adidas' },
      update: {},
      create: { name: 'Adidas', slug: 'adidas', description: 'Impossible is Nothing', isFeatured: true, sortOrder: 2 },
    }),
    prisma.brand.upsert({
      where: { slug: 'puma' },
      update: {},
      create: { name: 'Puma', slug: 'puma', description: 'Forever Faster', isFeatured: true, sortOrder: 3 },
    }),
    prisma.brand.upsert({
      where: { slug: 'new-balance' },
      update: {},
      create: { name: 'New Balance', slug: 'new-balance', description: 'Fearlessly Independent', isFeatured: false, sortOrder: 4 },
    }),
    prisma.brand.upsert({
      where: { slug: 'african-footwear' },
      update: {},
      create: { name: 'African Footwear Co.', slug: 'african-footwear', description: 'Handcrafted in Kenya', isFeatured: true, sortOrder: 5 },
    }),
    prisma.brand.upsert({
      where: { slug: 'birkenstock' },
      update: {},
      create: { name: 'Birkenstock', slug: 'birkenstock', description: 'The Original Footbed', isFeatured: false, sortOrder: 6 },
    }),
    prisma.brand.upsert({
      where: { slug: 'clarks' },
      update: {},
      create: { name: 'Clarks', slug: 'clarks', description: 'Life is a Journey', isFeatured: false, sortOrder: 7 },
    }),
    prisma.brand.upsert({
      where: { slug: 'timberland' },
      update: {},
      create: { name: 'Timberland', slug: 'timberland', description: 'Built for the Bold', isFeatured: true, sortOrder: 8 },
    }),
  ])
  console.log('[SUCCESS] Brands created:', brands.length)

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
  console.log('[SUCCESS] Categories created:', categories.length)

  // Create default warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: { name: 'Main Warehouse', code: 'MAIN', city: 'Nairobi', country: 'KE', isActive: true },
  })
  console.log('[SUCCESS] Warehouse created')

  // Create products with image URLs through local API proxy
  const IMAGE_BASE_URL = '/api/images/'
  
  const productsData = [
    {
      name: 'Air Jordan 4 Retro Black Red',
      slug: 'air-jordan-4-retro-black-red',
      brand: brands[0], // Nike
      category: categories[0], // Sneakers
      shortDescription: 'Classic Air Jordan 4 in black and red colorway',
      description: 'The Air Jordan 4 Retro brings back the classic silhouette with premium materials and iconic design. Features the signature mesh panels, plastic wing eyelets, and visible Air unit.',
      basePrice: 4500,
      salePrice: 3900,
      costPrice: 2500,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: true,
      weightKg: 0.85,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Black/Red', colourHex: '#000000', sku: 'AJ4-BLK-RED-40', quantity: 10 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Black/Red', colourHex: '#000000', sku: 'AJ4-BLK-RED-41', quantity: 15 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Black/Red', colourHex: '#000000', sku: 'AJ4-BLK-RED-42', quantity: 12 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Black/Red', colourHex: '#000000', sku: 'AJ4-BLK-RED-43', quantity: 8 },
      ],
      images: [`${IMAGE_BASE_URL}Air Jordan 4 Retro-black-red.jpg`],
    },
    {
      name: 'Air Jordan 4 Retro Green White',
      slug: 'air-jordan-4-retro-green-white',
      brand: brands[0], // Nike
      category: categories[0], // Sneakers
      shortDescription: 'Fresh Air Jordan 4 in green and white colorway',
      description: 'A fresh take on the classic Air Jordan 4 with a clean green and white colorway. Features premium leather upper, mesh panels, and the iconic Air-Sole unit.',
      basePrice: 4500,
      salePrice: 3900,
      costPrice: 2500,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: true,
      weightKg: 0.85,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Green/White', colourHex: '#4CAF50', sku: 'AJ4-GRN-WHT-40', quantity: 8 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Green/White', colourHex: '#4CAF50', sku: 'AJ4-GRN-WHT-41', quantity: 12 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Green/White', colourHex: '#4CAF50', sku: 'AJ4-GRN-WHT-42', quantity: 10 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Green/White', colourHex: '#4CAF50', sku: 'AJ4-GRN-WHT-43', quantity: 6 },
      ],
      images: [`${IMAGE_BASE_URL}Air Jordan 4 Retro-green-white.jpg`],
    },
    {
      name: 'Air Jordan 4 Retro White',
      slug: 'air-jordan-4-retro-white',
      brand: brands[0], // Nike
      category: categories[0], // Sneakers
      shortDescription: 'Clean Air Jordan 4 in all-white colorway',
      description: 'The Air Jordan 4 Retro in a clean all-white colorway. Features premium leather construction, mesh panels for breathability, and the signature Air cushioning.',
      basePrice: 4500,
      salePrice: 3900,
      costPrice: 2500,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: false,
      weightKg: 0.85,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'White', colourHex: '#FFFFFF', sku: 'AJ4-WHT-40', quantity: 12 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'White', colourHex: '#FFFFFF', sku: 'AJ4-WHT-41', quantity: 18 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'White', colourHex: '#FFFFFF', sku: 'AJ4-WHT-42', quantity: 15 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'White', colourHex: '#FFFFFF', sku: 'AJ4-WHT-43', quantity: 10 },
      ],
      images: [`${IMAGE_BASE_URL}Air Jordan 4 Retro-white.jpg`],
    },
    {
      name: 'Adidas Running Shoes',
      slug: 'adidas-running-shoes',
      brand: brands[1], // Adidas
      category: categories[0], // Sneakers
      shortDescription: 'Comfortable Adidas running shoes',
      description: 'Lightweight and responsive Adidas running shoes designed for daily training. Features breathable mesh upper and cushioned midsole for all-day comfort.',
      basePrice: 2500,
      salePrice: 2100,
      costPrice: 1200,
      gender: GenderCategory.UNISEX,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: false,
      weightKg: 0.7,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Black', colourHex: '#000000', sku: 'AD-RUN-BLK-40', quantity: 15 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Black', colourHex: '#000000', sku: 'AD-RUN-BLK-41', quantity: 20 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Black', colourHex: '#000000', sku: 'AD-RUN-BLK-42', quantity: 18 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Black', colourHex: '#000000', sku: 'AD-RUN-BLK-43', quantity: 12 },
      ],
      images: [`${IMAGE_BASE_URL}addidas.jpg`],
    },
    {
      name: 'Nike Air Max',
      slug: 'nike-air-max',
      brand: brands[0], // Nike
      category: categories[0], // Sneakers
      shortDescription: 'Classic Nike Air Max with visible Air unit',
      description: 'The Nike Air Max features visible Air cushioning for maximum comfort and style. Perfect for everyday wear with its breathable upper and responsive cushioning.',
      basePrice: 3500,
      salePrice: 3000,
      costPrice: 1800,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: true,
      weightKg: 0.8,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM-BLK-40', quantity: 14 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM-BLK-41', quantity: 18 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM-BLK-42', quantity: 16 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Black/White', colourHex: '#000000', sku: 'NK-AM-BLK-43', quantity: 10 },
      ],
      images: [`${IMAGE_BASE_URL}airmax.jpg`],
    },
    {
      name: 'Nike Air Red Black',
      slug: 'nike-air-red-black',
      brand: brands[0], // Nike
      category: categories[0], // Sneakers
      shortDescription: 'Bold Nike Air in red and black',
      description: 'Make a statement with these bold Nike Air shoes in red and black. Features premium materials, responsive cushioning, and eye-catching design.',
      basePrice: 3200,
      salePrice: 2800,
      costPrice: 1600,
      gender: GenderCategory.UNISEX,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: true,
      weightKg: 0.75,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Red/Black', colourHex: '#FF0000', sku: 'NK-AIR-RB-40', quantity: 10 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Red/Black', colourHex: '#FF0000', sku: 'NK-AIR-RB-41', quantity: 15 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Red/Black', colourHex: '#FF0000', sku: 'NK-AIR-RB-42', quantity: 12 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Red/Black', colourHex: '#FF0000', sku: 'NK-AIR-RB-43', quantity: 8 },
      ],
      images: [`${IMAGE_BASE_URL}air_red_black.jpg`],
    },
    {
      name: 'Birkenstock Sandals',
      slug: 'birkenstock-sandals',
      brand: brands[5], // Birkenstock
      category: categories[3], // Sandals
      shortDescription: 'Comfortable Birkenstock sandals',
      description: 'Classic Birkenstock sandals with contoured footbed for ultimate comfort. Made with premium leather and adjustable straps for a perfect fit.',
      basePrice: 1800,
      salePrice: 1500,
      costPrice: 1000,
      gender: GenderCategory.UNISEX,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: false,
      weightKg: 0.5,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Brown', colourHex: '#8B4513', sku: 'BK-SAN-BRN-40', quantity: 20 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Brown', colourHex: '#8B4513', sku: 'BK-SAN-BRN-41', quantity: 25 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Brown', colourHex: '#8B4513', sku: 'BK-SAN-BRN-42', quantity: 22 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Brown', colourHex: '#8B4513', sku: 'BK-SAN-BRN-43', quantity: 18 },
      ],
      images: [`${IMAGE_BASE_URL}Birkenstocks.jpg`],
    },
    {
      name: 'Clarks Originals Trek Wedge',
      slug: 'clarks-originals-trek-wedge',
      brand: brands[6], // Clarks
      category: categories[0], // Sneakers
      shortDescription: 'Stylish Clarks Originals with wedge sole',
      description: 'Clarks Originals Trek Wedge shoes combine classic styling with modern comfort. Features premium leather upper and comfortable wedge sole.',
      basePrice: 2800,
      salePrice: 2400,
      costPrice: 1400,
      gender: GenderCategory.WOMEN,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: false,
      weightKg: 0.9,
      variants: [
        { size: '37', sizeEu: '37', sizeUs: '6', sizeUk: '4', colour: 'Black', colourHex: '#000000', sku: 'CL-TWK-BLK-37', quantity: 10 },
        { size: '38', sizeEu: '38', sizeUs: '7', sizeUk: '5', colour: 'Black', colourHex: '#000000', sku: 'CL-TWK-BLK-38', quantity: 15 },
        { size: '39', sizeEu: '39', sizeUs: '8', sizeUk: '6', colour: 'Black', colourHex: '#000000', sku: 'CL-TWK-BLK-39', quantity: 12 },
        { size: '40', sizeEu: '40', sizeUs: '9', sizeUk: '7', colour: 'Black', colourHex: '#000000', sku: 'CL-TWK-BLK-40', quantity: 8 },
      ],
      images: [`${IMAGE_BASE_URL}Clarks Originals Black Trek Wedge Shoes.jpg`],
    },
    {
      name: 'Timberland Brown Boots',
      slug: 'timberland-brown-boots',
      brand: brands[7], // Timberland
      category: categories[2], // Boots
      shortDescription: 'Classic Timberland boots in brown',
      description: 'Iconic Timberland boots with premium waterproof leather, padded collar, and durable rubber outsole. Perfect for outdoor adventures.',
      basePrice: 4200,
      salePrice: 3600,
      costPrice: 2200,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: true,
      weightKg: 1.2,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Brown', colourHex: '#8B4513', sku: 'TM-BRN-BRN-40', quantity: 12 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Brown', colourHex: '#8B4513', sku: 'TM-BRN-BRN-41', quantity: 16 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Brown', colourHex: '#8B4513', sku: 'TM-BRN-BRN-42', quantity: 14 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Brown', colourHex: '#8B4513', sku: 'TM-BRN-BRN-43', quantity: 10 },
      ],
      images: [`${IMAGE_BASE_URL}Timberland-brown.jpg`],
    },
    {
      name: 'Timberland White Boots',
      slug: 'timberland-white-boots',
      brand: brands[7], // Timberland
      category: categories[2], // Boots
      shortDescription: 'Fresh Timberland boots in white',
      description: 'Stand out with these fresh white Timberland boots. Features premium waterproof leather, padded collar, and durable rubber outsole.',
      basePrice: 4200,
      salePrice: 3600,
      costPrice: 2200,
      gender: GenderCategory.UNISEX,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: true,
      weightKg: 1.2,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'White', colourHex: '#FFFFFF', sku: 'TM-WHT-WHT-40', quantity: 8 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'White', colourHex: '#FFFFFF', sku: 'TM-WHT-WHT-41', quantity: 12 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'White', colourHex: '#FFFFFF', sku: 'TM-WHT-WHT-42', quantity: 10 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'White', colourHex: '#FFFFFF', sku: 'TM-WHT-WHT-43', quantity: 6 },
      ],
      images: [`${IMAGE_BASE_URL}Timberland-white.jpg`],
    },
    {
      name: 'Vintage Leather Worker Boot',
      slug: 'vintage-leather-worker-boot',
      brand: brands[4], // African Footwear Co.
      category: categories[2], // Boots
      shortDescription: 'Handcrafted vintage leather work boots',
      description: 'Handcrafted vintage leather work boots made with premium materials. Features durable construction, comfortable fit, and timeless style.',
      basePrice: 3000,
      costPrice: 1500,
      gender: GenderCategory.MEN,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: false,
      isLimitedEdition: true,
      weightKg: 1.3,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Brown', colourHex: '#8B4513', sku: 'VL-WRK-BRN-40', quantity: 5 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Brown', colourHex: '#8B4513', sku: 'VL-WRK-BRN-41', quantity: 8 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Brown', colourHex: '#8B4513', sku: 'VL-WRK-BRN-42', quantity: 6 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Brown', colourHex: '#8B4513', sku: 'VL-WRK-BRN-43', quantity: 4 },
      ],
      images: [`${IMAGE_BASE_URL}Vintage Leather Worker Boot.jpg`],
    },
    {
      name: 'Black Heels',
      slug: 'black-heels',
      brand: brands[4], // African Footwear Co.
      category: categories[1], // Formal Shoes
      shortDescription: 'Elegant black heels',
      description: 'Elegant black heels perfect for formal occasions. Features premium leather, comfortable heel height, and timeless design.',
      basePrice: 2200,
      salePrice: 1800,
      costPrice: 1000,
      gender: GenderCategory.WOMEN,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: false,
      weightKg: 0.6,
      variants: [
        { size: '37', sizeEu: '37', sizeUs: '6', sizeUk: '4', colour: 'Black', colourHex: '#000000', sku: 'BL-HL-BLK-37', quantity: 15 },
        { size: '38', sizeEu: '38', sizeUs: '7', sizeUk: '5', colour: 'Black', colourHex: '#000000', sku: 'BL-HL-BLK-38', quantity: 20 },
        { size: '39', sizeEu: '39', sizeUs: '8', sizeUk: '6', colour: 'Black', colourHex: '#000000', sku: 'BL-HL-BLK-39', quantity: 18 },
        { size: '40', sizeEu: '40', sizeUs: '9', sizeUk: '7', colour: 'Black', colourHex: '#000000', sku: 'BL-HL-BLK-40', quantity: 12 },
      ],
      images: [`${IMAGE_BASE_URL}black_heels.jpg`],
    },
    {
      name: 'Brown Boots',
      slug: 'brown-boots',
      brand: brands[4], // African Footwear Co.
      category: categories[2], // Boots
      shortDescription: 'Classic brown boots',
      description: 'Classic brown boots made with premium leather. Features durable construction, comfortable fit, and versatile style.',
      basePrice: 2600,
      salePrice: 2200,
      costPrice: 1400,
      gender: GenderCategory.UNISEX,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: false,
      weightKg: 1.1,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Brown', colourHex: '#8B4513', sku: 'BR-BT-BRN-40', quantity: 12 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Brown', colourHex: '#8B4513', sku: 'BR-BT-BRN-41', quantity: 16 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Brown', colourHex: '#8B4513', sku: 'BR-BT-BRN-42', quantity: 14 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Brown', colourHex: '#8B4513', sku: 'BR-BT-BRN-43', quantity: 10 },
      ],
      images: [`${IMAGE_BASE_URL}boots_brown.jpg`],
    },
    {
      name: 'Grey Sneakers',
      slug: 'grey-sneakers',
      brand: brands[0], // Nike
      category: categories[0], // Sneakers
      shortDescription: 'Comfortable grey sneakers',
      description: 'Comfortable grey sneakers perfect for everyday wear. Features breathable upper, cushioned sole, and versatile design.',
      basePrice: 2000,
      salePrice: 1600,
      costPrice: 1000,
      gender: GenderCategory.UNISEX,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isTrending: false,
      weightKg: 0.7,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Grey', colourHex: '#808080', sku: 'GR-SNK-GRY-40', quantity: 18 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Grey', colourHex: '#808080', sku: 'GR-SNK-GRY-41', quantity: 22 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Grey', colourHex: '#808080', sku: 'GR-SNK-GRY-42', quantity: 20 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Grey', colourHex: '#808080', sku: 'GR-SNK-GRY-43', quantity: 14 },
      ],
      images: [`${IMAGE_BASE_URL}grey_sneakers.jpg`],
    },
    {
      name: 'Gucci Women Shoes',
      slug: 'gucci-women-shoes',
      brand: brands[4], // African Footwear Co. (will use as placeholder)
      category: categories[1], // Formal Shoes
      shortDescription: 'Elegant Gucci women shoes',
      description: 'Elegant Gucci women shoes featuring premium materials and sophisticated design. Perfect for special occasions.',
      basePrice: 5500,
      salePrice: 4800,
      costPrice: 3000,
      gender: GenderCategory.WOMEN,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: true,
      isLimitedEdition: true,
      weightKg: 0.8,
      variants: [
        { size: '37', sizeEu: '37', sizeUs: '6', sizeUk: '4', colour: 'Black', colourHex: '#000000', sku: 'GC-WMN-BLK-37', quantity: 5 },
        { size: '38', sizeEu: '38', sizeUs: '7', sizeUk: '5', colour: 'Black', colourHex: '#000000', sku: 'GC-WMN-BLK-38', quantity: 8 },
        { size: '39', sizeEu: '39', sizeUs: '8', sizeUk: '6', colour: 'Black', colourHex: '#000000', sku: 'GC-WMN-BLK-39', quantity: 6 },
        { size: '40', sizeEu: '40', sizeUs: '9', sizeUk: '7', colour: 'Black', colourHex: '#000000', sku: 'GC-WMN-BLK-40', quantity: 4 },
      ],
      images: [`${IMAGE_BASE_URL}gucci-women-shows.jpg`],
    },
    {
      name: 'Nike Slides',
      slug: 'nike-slides',
      brand: brands[0], // Nike
      category: categories[3], // Sandals
      shortDescription: 'Comfortable Nike slides',
      description: 'Comfortable Nike slides perfect for lounging or poolside. Features soft synthetic upper and cushioned footbed.',
      basePrice: 1000,
      salePrice: 850,
      costPrice: 500,
      gender: GenderCategory.UNISEX,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      isTrending: false,
      weightKg: 0.4,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Black', colourHex: '#000000', sku: 'NK-SLD-BLK-40', quantity: 25 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Black', colourHex: '#000000', sku: 'NK-SLD-BLK-41', quantity: 30 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Black', colourHex: '#000000', sku: 'NK-SLD-BLK-42', quantity: 28 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Black', colourHex: '#000000', sku: 'NK-SLD-BLK-43', quantity: 22 },
      ],
      images: [`${IMAGE_BASE_URL}nike_slides.jpg`],
    },
    {
      name: 'Prada Palms Shoes',
      slug: 'prada-palms-shoes',
      brand: brands[4], // African Footwear Co. (will use as placeholder)
      category: categories[1], // Formal Shoes
      shortDescription: 'Stylish Prada palm print shoes',
      description: 'Stylish Prada shoes featuring unique palm print design. Made with premium materials and sophisticated craftsmanship.',
      basePrice: 6500,
      salePrice: 5800,
      costPrice: 3500,
      gender: GenderCategory.MEN,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: true,
      isLimitedEdition: true,
      weightKg: 0.9,
      variants: [
        { size: '40', sizeEu: '40', sizeUs: '7', sizeUk: '6', colour: 'Multi', colourHex: '#000000', sku: 'PR-PLM-MLT-40', quantity: 3 },
        { size: '41', sizeEu: '41', sizeUs: '8', sizeUk: '7', colour: 'Multi', colourHex: '#000000', sku: 'PR-PLM-MLT-41', quantity: 5 },
        { size: '42', sizeEu: '42', sizeUs: '9', sizeUk: '8', colour: 'Multi', colourHex: '#000000', sku: 'PR-PLM-MLT-42', quantity: 4 },
        { size: '43', sizeEu: '43', sizeUs: '10', sizeUk: '9', colour: 'Multi', colourHex: '#000000', sku: 'PR-PLM-MLT-43', quantity: 2 },
      ],
      images: [`${IMAGE_BASE_URL}prada_palms.jpg`],
    },
  ]

  for (const productData of productsData) {
    const { variants, images, brand, category, ...productInfo } = productData
    
    const product = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      update: {
        ...productInfo,
        brandId: brand.id,
        categoryId: category.id,
        status: ProductStatus.ACTIVE,
        publishedAt: new Date(),
      },
      create: {
        ...productInfo,
        brandId: brand.id,
        categoryId: category.id,
        status: ProductStatus.ACTIVE,
        publishedAt: new Date(),
      },
    })

    // Delete existing images for this product
    await prisma.productImage.deleteMany({ where: { productId: product.id } })

    // Create product images
    for (const [index, imageUrl] of images.entries()) {
      await prisma.productImage.create({
        data: { productId: product.id, url: imageUrl, altText: product.name, isPrimary: index === 0, sortOrder: index },
      })
    }

    // Delete existing variants for this product
    const existingVariants = await prisma.productVariant.findMany({ where: { productId: product.id } })
    const existingVariantIds = existingVariants.map(v => v.id)
    
    // Delete inventory for existing variants
    if (existingVariantIds.length > 0) {
      await prisma.inventory.deleteMany({ where: { variantId: { in: existingVariantIds } } })
    }
    
    // Delete existing variants
    await prisma.productVariant.deleteMany({ where: { productId: product.id } })

    // Create variants and inventory
    for (const variantData of variants) {
      const { quantity, ...variantInfo } = variantData
      
      const variant = await prisma.productVariant.create({
        data: {
          ...variantInfo,
          productId: product.id,
          basePrice: productInfo.basePrice,
          salePrice: productInfo.salePrice,
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

    console.log(`[SUCCESS] Product created: ${product.name} with ${variants.length} variants`)
  }

  // Create banners with image URLs through local API proxy
  await prisma.banner.upsert({
    where: { id: 'hero-banner-1' },
    update: {
      desktopImageUrl: `${IMAGE_BASE_URL}Air Jordan 4 Retro-black-red.jpg`,
      mobileImageUrl: `${IMAGE_BASE_URL}Air Jordan 4 Retro-black-red.jpg`,
    },
    create: {
      id: 'hero-banner-1',
      title: 'Step Into Luxury',
      subtitle: 'Discover premium footwear from global and local brands',
      ctaText: 'Shop Collection',
      ctaUrl: '/products',
      desktopImageUrl: `${IMAGE_BASE_URL}Air Jordan 4 Retro-black-red.jpg`,
      mobileImageUrl: `${IMAGE_BASE_URL}Air Jordan 4 Retro-black-red.jpg`,
      placement: 'hero',
      isActive: true,
      sortOrder: 1,
    },
  })
  console.log('[SUCCESS] Banners created')

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
  console.log('[SUCCESS] CMS pages created')

  console.log('[DONE] Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('[ERROR] Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })