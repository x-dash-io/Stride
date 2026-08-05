import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { withProtection } from '@/lib/api-protection'
import { prisma } from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations'
import { hashPasswordResetToken } from '@/lib/password-reset'

async function handleResetPassword(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = resetPasswordSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid reset request' }, { status: 400 })
  }

  const { token, password } = parsed.data
  const hashedToken = hashPasswordResetToken(token)

  const record = await prisma.verificationToken.findFirst({
    where: { token: hashedToken, expires: { gt: new Date() } },
  })

  if (!record) {
    return NextResponse.json({ error: 'This reset link is invalid or has expired. Please request a new one.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: record.identifier } })
  if (!user) {
    return NextResponse.json({ error: 'This reset link is invalid or has expired. Please request a new one.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token: record.token } },
    }),
  ])

  return NextResponse.json({ success: true })
}

export function POST(request: NextRequest) {
  return withProtection(request, handleResetPassword, { requireAuth: false, rateLimit: 'auth' })
}
