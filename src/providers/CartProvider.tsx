'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react'
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
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (variantId: string, quantity?: number) => Promise<void>
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
  document.cookie = `cartSessionId=${newId};path=/;max-age=604800;samesite=lax`
  return newId
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [sessionId] = useState(getInitialSessionId)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), [])

  const calculateTotals = useCallback((cartData: Cart) => {
    const items = cartData.items || []
    // Recalculate from items to ensure accuracy, don't rely on stored totals
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = Number(item.unitPrice) || 0
      const itemQty = Number(item.quantity) || 0
      return sum + (itemPrice * itemQty)
    }, 0)
    const tax = calculateTax(subtotal)
    const shipping = calculateShipping(subtotal)
    const total = calculateGrandTotal(subtotal, shipping, tax)
    const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    return { subtotal, tax, shipping, total, itemCount }
  }, [])

  const refreshCart = useCallback(async () => {
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
  }, [sessionId])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    formData.append('quantity', String(quantity))
    if (sessionId) formData.append('sessionId', sessionId)

    try {
      const result = await addToCart(formData)
      if ('error' in result) {
        throw new Error(result.error as string)
      }
      if ('sessionId' in result && result.sessionId) {
        localStorage.setItem('cartSessionId', result.sessionId)
        document.cookie = `cartSessionId=${result.sessionId};path=/;max-age=604800;samesite=lax`
      }
      // Fetch complete cart with accurate prices from server immediately
      const data = await getCartAction(sessionId || undefined)
      if (data?.items) {
        setCart(data as unknown as Cart)
      }
    } catch (error) {
      await refreshCart()
      throw error
    }
  }, [sessionId])

  const removeItem = useCallback(async (variantId: string) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    if (sessionId) formData.append('sessionId', sessionId)

    try {
      const result = await removeFromCart(formData)
      if ('error' in result) {
        throw new Error(result.error)
      }
      if ('sessionId' in result && result.sessionId) {
        localStorage.setItem('cartSessionId', result.sessionId)
        document.cookie = `cartSessionId=${result.sessionId};path=/;max-age=604800;samesite=lax`
      }
      // Fetch complete cart with accurate totals from server
      const data = await getCartAction(sessionId || undefined)
      if (data?.items) {
        setCart(data as unknown as Cart)
      }
    } catch (error) {
      await refreshCart()
      throw error
    }
  }, [sessionId])

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    const formData = new FormData()
    formData.append('variantId', variantId)
    formData.append('quantity', String(quantity))
    if (sessionId) formData.append('sessionId', sessionId)

    try {
      const result = await updateCartQuantity(formData)
      if ('error' in result) {
        await refreshCart()
        throw new Error(result.error)
      }
      if ('sessionId' in result && result.sessionId) {
        localStorage.setItem('cartSessionId', result.sessionId)
        document.cookie = `cartSessionId=${result.sessionId};path=/;max-age=604800;samesite=lax`
      }
      // Refresh immediately for accurate totals
      await refreshCart()
    } catch (error) {
      await refreshCart()
      throw error
    }
  }, [sessionId, refreshCart])

  const clearCart = useCallback(async () => {
    await clearCartAction(sessionId || undefined)
    await refreshCart()
  }, [sessionId, refreshCart])

  const totals = useMemo(
    () => cart ? calculateTotals(cart) : { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 },
    [cart, calculateTotals]
  )

  const value = useMemo(() => ({
    cart,
    items: cart?.items || [],
    isLoading,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    refreshCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    ...totals,
  }), [cart, isLoading, isCartOpen, openCart, closeCart, toggleCart, refreshCart, addItem, removeItem, updateQuantity, clearCart, totals])

  return (
    <CartContext.Provider value={value}>
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