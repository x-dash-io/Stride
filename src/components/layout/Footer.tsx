import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Truck, Shield, RotateCcw, Headphones } from 'lucide-react'

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'New Arrivals', href: '/products?category=new-arrivals' },
    { label: 'Best Sellers', href: '/products?category=best-sellers' },
    { label: 'Brands', href: '/products' },
    { label: 'Sale', href: '/products?onSale=true' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'FAQs', href: '/faqs' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Affiliates', href: '/affiliates' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

const benefits = [
  { icon: Truck, title: 'Free Delivery', description: 'On orders over KES 10,000' },
  { icon: Shield, title: 'Secure Payment', description: 'M-Pesa & Card payments' },
  { icon: RotateCcw, title: 'Easy Returns', description: '30-day return policy' },
  { icon: Headphones, title: 'Support', description: 'Mon-Fri 8am-6pm' },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold" aria-label="STRIDE Home">
              STRIDE
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Premium footwear for every step. Quality craftsmanship, timeless style.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Shop">
            <h3 className="font-semibold">Shop</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support">
            <h3 className="font-semibold">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <benefit.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-sm">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} STRIDE. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <label className="text-sm text-muted-foreground">
              Subscribe to newsletter
              <input
                type="email"
                placeholder="Enter your email"
                className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Email address"
              />
            </label>
          </div>
        </div>
      </div>
    </footer>
  )
}