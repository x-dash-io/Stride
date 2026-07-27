import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = newsletterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    if (existing) {
      if (!existing.subscribed) {
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { subscribed: true },
        })
      }
      return NextResponse.json({ message: 'You are already subscribed!' })
    }

    await prisma.newsletterSubscription.create({
      data: { email },
    })

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter!' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
