import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isOnAuth = nextUrl.pathname.startsWith('/auth')
  const isOnAccount = nextUrl.pathname.startsWith('/account')
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const isOnCheckout = nextUrl.pathname.startsWith('/cart/checkout')
  const userRole = (session?.user as any)?.role

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL('/account', nextUrl))
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
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}