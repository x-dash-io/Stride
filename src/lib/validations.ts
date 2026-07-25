import { z } from 'zod'

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^254[0-9]{9}$/, 'Invalid Kenyan phone number (format: 2547XXXXXXXX)'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'County/State is required'),
  postalCode: z.string().optional(),
  country: z.string().default('KE'),
})

export const paymentSchema = z.object({
  paymentMethod: z.enum(['MPESA_STK_PUSH', 'MPESA_PAYBILL', 'CASH_ON_DELIVERY']),
  phoneNumber: z.string().regex(/^254[0-9]{9}$/, 'Invalid Kenyan phone number').optional(),
})

export const addToCartSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99).default(1),
})

export const updateCartSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(0).max(99),
})

export const removeFromCartSchema = z.object({
  variantId: z.string().cuid(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  title: z.string().min(5).max(255).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters'),
  rating: z.number().int().min(1).max(5),
  sizeRating: z.number().int().min(1).max(5).optional(),
  comfortRating: z.number().int().min(1).max(5).optional(),
  qualityRating: z.number().int().min(1).max(5).optional(),
})

export const productCreateSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(3).max(280),
  brandId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']),
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  currency: z.string().default('KES'),
  weightKg: z.number().positive().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isLimitedEdition: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('DRAFT'),
})

export const variantCreateSchema = z.object({
  productId: z.string().cuid(),
  sku: z.string().min(3).max(100),
  size: z.string().min(1).max(50),
  sizeUs: z.string().max(20).optional(),
  sizeEu: z.string().max(20).optional(),
  sizeUk: z.string().max(20).optional(),
  colour: z.string().min(1).max(100),
  colourHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  colourSwatchUrl: z.string().url().optional(),
  material: z.string().max(100).optional(),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).optional(),
  basePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

export const bannerCreateSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(300).optional(),
  ctaText: z.string().max(100).optional(),
  ctaUrl: z.string().url().optional(),
  desktopImageUrl: z.string().url(),
  mobileImageUrl: z.string().url().optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  placement: z.string().default('hero'),
  isActive: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
})