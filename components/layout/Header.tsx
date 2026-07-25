'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { useAuth } from '@/lib/contexts/auth-context'
import { ShoppingBag, Menu, X, User, LogOut } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'

export function Header() {
  const { cart } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container-max">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 group"
          >
            <div className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-primary group-hover:opacity-70 transition-opacity">
              STRIDE
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              About
            </Link>
            <Link
              href="/account"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Account
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-accent transition-colors"
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {cart.items.length > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-foreground hover:text-accent transition-colors"
                >
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded shadow-lg">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:inline text-sm font-medium text-primary bg-accent px-4 py-2 rounded hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-border py-4 space-y-4">
            <div className="px-4 pb-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Theme</p>
              <ThemeSwitcher />
            </div>
            <Link
              href="/products"
              className="block text-sm font-medium text-foreground hover:text-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="block text-sm font-medium text-foreground hover:text-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="block text-sm font-medium text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block text-sm font-medium text-primary bg-accent px-4 py-2 rounded hover:opacity-90 transition-opacity"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
