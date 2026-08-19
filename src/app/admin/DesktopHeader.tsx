'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

const handleSignOut = async () => {
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie = 'cartSessionId=; path=/; max-age=0; SameSite=Lax'
  }
  await signOut({ callbackUrl: '/', redirect: true })
}

interface DesktopHeaderProps {
  storeName?: string | null
}

export function DesktopHeader({ storeName }: DesktopHeaderProps) {
  return (
    <header className="hidden lg:flex w-full border-b border-border bg-background items-center">
      <div className="px-6 py-3 flex items-center justify-end w-full gap-4">
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <User className="w-4 h-4" />
                <span>Admin</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-sm" onClick={() => window.location.href = '/admin/settings/store'}>
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-sm text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}