import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!)

async function verifyAuth(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const token = cookies['next-auth.session-token'] || cookies['__session']

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export default async function proxy(request: NextRequest) {
  const { nextUrl } = request
  const session = await verifyAuth(request)
  const isLoggedIn = !!session
  const isOnAuth = nextUrl.pathname.startsWith('/auth')
  const isOnAccount = nextUrl.pathname.startsWith('/account')
  const isOnAdmin = nextUrl.pathname.startsWith('/admin')
  const isOnCheckout = nextUrl.pathname.startsWith('/cart/checkout')
  const userRole = session?.role as string | undefined

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
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}