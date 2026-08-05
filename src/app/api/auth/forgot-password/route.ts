import { NextRequest, NextResponse } from 'next/server'
import { withProtection } from '@/lib/api-protection'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'
import { forgotPasswordSchema } from '@/lib/validations'
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  buildPasswordResetEmail,
  PASSWORD_RESET_TTL_MS,
} from '@/lib/password-reset'

async function handleForgotPassword(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = forgotPasswordSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })

  // Always report success to avoid leaking which emails have accounts
  if (!user) {
    return NextResponse.json({ success: true })
  }

  const token = generatePasswordResetToken()
  const expires = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token: hashPasswordResetToken(token) } },
    update: { expires },
    create: { identifier: email, token: hashPasswordResetToken(token), expires },
  })

  const origin = new URL(request.url).origin
  const resetUrl = `${origin}/auth/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your Stride password',
    html: buildPasswordResetEmail(resetUrl),
  })

  return NextResponse.json({ success: true })
}

export function POST(request: NextRequest) {
  return withProtection(request, handleForgotPassword, { requireAuth: false, rateLimit: 'auth' })
}
