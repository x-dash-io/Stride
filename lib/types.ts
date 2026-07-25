// Product types
export interface Product {
  id: string
  name: string
  brand: string
  category: 'sneakers' | 'casual' | 'formal' | 'athletic' | 'boots'
  price: number
  salePrice?: number
  description: string
  details: string
  materials: string[]
  colors: ProductColor[]
  sizes: ProductSize[]
  images: ProductImage[]
  rating: number
  reviewCount: number
  inStock: boolean
  skuId: string
  tags: string[]
}

export interface ProductColor {
  name: string
  hex: string
}

export interface ProductSize {
  size: string
  available: boolean
}

export interface ProductImage {
  url: string
  alt: string
}

// User types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  addresses: Address[]
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  createdAt: string
}

export interface Address {
  id: string
  type: 'shipping' | 'billing'
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

// Cart types
export interface CartItem {
  productId: string
  quantity: number
  selectedColor: string
  selectedSize: string
}

export interface Cart {
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
}

// Order types
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
  trackingNumber?: string
  createdAt: string
  estimatedDelivery: string
}

export interface OrderItem {
  productId: string
  productName: string
  brand: string
  price: number
  quantity: number
  color: string
  size: string
  image: string
}

// Review types
export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  helpful: number
  notHelpful: number
  verified: boolean
  createdAt: string
}

// Wishlist types
export interface WishlistItem {
  id: string
  productId: string
  userId: string
  addedAt: string
}

// Authentication types
export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

// Cart context types
export interface CartContextType {
  cart: Cart
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  applyPromo: (code: string) => void
}

// Wishlist context types
export interface WishlistContextType {
  items: WishlistItem[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}
