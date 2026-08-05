export interface Product {
  id: string
  name: string
  slug: string
  brand: { id: string; name: string; slug: string; logoUrl?: string | null }
  category?: { id: string; name: string; slug: string } | null
  shortDescription?: string | null
  description?: string | null
  gender: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX'
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isLimitedEdition: boolean
  isTrending: boolean
  basePrice: number
  salePrice?: number | null
  currency: string
  weightKg?: number | null
  primaryImage?: string | null
  images: ProductImage[]
  variants: ProductVariant[]
  reviews?: Review[]
  collections?: { collection: { id: string; name: string; slug: string } }[]
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  variantId?: string | null
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
  isPrimary: boolean
  sortOrder: number
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  size: string
  sizeUs?: string | null
  sizeEu?: string | null
  sizeUk?: string | null
  colour: string
  colourHex?: string | null
  colourSwatchUrl?: string | null
  material?: string | null
  gender?: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX' | null
  basePrice?: number | null
  salePrice?: number | null
  weightKg?: number | null
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  images: ProductImage[]
  inventory: Inventory[]
  availableStock: number
  product?: Product
}

export interface Inventory {
  id: string
  variantId: string
  warehouseId: string
  quantityOnHand: number
  quantityReserved: number
  lowStockThreshold: number
  reorderPoint?: number | null
  reorderQuantity?: number | null
  locationAisle?: string | null
  locationShelf?: string | null
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  coverImageUrl?: string | null
  websiteUrl?: string | null
  originCountry?: string | null
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
}

export interface Category {
  id: string
  parentId?: string | null
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  icon?: string | null
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  level: number
  children?: Category[]
}

export interface CartItem {
  id: string
  cartId: string
  variantId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variant: ProductVariant
}

export interface Cart {
  id: string
  userId?: string | null
  sessionId?: string | null
  items: CartItem[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingTotal: number
  grandTotal: number
  currency: string
  expiresAt: string
}

export interface Address {
  id: string
  userId: string
  label: string
  firstName: string
  lastName: string
  phone?: string | null
  addressLine1: string
  addressLine2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  isDefault: boolean
  isBilling: boolean
  isShipping: boolean
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string | null
  email: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod | null
  currency: string
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingTotal: number
  grandTotal: number
  amountPaid: number
  shippingAddress?: Address | null
  billingAddress?: Address | null
  shippingMethod?: string | null
  shippingCarrier?: string | null
  trackingNumber?: string | null
  deliveryEstimate?: string | null
  deliveredAt?: string | null
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
  payments: PaymentTransaction[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string
  productName: string
  variantSku: string
  size?: string | null
  colour?: string | null
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  taxRate: number
  totalPrice: number
  productImage?: string | null
  isReturned: boolean
  returnedQty: number
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  fromStatus?: string | null
  toStatus: OrderStatus
  changedBy?: string | null
  note?: string | null
  createdAt: string
}

export interface PaymentTransaction {
  id: string
  orderId: string
  transactionId?: string | null
  paymentMethod: PaymentMethod
  amount: number
  currency: string
  status: string
  gatewayResponse?: Record<string, unknown>
  isRefund: boolean
  refundOf?: string | null
  createdAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  user?: { id: string; name?: string | null; image?: string | null }
  orderItemId?: string | null
  title?: string | null
  body: string
  rating: number
  isVerifiedPurchase: boolean
  isFeatured: boolean
  isApproved: boolean
  helpfulCount: number
  sizeRating?: number | null
  comfortRating?: number | null
  qualityRating?: number | null
  images: ReviewImage[]
  createdAt: string
  updatedAt: string
}

export interface ReviewImage {
  id: string
  reviewId: string
  url: string
  altText?: string | null
  sortOrder: number
}

export interface Wishlist {
  id: string
  userId: string
  name: string
  isPublic: boolean
  shareToken: string
  items: WishlistItem[]
}

export interface WishlistItem {
  id: string
  wishlistId: string
  variantId: string
  variant: ProductVariant
  note?: string | null
  priority: number
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string | null
  bannerUrl?: string | null
  bannerMobileUrl?: string | null
  isActive: boolean
  isFeatured: boolean
  startDate?: string | null
  endDate?: string | null
  sortOrder: number
  products?: { product: Product; sortOrder: number }[]
}

export interface Banner {
  id: string
  title?: string | null
  subtitle?: string | null
  ctaText?: string | null
  ctaUrl?: string | null
  desktopImageUrl: string
  mobileImageUrl?: string | null
  bgColor?: string | null
  textColor?: string | null
  placement: string
  isActive: boolean
  sortOrder: number
  startsAt?: string | Date | null
  endsAt?: string | Date | null
}

export interface CmsPage {
  id: string
  title: string
  slug: string
  content: string
  metaTitle?: string | null
  metaDescription?: string | null
  isPublished: boolean
  publishedAt?: string | null
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED'
  | 'ON_HOLD'

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export type PaymentMethod =
  | 'MPESA_STK_PUSH'
  | 'CASH_ON_DELIVERY'

export type GenderCategory = 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX'