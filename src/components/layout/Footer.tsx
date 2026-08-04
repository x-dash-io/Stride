import Link from 'next/link'
import { Instagram, Facebook, Twitter, Shield } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Best Sellers', href: '/products?sort=popular' },
  ],
  help: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
}

interface FooterProps {
  storeName?: string
  storeTagline?: string | null
  settings?: {
    instagramUrl?: string | null
    facebookUrl?: string | null
    twitterUrl?: string | null
    tiktokUrl?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
  } | null
}

export function Footer({ storeName = 'STRIDE', storeTagline, settings }: FooterProps) {
  const tagline = storeTagline || 'Premium footwear for every step. Quality craftsmanship, timeless style.'

  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-3">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold" aria-label={`${storeName} Home`}>
              {storeName}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {tagline}
            </p>
            
            {/* Social links */}
            <div className="mt-6 flex items-center gap-4">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings?.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="TikTok"
                >
                  TikTok
                </a>
              )}
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

          <nav aria-label="Help">
            <h3 className="font-semibold">Help</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.help.map((link) => (
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

        <div className="mt-16 flex flex-col items-center justify-between gap-8 border-t pt-12 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  )
}