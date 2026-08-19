'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  MapPinned,
  Settings,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  Tag,
  Image as ImageIcon,
  Layers,
  Boxes,
  MessageSquare,
  FolderKanban,
  Warehouse,
  Users,
  Mail,
  Receipt,
} from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar'


const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  MapPinned,
  Settings,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  Tag,
  ImageIcon,
  Layers,
  Boxes,
  MessageSquare,
  FolderKanban,
  Warehouse,
  Users,
  Mail,
  Receipt,
}

interface NavItem {
  name: string
  href: string
  icon: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface AdminSidebarProps {
  navigationItems: NavItem[]
  navigationGroups?: NavGroup[]
  suspendedNav?: NavItem[]
  isSuspended?: boolean
  isSuperAdmin?: boolean
  storeName?: string
}
  
function AdminSidebarInner({
  navigationItems,
  navigationGroups,
  suspendedNav,
  isSuspended,
  isSuperAdmin,
  storeName,
}: AdminSidebarProps) {
  const pathname = usePathname()

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon aria-hidden="true" /> : null
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // Fall back to a single unlabeled group if the caller didn't pass grouped nav
  const groups: NavGroup[] = navigationGroups && navigationGroups.length > 0
    ? navigationGroups
    : [{ label: isSuperAdmin ? 'Platform Access' : 'Store Management', items: navigationItems }]

return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            {storeName || 'STRIDE'}
          </span>
          {isSuperAdmin && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
              Super Admin
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.name}>
                      <Link href={item.href}>
                        {renderIcon(item.icon)}
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {isSuspended && !isSuperAdmin && suspendedNav && (
          <SidebarGroup>
            <SidebarGroupLabel>Locked</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {suspendedNav
                  .filter(item => item.href !== '/admin' && item.href !== '/admin/subscription')
                  .map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        disabled
                        title="Unlock by clearing your subscription dues"
                        className="cursor-not-allowed opacity-40 text-muted-foreground select-none"
                      >
                        {renderIcon(item.icon)}
                        <span className="truncate">{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

export function AdminSidebar(props: AdminSidebarProps) {
  return <AdminSidebarInner {...props} />
}

export function AdminSidebarTrigger() {
  return <SidebarTrigger aria-label="Toggle Sidebar" />
}

export function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset className="min-h-screen bg-muted/30 flex flex-col">
      {children}
    </SidebarInset>
  )
}