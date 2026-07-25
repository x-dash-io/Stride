import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem, Cart } from '@/types'
import { formatPrice } from '@/lib/utils'

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

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const calculateTotals = (cartData: Cart) => {
    const items = cartData.items || []
    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
    const tax = subtotal * 0.16
    const shipping = subtotal >= 10000 ? 0 : 500
    const total = subtotal + tax + shipping
    return { subtotal, tax, shipping, total, itemCount: items.reduce((sum, item) => sum + item.quantity, 0) }
  }

  const refreshCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        if (data.items) {
          setCart(data)
        }
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [])

  const addItem = async (variantId: string, quantity = 1) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    formData.append('quantity', String(quantity))

    const res = await fetch('/api/cart', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Failed to add item')
    await refreshCart()
  }

  const removeItem = async (variantId: string) => {
    const res = await fetch(`/api/cart/${variantId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to remove item')
    await refreshCart()
  }

  const updateQuantity = async (variantId: string, quantity: number) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    formData.append('quantity', String(quantity))

    const res = await fetch('/api/cart', { method: 'PATCH', body: formData })
    if (!res.ok) throw new Error('Failed to update quantity')
    await refreshCart()
  }

  const clearCart = async () => {
    const res = await fetch('/api/cart', { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to clear cart')
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