import NextAuth, { type NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const MAX_FAILED_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  // next-auth v4 does not auto-read AUTH_SECRET (v5 name) — wire explicitly
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: 'jwt' as const, 
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'CUSTOMER',
        }
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null

        const now = new Date()
        if (user.lockoutUntil && user.lockoutUntil > now) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
          const attempts = (user.failedLoginCount ?? 0) + 1
          if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: 0,
                lockoutUntil: new Date(now.getTime() + LOCKOUT_DURATION_MS),
              },
            })
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginCount: { increment: 1 } },
            })
          }
          return null
        }

        if ((user.failedLoginCount ?? 0) > 0 || user.lockoutUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: 0, lockoutUntil: null },
          })
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? 'CUSTOMER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
}

const handler = NextAuth(authOptions)

export const handlers = { GET: handler, POST: handler }

export async function auth() {
  return getServerSession(authOptions)
}
