import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Role-aware post-auth redirect endpoint.
 *
 * NextAuth Google OAuth and any other provider lands here after authentication.
 * We inspect the session role and send:
 *   ADMIN / SUPER_ADMIN → /admin
 *   CUSTOMER           → the ?next param (e.g. /cart), or /products
 *
 * Usage in signIn:  signIn('google', { callbackUrl: '/auth/redirect?next=/cart' })
 */
export async function GET(request: NextRequest) {
  const session = await auth()
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') || '/products'

  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const role = session.user.role
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Customers: honour the ?next param, but never allow open redirects to external URLs
  const destination = next.startsWith('/') ? next : '/products'
  return NextResponse.redirect(new URL(destination, request.url))
}
