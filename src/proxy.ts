import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isStaffRole, getRoleHome } from '@/lib/roles'

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  const { nextUrl } = request

  // ── Authentication: is this an identified user? ──────────────────────────
  const isAuthenticated = !!token

  // ── Authorization: what is this user allowed to access? ──────────────────
  const userRole = token?.role as string | undefined
  const isStaff = isStaffRole(userRole)

  const isOnAuth = nextUrl.pathname.startsWith('/auth')
  const isOnAccount = nextUrl.pathname.startsWith('/account')
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')

  // Authenticated users have no business on the auth pages —
  // send them to their role home (role-based redirect).
  if (isOnAuth && isAuthenticated) {
    if (isStaff) {
      return NextResponse.redirect(new URL('/admin', nextUrl))
    }
    // Customers go back to where they were, or to their role home
    const callbackUrl = nextUrl.searchParams.get('callbackUrl') || getRoleHome(userRole)
    return NextResponse.redirect(new URL(callbackUrl, nextUrl))
  }

  // /account is customer-only: staff are redirected to their role home
  if (isOnAccount) {
    if (isStaff) {
      return NextResponse.redirect(new URL(getRoleHome(userRole), nextUrl))
    }
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // /admin is staff-only: everyone else is sent to the storefront
  if (isOnAdmin && !(isAuthenticated && isStaff)) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  // Pass current pathname to Server Components in headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.).*)',
  ],
}
