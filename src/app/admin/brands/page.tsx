import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { BrandManager } from './BrandManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Brands | STRIDE',
}

export default async function AdminBrandsPage() {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Brands</h1>
          <p className="text-muted-foreground mt-1">{brands.length} brand{brands.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <BrandManager
        initialBrands={brands.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          description: b.description,
          logoUrl: b.logoUrl,
          coverImageUrl: b.coverImageUrl,
          websiteUrl: b.websiteUrl,
          originCountry: b.originCountry,
          isFeatured: b.isFeatured,
          isActive: b.isActive,
          sortOrder: b.sortOrder,
          productCount: b._count.products,
        }))}
      />
    </div>
  )
}
