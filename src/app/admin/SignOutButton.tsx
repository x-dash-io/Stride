'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-slate-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 h-9 w-9 rounded-lg"
      aria-label="Sign Out"
    >
      <LogOut className="w-4 h-4" />
    </Button>
  )
}
