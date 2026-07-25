import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(
    `User-agent: *
Allow: /

Disallow: /cart/
Disallow: /cart/checkout/
Disallow: /account/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: https://stride.co.ke/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  )
}