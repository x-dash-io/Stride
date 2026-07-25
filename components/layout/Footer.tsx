import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">STRIDE</h3>
            <p className="text-sm opacity-80 mb-6">
              Premium footwear crafted for style and comfort.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@stride.com</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="opacity-80 hover:opacity-100 transition-opacity">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=sneakers" className="opacity-80 hover:opacity-100 transition-opacity">
                  Sneakers
                </Link>
              </li>
              <li>
                <Link href="/products?category=formal" className="opacity-80 hover:opacity-100 transition-opacity">
                  Formal
                </Link>
              </li>
              <li>
                <Link href="/products?category=boots" className="opacity-80 hover:opacity-100 transition-opacity">
                  Boots
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="opacity-80 hover:opacity-100 transition-opacity">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="opacity-80 hover:opacity-100 transition-opacity">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="opacity-80 hover:opacity-100 transition-opacity">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="opacity-80 hover:opacity-100 transition-opacity">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy-policy" className="opacity-80 hover:opacity-100 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="opacity-80 hover:opacity-100 transition-opacity">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="opacity-80 hover:opacity-100 transition-opacity">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs opacity-70">
            <p>&copy; 2026 STRIDE. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:opacity-100 transition-opacity">
                Instagram
              </Link>
              <Link href="#" className="hover:opacity-100 transition-opacity">
                Twitter
              </Link>
              <Link href="#" className="hover:opacity-100 transition-opacity">
                Facebook
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
