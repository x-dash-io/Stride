import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem, Cart } from '@/types'
import { addToCart, updateCartQuantity, removeFromCart, clearCartAction, getCartAction } from '@/app/actions/cart'
import { calculateTax, calculateShipping, calculateGrandTotal } from '@/lib/pricing'

interface CartContextType {
  cart: Cart | null
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  itemCount: number
  isLoading: boolean
  addItem: (variantId: string, quantity: number) => Promise<void>
  removeItem: (variantId: string) => Promise<void>
  updateQuantity: (variantId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

function getInitialSessionId(): string {
  if (typeof window === 'undefined') return ''
  const stored = localStorage.getItem('cartSessionId')
  if (stored) return stored
  const newId = crypto.randomUUID()
  localStorage.setItem('cartSessionId', newId)
  return newId
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId] = useState(getInitialSessionId)

  const calculateTotals = (cartData: Cart) => {
    const items = cartData.items || []
    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
    const tax = calculateTax(subtotal)
    const shipping = calculateShipping(subtotal)
    const total = calculateGrandTotal(subtotal, shipping, tax)
    return { subtotal, tax, shipping, total, itemCount: items.reduce((sum, item) => sum + item.quantity, 0) }
  }

  const refreshCart = async () => {
    try {
      const data = await getCartAction(sessionId || undefined)
      if (data?.items) {
        setCart(data as unknown as Cart)
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [sessionId])

  const addItem = async (variantId: string, quantity = 1) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    formData.append('quantity', String(quantity))
    if (sessionId) formData.append('sessionId', sessionId)

    const result = await addToCart(formData)
    if ('error' in result) throw new Error(result.error as string)
    if ('sessionId' in result && result.sessionId && !sessionId) {
      localStorage.setItem('cartSessionId', result.sessionId)
    }
    await refreshCart()
  }

  const removeItem = async (variantId: string) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    if (sessionId) formData.append('sessionId', sessionId)

    const result = await removeFromCart(formData)
    if ('error' in result) throw new Error(result.error)
    if ('sessionId' in result && result.sessionId && !sessionId) {
      localStorage.setItem('cartSessionId', result.sessionId)
    }
    await refreshCart()
  }

  const updateQuantity = async (variantId: string, quantity: number) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    formData.append('quantity', String(quantity))
    if (sessionId) formData.append('sessionId', sessionId)

    const result = await updateCartQuantity(formData)
    if ('error' in result) throw new Error(result.error)
    if ('sessionId' in result && result.sessionId && !sessionId) {
      localStorage.setItem('cartSessionId', result.sessionId)
    }
    await refreshCart()
  }

  const clearCart = async () => {
    await clearCartAction(sessionId || undefined)
    await refreshCart()
  }

  const totals = cart ? calculateTotals(cart) : { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 }

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items || [],
        isLoading,
        refreshCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        ...totals,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}