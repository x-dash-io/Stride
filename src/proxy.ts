import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  const { nextUrl } = request
  const isLoggedIn = !!token
  const isOnAuth = nextUrl.pathname.startsWith('/auth')
  const isOnAccount = nextUrl.pathname.startsWith('/account')
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const isOnCheckout = nextUrl.pathname.startsWith('/cart/checkout')
  const userRole = token?.role as string | undefined

  if (isOnAuth && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get('callbackUrl') || '/account'
    return NextResponse.redirect(new URL(callbackUrl, nextUrl))
  }

  if ((isOnAccount || isOnCheckout) && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isOnAdmin && (!isLoggedIn || userRole !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
