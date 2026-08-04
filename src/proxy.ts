import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  const { nextUrl } = request
  const isLoggedIn = !!token
  const isOnAuth = nextUrl.pathname.startsWith('/auth')
  const isOnAccount = nextUrl.pathname.startsWith('/account')
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const userRole = token?.role as string | undefined

  if (isOnAuth && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get('callbackUrl') || '/cart'
    return NextResponse.redirect(new URL(callbackUrl, nextUrl))
  }

  if (isOnAccount && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isOnAdmin && (!isLoggedIn || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN'))) {
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
