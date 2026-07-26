import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'STRIDE - Premium Footwear',
  description: 'Discover premium footwear for every occasion. Quality shoes handcrafted for style and comfort.',
  keywords: ['footwear', 'shoes', 'sneakers', 'boots', 'formal shoes', 'kenya'],
  authors: [{ name: 'STRIDE' }],
  creator: 'STRIDE',
  publisher: 'STRIDE',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://stride.co.ke',
    title: 'STRIDE - Premium Footwear',
    description: 'Discover premium footwear for every occasion.',
    siteName: 'STRIDE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STRIDE - Premium Footwear',
    description: 'Discover premium footwear for every occasion.',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F7F4' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="antialiased flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}