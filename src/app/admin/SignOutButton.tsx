'use client'

import { SignOutConfirmDialog } from '@/components/SignOutConfirmDialog'

export function SignOutButton({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return <SignOutConfirmDialog className={className} iconOnly={iconOnly} />
}
