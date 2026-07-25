'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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

export interface User {
  id: string
  name: string
  email: string
  addresses: Address[]
  favorites: string[]
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  addToFavorites: (productId: string) => void
  removeFromFavorites: (productId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Demo authentication
    if (email === 'demo@example.com' && password === 'demo') {
      const demoUser: User = {
        id: 'user-1',
        name: 'John Doe',
        email: 'demo@example.com',
        addresses: [
          {
            id: 'addr-1',
            type: 'shipping',
            fullName: 'John Doe',
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            isDefault: true,
          },
        ],
        favorites: ['1', '3', '5'],
        createdAt: '2024-01-01',
      }
      setUser(demoUser)
      localStorage.setItem('auth_user', JSON.stringify(demoUser))
      return
    }

    throw new Error('Invalid email or password')
  }

  const register = async (name: string, email: string, password: string) => {
    // Demo registration
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      addresses: [],
      favorites: [],
      createdAt: new Date().toISOString(),
    }
    setUser(newUser)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const addToFavorites = (productId: string) => {
    if (!user) return
    const updated = {
      ...user,
      favorites: Array.from(new Set([...user.favorites, productId])),
    }
    setUser(updated)
    localStorage.setItem('auth_user', JSON.stringify(updated))
  }

  const removeFromFavorites = (productId: string) => {
    if (!user) return
    const updated = {
      ...user,
      favorites: user.favorites.filter((id) => id !== productId),
    }
    setUser(updated)
    localStorage.setItem('auth_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        addToFavorites,
        removeFromFavorites,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
