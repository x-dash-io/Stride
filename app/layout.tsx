import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { CartProvider } from '@/lib/contexts/cart-context'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'STRIDE - Premium Footwear',
  description: 'Discover luxury footwear for every occasion. Premium quality shoes handcrafted for style and comfort.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'STRIDE - Premium Footwear',
    description: 'Luxury shoes handcrafted for style and comfort',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F7F4' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
