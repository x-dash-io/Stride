'use client'

import Link from 'next/link'
import { AdminSidebarTrigger } from './AdminSidebar'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

interface MobileHeaderProps {
  storeName?: string | null
  navigationItems?: Array<{
    href: string
    name: string
    icon: any
  }>
  suspendedNav?: Array<{
    href: string
    name: string
    icon: any
  }>
  isSuspended?: boolean
  isSuperAdmin?: boolean
}

const handleSignOut = async () => {
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie = 'cartSessionId=; path=/; max-age=0; SameSite=Lax'
  }
  await signOut({ callbackUrl: '/', redirect: true })
}

export function MobileHeader({ storeName }: MobileHeaderProps) {
  return (
    <header className="lg:hidden w-full border-b border-border bg-background">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarTrigger />
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-tight text-foreground">
              {storeName || 'STRIDE'}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
                <ChevronDown className="w-4 h-4 hidden sm:inline" />
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