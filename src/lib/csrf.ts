import { cookies } from 'next/headers'

const CSRF_COOKIE_NAME = '_csrf_token'

export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value
  if (existing) return existing

  const token = crypto.randomUUID()
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  })

  return token
}

export async function verifyCsrfToken(token: string | null): Promise<boolean> {
  if (!token) return false
  const cookieStore = await cookies()
  const stored = cookieStore.get(CSRF_COOKIE_NAME)?.value
  if (!stored) return false
  return token === stored
}
