import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isStaffRole, getRoleHome } from '@/lib/roles'

/**
 * Role-aware post-auth redirect endpoint.
 *
 * NextAuth Google OAuth and any other provider lands here after authentication.
 * We inspect the session role and send:
 *   ADMIN / SUPER_ADMIN → /admin (always, ignoring any ?next param)
 *   CUSTOMER           → the ?next param, but only if it's a storefront path;
 *                         cross-role targets like /admin are rejected and fall back
 *                         to the role home.
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

  // Staff always land on the admin dashboard — never on the storefront,
  // regardless of any ?next param.
  if (isStaffRole(session.user.role)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Customers: honour the ?next param only if it targets a storefront path.
  // Reject cross-role redirect targets (e.g. ?next=/admin) so that a
  // non-admin cannot be redirected to the admin dashboard via a crafted URL.
  const destination = next.startsWith('/') && !next.startsWith('/admin')
    ? next
    : getRoleHome(session.user.role)
  return NextResponse.redirect(new URL(destination, request.url))
}
