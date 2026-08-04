import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isStaffRole, isRoleAllowed, type Role } from '@/lib/roles'

type Session = NonNullable<Awaited<ReturnType<typeof auth>>>

export interface CustomerGuardOptions {
  callbackUrl?: string
  staffRedirectTo?: string
}

export interface StaffGuardOptions {
  roles?: readonly Role[]
  redirectTo?: string
}

export function loginUrl(callbackUrl: string): string {
  return `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

/**
 * Authorization guard for customer-only areas (e.g. /account).
 * - Not authenticated          → /auth/login (authentication concern)
 * - Authenticated staff        → staff home (authorization concern)
 * - Authenticated customer     → session, access granted
 */
export async function requireCustomer(
  options: CustomerGuardOptions = {}
): Promise<Session> {
  const { callbackUrl = '/account', staffRedirectTo = '/admin' } = options
  const session = await auth()

  if (!session?.user?.id) {
    redirect(loginUrl(callbackUrl))
  }

  if (isStaffRole(session.user.role)) {
    redirect(staffRedirectTo)
  }

  return session
}

/**
 * Authorization guard for staff-only areas (e.g. /admin).
 * - Not authenticated                       → redirectTo
 * - Authenticated with an unauthorized role → redirectTo
 * - Authenticated staff (role allowed)      → session, access granted
 */
export async function requireStaff(
  options: StaffGuardOptions = {}
): Promise<Session> {
  const { roles, redirectTo = '/' } = options
  const session = await auth()

  if (!session?.user?.id) {
    redirect(redirectTo)
  }

  if (roles ? !isRoleAllowed(session.user.role, roles) : !isStaffRole(session.user.role)) {
    redirect(redirectTo)
  }

  return session
}
