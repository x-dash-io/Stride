import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isStaffRole, getRoleHome } from '@/lib/roles'

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
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', next)
    return NextResponse.redirect(loginUrl)
  }

  // Staff always land on the admin dashboard — never on the storefront
  if (isStaffRole(session.user.role)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Customers: honour the ?next param, but never allow open redirects to external URLs
  const destination = next.startsWith('/') ? next : getRoleHome(session.user.role)
  return NextResponse.redirect(new URL(destination, request.url))
}
