export const CUSTOMER_ROLE = 'CUSTOMER' as const
export const ADMIN_ROLE = 'ADMIN' as const
export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN' as const
export const DELIVERY_AGENT_ROLE = 'DELIVERY_AGENT' as const

export const STAFF_ROLES = [ADMIN_ROLE, SUPER_ADMIN_ROLE] as const
export const ALL_ROLES = [CUSTOMER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE, DELIVERY_AGENT_ROLE] as const

export type Role = typeof ALL_ROLES[number]
export type StaffRole = (typeof STAFF_ROLES)[number]

const ROLE_HIERARCHY: Record<string, string[]> = {
  [SUPER_ADMIN_ROLE]: [SUPER_ADMIN_ROLE, ADMIN_ROLE],
  [ADMIN_ROLE]: [ADMIN_ROLE],
  [CUSTOMER_ROLE]: [CUSTOMER_ROLE],
  [DELIVERY_AGENT_ROLE]: [DELIVERY_AGENT_ROLE],
}

export function isStaffRole(role?: string | null): role is StaffRole {
  return role === ADMIN_ROLE || role === SUPER_ADMIN_ROLE
}

export function isDeliveryAgent(role?: string | null): boolean {
  return role === DELIVERY_AGENT_ROLE
}

export function isCustomerRole(role?: string | null): boolean {
  return !role || role === CUSTOMER_ROLE
}

export function isRoleAllowed(role: string | undefined, allowed: readonly Role[]): boolean {
  if (!role) return false
  const effectiveRoles = ROLE_HIERARCHY[role] ?? [role]
  return allowed.some(a => effectiveRoles.includes(a))
}

export function getRoleHome(role?: string | null): string {
  if (isStaffRole(role)) return '/admin'
  if (isDeliveryAgent(role)) return '/delivery'
  return '/products'
}
