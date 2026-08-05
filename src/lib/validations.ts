import { z } from 'zod'
import { sanitizeInput, sanitizeEmail, sanitizeName, sanitizePhone, sanitizeText } from '@/lib/utils'

// Sanitization transformers
const sanitizedString = (minLength: number, maxLength: number) => 
  z.string()
    .min(minLength)
    .max(maxLength)
    .transform(val => sanitizeInput(val))

const sanitizedEmail = z.string()
  .email('Invalid email address')
  .transform(val => sanitizeEmail(val))

const sanitizedName = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .transform(val => sanitizeName(val))

const sanitizedPhone = z.string()
  .regex(/^254[0-9]{9}$/, 'Invalid Kenyan phone number (format: 2547XXXXXXXX)')
  .transform(val => sanitizePhone(val))

const sanitizedText = (minLength: number, maxLength: number) =>
  z.string()
    .min(minLength)
    .max(maxLength)
    .transform(val => sanitizeText(val))

const sanitizedOptionalText = (maxLength: number) =>
  z.string()
    .max(maxLength)
    .optional()
    .nullable()
    .transform(val => val ? sanitizeText(val) : val)

export const shippingAddressSchema = z.object({
  label: z.string().default('Home'),
  firstName: sanitizedName,
  lastName: sanitizedName,
  phone: sanitizedPhone,
  addressLine1: sanitizedText(5, 255),
  addressLine2: sanitizedOptionalText(255),
  city: sanitizedString(2, 100),
  state: sanitizedString(2, 100),
  postalCode: sanitizedString(2, 20),
  country: z.string().default('KE'),
  isDefault: z.boolean().default(false),
  isBilling: z.boolean().default(false),
  isShipping: z.boolean().default(true),
})

export const paymentSchema = z.object({
  paymentMethod: z.enum(['MPESA_STK_PUSH', 'CASH_ON_DELIVERY']),
  phoneNumber: sanitizedPhone.optional(),
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
  email: sanitizedEmail,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export type LoginInput = z.infer<typeof loginSchema>

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must include uppercase, lowercase and a number')

export const registerSchema = z.object({
  name: sanitizedName,
  email: sanitizedEmail,
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: sanitizedEmail,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  title: sanitizedOptionalText(255),
  body: sanitizedText(10, 5000),
  rating: z.number().int().min(1).max(5),
  sizeRating: z.number().int().min(1).max(5).optional(),
  comfortRating: z.number().int().min(1).max(5).optional(),
  qualityRating: z.number().int().min(1).max(5).optional(),
})

export const productCreateSchema = z.object({
  name: sanitizedString(3, 255),
  slug: sanitizedString(3, 280),
  brandId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  shortDescription: sanitizedOptionalText(500),
  description: sanitizedOptionalText(10000),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']),
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  currency: z.string().default('KES'),
  weightKg: z.number().positive().optional(),
  metaTitle: sanitizedOptionalText(255),
  metaDescription: sanitizedOptionalText(500),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isLimitedEdition: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('DRAFT'),
  publishedAt: z.string().datetime().optional(),
  variants: z.array(z.object({
    sku: sanitizedString(3, 100),
    size: sanitizedString(1, 50),
    sizeEu: sanitizedOptionalText(20),
    sizeUs: sanitizedOptionalText(20),
    sizeUk: sanitizedOptionalText(20),
    colour: sanitizedString(1, 100),
    colourHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    basePrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional(),
    quantity: z.number().int().min(0),
    gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).optional(),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
  })).optional(),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>

export const variantCreateSchema = z.object({
  productId: z.string().cuid(),
  sku: sanitizedString(3, 100),
  size: sanitizedString(1, 50),
  sizeUs: sanitizedOptionalText(20),
  sizeEu: sanitizedOptionalText(20),
  sizeUk: sanitizedOptionalText(20),
  colour: sanitizedString(1, 100),
  colourHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  colourSwatchUrl: z.string().url().optional(),
  material: sanitizedOptionalText(100),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).optional(),
  basePrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

export const bannerCreateSchema = z.object({
  title: sanitizedOptionalText(200),
  subtitle: sanitizedOptionalText(300),
  ctaText: sanitizedOptionalText(100),
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

export const shippingZoneSchema = z.object({
  name: sanitizedString(2, 255),
  description: sanitizedOptionalText(500),
  counties: z.array(z.string()).default([]),
  baseCost: z.number().nonnegative('Cost must be positive or zero'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const storeSettingsSchema = z.object({
  storeName: sanitizedString(2, 255),
  storeTagline: sanitizedOptionalText(500),
  logoUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  faviconUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').or(z.string().length(0)).optional().nullable(),
  contactEmail: z.string().email('Invalid email address').or(z.string().length(0)).optional().nullable(),
  contactPhone: sanitizedOptionalText(50),
  address: sanitizedOptionalText(500),
  instagramUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  facebookUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  tiktokUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  twitterUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  metaTitle: sanitizedOptionalText(255),
  metaDescription: sanitizedOptionalText(500),
})