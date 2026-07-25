'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getProductById } from '@/lib/data/products'

export interface CartItem {
  productId: string
  quantity: number
  selectedColor: string
  selectedSize: string
}

interface CartContextType {
  cart: {
    items: CartItem[]
    subtotal: number
    tax: number
    shipping: number
    total: number
  }
  addItem: (
    productId: string,
    quantity: number,
    color: string,
    size: string
  ) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function calculateCart(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => {
    const product = getProductById(item.productId)
    if (!product) return sum
    const price = product.salePrice || product.price
    return sum + price * item.quantity
  }, 0)

  const tax = subtotal * 0.09
  const shipping = subtotal >= 200 ? 0 : 10
  const total = subtotal + tax + shipping

  return { subtotal, tax, shipping, total }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartCalc, setCartCalc] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 })

  // Initialize cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setItems(parsed)
        setCartCalc(calculateCart(parsed))
      } catch (e) {
        console.error('Failed to load cart:', e)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
    setCartCalc(calculateCart(items))
  }, [items])

  const addItem = (
    productId: string,
    quantity: number,
    color: string,
    size: string
  ) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.productId === productId &&
          item.selectedColor === color &&
          item.selectedSize === size
      )

      if (existingItem) {
        return prev.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [
        ...prev,
        {
          productId,
          quantity,
          selectedColor: color,
          selectedSize: size,
        },
      ]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        cart: {
          items,
          subtotal: cartCalc.subtotal,
          tax: cartCalc.tax,
          shipping: cartCalc.shipping,
          total: cartCalc.total,
        },
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
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
