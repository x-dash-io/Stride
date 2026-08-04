import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/header/CartDrawer'
import { LenisProvider } from '@/components/LenisProvider'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getBillingStatus } from '@/lib/services/billing.service'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
  })

  const storeName = settings?.storeName || 'STRIDE'
  const tagline = settings?.storeTagline || 'Premium Footwear'
  const title = settings?.metaTitle || `${storeName} - ${tagline}`
  const description = settings?.metaDescription || 'Discover premium footwear for every occasion.'

  return {
    title: {
      default: title,
      template: `%s | ${storeName}`,
    },
    description,
    keywords: ['footwear', 'shoes', 'sneakers', 'boots', 'formal shoes', 'kenya'],
    authors: [{ name: storeName }],
    creator: storeName,
    publisher: storeName,
    robots: 'index, follow',
    icons: {
      icon: [
        { url: settings?.faviconUrl || '/favicon.svg', type: 'image/svg+xml' },
        { url: settings?.logoUrl || '/icon.svg', type: 'image/svg+xml' },
      ],
      shortcut: settings?.faviconUrl || '/favicon.svg',
      apple: settings?.logoUrl || '/icon.svg',
    },
    openGraph: {
      type: 'website',
      locale: 'en_KE',
      title,
      description,
      siteName: storeName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    verification: {
      google: 'google-site-verification-code',
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F7F4' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'

  const isAdmin = pathname.startsWith('/admin')
  const isAuth = pathname.startsWith('/auth')
  const isSuspendedPage = pathname === '/suspended'

  if (!isAdmin && !isAuth && !isSuspendedPage) {
    const billing = await getBillingStatus()
    if (billing.isSuspended) {
      redirect('/suspended')
    }
  }

  if (isAdmin && pathname !== '/admin/billing') {
    const billing = await getBillingStatus()
    if (billing.isSuspended) {
      redirect('/admin/billing')
    }
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
  })

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background scroll-smooth`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <LenisProvider>
          <Providers>
            <Header storeName={settings?.storeName} logoUrl={settings?.logoUrl} />
            <main className="flex-1">{children}</main>
            <Footer storeName={settings?.storeName} storeTagline={settings?.storeTagline} settings={settings} />
            <CartDrawer />
          </Providers>
        </LenisProvider>
        <div id="portal-root" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}