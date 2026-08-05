import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { BannerManager } from './BannerManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Banners | STRIDE',
}

export default async function AdminBannersPage() {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const banners = await prisma.banner.findMany({
    orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }],
  })

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Banners</h1>
          <p className="text-muted-foreground mt-1">{banners.length} banner{banners.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <BannerManager
        initialBanners={banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          ctaText: b.ctaText,
          ctaUrl: b.ctaUrl,
          desktopImageUrl: b.desktopImageUrl,
          mobileImageUrl: b.mobileImageUrl,
          bgColor: b.bgColor,
          textColor: b.textColor,
          placement: b.placement,
          isActive: b.isActive,
          sortOrder: b.sortOrder,
          startsAt: b.startsAt,
          endsAt: b.endsAt,
        }))}
      />
    </div>
  )
}
