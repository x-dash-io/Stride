import { Product } from '../types'

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Low-Top',
    brand: 'Stride Elite',
    category: 'sneakers',
    price: 285,
    salePrice: 199,
    description: 'Handcrafted premium leather sneakers with minimalist design',
    details: 'Italian leather upper with leather insole, memory foam padding',
    materials: ['Italian Leather', 'Rubber Sole', 'Memory Foam'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Navy', hex: '#001F3F' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: false },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-1.jpg', alt: 'Premium Leather Low-Top' },
      { url: '/placeholder-shoe-1b.jpg', alt: 'Premium Leather Low-Top Side' },
    ],
    rating: 4.8,
    reviewCount: 127,
    inStock: true,
    skuId: 'SE-PLL-001',
    tags: ['bestseller', 'casual', 'leather'],
  },
  {
    id: '2',
    name: 'Performance Athletic Runner',
    brand: 'RunTech Pro',
    category: 'athletic',
    price: 195,
    description: 'Advanced performance running shoes with responsive cushioning',
    details: 'Engineered mesh with responsive midsole technology',
    materials: ['Technical Mesh', 'EVA Midsole', 'Carbon Fiber Plate'],
    colors: [
      { name: 'Carbon', hex: '#2A2A2A' },
      { name: 'Electric Blue', hex: '#0064D9' },
      { name: 'Sunset Orange', hex: '#FF6B35' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-2.jpg', alt: 'Performance Athletic Runner' },
    ],
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    skuId: 'RT-PAR-002',
    tags: ['athletic', 'trending', 'performance'],
  },
  {
    id: '3',
    name: 'Classic Formal Oxford',
    brand: 'Heritage Shoes',
    category: 'formal',
    price: 325,
    description: 'Timeless oxford shoes perfect for formal occasions',
    details: 'Premium full-grain leather with Goodyear welt construction',
    materials: ['Full-Grain Leather', 'Leather Sole', 'Cork Insert'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Brown', hex: '#8B4513' },
      { name: 'Oxblood', hex: '#4B0000' },
    ],
    sizes: [
      { size: '6', available: false },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-3.jpg', alt: 'Classic Formal Oxford' },
    ],
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    skuId: 'HS-CFO-003',
    tags: ['formal', 'luxury', 'classic'],
  },
  {
    id: '4',
    name: 'Urban Lifestyle High-Top',
    brand: 'City Vibes',
    category: 'casual',
    price: 165,
    salePrice: 115,
    description: 'Street-style high-top shoes with bold design',
    details: 'Canvas and suede mix with distinctive side patch',
    materials: ['Canvas', 'Suede', 'Rubber Sole'],
    colors: [
      { name: 'Cream', hex: '#FFFDD0' },
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Red', hex: '#E63946' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: false },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-4.jpg', alt: 'Urban Lifestyle High-Top' },
    ],
    rating: 4.5,
    reviewCount: 94,
    inStock: true,
    skuId: 'CV-ULH-004',
    tags: ['casual', 'trendy', 'urban'],
  },
  {
    id: '5',
    name: 'Desert Boot Premium',
    brand: 'Heritage Shoes',
    category: 'boots',
    price: 295,
    description: 'Iconic desert boot in premium leather',
    details: 'Crepe rubber sole with breathable suede construction',
    materials: ['Suede', 'Crepe Rubber', 'Linen Lining'],
    colors: [
      { name: 'Sand', hex: '#C2B280' },
      { name: 'Beeswax', hex: '#D4A57B' },
      { name: 'Olive', hex: '#808000' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-5.jpg', alt: 'Desert Boot Premium' },
    ],
    rating: 4.7,
    reviewCount: 112,
    inStock: true,
    skuId: 'HS-DBP-005',
    tags: ['boots', 'classic', 'versatile'],
  },
  {
    id: '6',
    name: 'Minimalist Slip-On',
    brand: 'Simple & Co',
    category: 'casual',
    price: 145,
    description: 'Effortless slip-on shoes for everyday wear',
    details: 'Engineered knit upper with elastic gore for easy on-off',
    materials: ['Knit Textile', 'Elastic Gore', 'Rubber Sole'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#000000' },
      { name: 'Gray', hex: '#808080' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-6.jpg', alt: 'Minimalist Slip-On' },
    ],
    rating: 4.4,
    reviewCount: 78,
    inStock: true,
    skuId: 'SC-MSO-006',
    tags: ['casual', 'minimalist', 'comfort'],
  },
  {
    id: '7',
    name: 'Luxury Premium Loafer',
    brand: 'Stride Elite',
    category: 'formal',
    price: 495,
    description: 'Handcrafted Italian loafers with premium details',
    details: 'Full-grain leather with hand-stitched details and rubber insert',
    materials: ['Italian Full-Grain Leather', 'Rubber Insert', 'Leather Sole'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Tan', hex: '#D2B48C' },
    ],
    sizes: [
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-7.jpg', alt: 'Luxury Premium Loafer' },
    ],
    rating: 4.9,
    reviewCount: 203,
    inStock: true,
    skuId: 'SE-LPL-007',
    tags: ['luxury', 'formal', 'bestseller'],
  },
  {
    id: '8',
    name: 'Trail Hiking Boot',
    brand: 'OutdoorGear Elite',
    category: 'boots',
    price: 235,
    description: 'All-terrain hiking boot with superior grip',
    details: 'Waterproof membrane with aggressive tread pattern',
    materials: ['Waterproof Nylon', 'Vibram Sole', 'Cushioned Collar'],
    colors: [
      { name: 'Mountain Gray', hex: '#708090' },
      { name: 'Forest Green', hex: '#228B22' },
      { name: 'Rust Brown', hex: '#8B4513' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-8.jpg', alt: 'Trail Hiking Boot' },
    ],
    rating: 4.7,
    reviewCount: 134,
    inStock: true,
    skuId: 'OE-THB-008',
    tags: ['boots', 'outdoor', 'hiking'],
  },
  {
    id: '9',
    name: 'Basketball Court Pro',
    brand: 'RunTech Pro',
    category: 'athletic',
    price: 215,
    salePrice: 159,
    description: 'Professional basketball shoes with ankle support',
    details: 'High-tech cushioning with reinforced ankle cage',
    materials: ['Synthetic Leather', 'Air Cushioning', 'Rubber Sole'],
    colors: [
      { name: 'Black/Gold', hex: '#000000' },
      { name: 'White/Red', hex: '#FFFFFF' },
      { name: 'Deep Blue', hex: '#00008B' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-9.jpg', alt: 'Basketball Court Pro' },
    ],
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    skuId: 'RT-BCP-009',
    tags: ['athletic', 'basketball', 'performance'],
  },
  {
    id: '10',
    name: 'Vintage Style Retro Sneaker',
    brand: 'Retro Collective',
    category: 'sneakers',
    price: 175,
    description: '70s-inspired sneaker with modern comfort technology',
    details: 'Canvas with rubber toe cap and cushioned collar',
    materials: ['Canvas', 'Rubber Toe Cap', 'Memory Foam'],
    colors: [
      { name: 'Off-White', hex: '#F5F5DC' },
      { name: 'Mustard', hex: '#FFDB58' },
      { name: 'Rust', hex: '#B7410E' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-10.jpg', alt: 'Vintage Style Retro Sneaker' },
    ],
    rating: 4.5,
    reviewCount: 76,
    inStock: true,
    skuId: 'RC-VSR-010',
    tags: ['sneakers', 'vintage', 'retro'],
  },
  {
    id: '11',
    name: 'Waterproof Chelsea Boot',
    brand: 'Heritage Shoes',
    category: 'boots',
    price: 385,
    description: 'Sophisticated waterproof Chelsea boot for all seasons',
    details: 'Premium leather with waterproof membrane and elastic sides',
    materials: ['Waterproof Leather', 'Elastic Panel', 'Leather Sole'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Chestnut', hex: '#A0522D' },
    ],
    sizes: [
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-11.jpg', alt: 'Waterproof Chelsea Boot' },
    ],
    rating: 4.8,
    reviewCount: 145,
    inStock: true,
    skuId: 'HS-WCB-011',
    tags: ['boots', 'waterproof', 'sophisticated'],
  },
  {
    id: '12',
    name: 'Casual Canvas Trainer',
    brand: 'City Vibes',
    category: 'casual',
    price: 125,
    description: 'Lightweight canvas trainer for everyday casual wear',
    details: 'Durable canvas with reinforced stitching and cushioned insole',
    materials: ['Canvas', 'Rubber Sole', 'Cushioned Insole'],
    colors: [
      { name: 'Navy', hex: '#000080' },
      { name: 'Khaki', hex: '#C3B091' },
      { name: 'Sage Green', hex: '#9DC183' },
    ],
    sizes: [
      { size: '6', available: true },
      { size: '7', available: true },
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true },
      { size: '12', available: true },
    ],
    images: [
      { url: '/placeholder-shoe-12.jpg', alt: 'Casual Canvas Trainer' },
    ],
    rating: 4.3,
    reviewCount: 62,
    inStock: true,
    skuId: 'CV-CCT-012',
    tags: ['casual', 'canvas', 'comfortable'],
  },
]

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.brand.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
  )
}

export function filterProducts(filters: {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}): Product[] {
  return mockProducts.filter((product) => {
    if (filters.category && product.category !== filters.category)
      return false
    if (filters.brand && product.brand !== filters.brand) return false
    if (filters.minPrice && product.price < filters.minPrice) return false
    if (filters.maxPrice && product.price > filters.maxPrice) return false
    if (filters.inStock !== undefined && product.inStock !== filters.inStock)
      return false
    return true
  })
}
