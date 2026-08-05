import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { CollectionManager } from './CollectionManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Collections | STRIDE',
}

export default async function AdminCollectionsPage() {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.product.findMany({
      where: { status: { in: ['ACTIVE', 'DRAFT'] } },
      select: { id: true, name: true, slug: true, images: { take: 1, where: { isPrimary: true } } },
      orderBy: { createdAt: 'desc' },
      take: 300,
    }),
  ])

  const collectionProducts = await prisma.productCollection.findMany({
    where: { collectionId: { in: collections.map((c) => c.id) } },
    select: { collectionId: true, productId: true },
  })
  const productIdsByCollection = new Map<string, string[]>()
  for (const row of collectionProducts) {
    const list = productIdsByCollection.get(row.collectionId) ?? []
    list.push(row.productId)
    productIdsByCollection.set(row.collectionId, list)
  }

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Collections</h1>
          <p className="text-muted-foreground mt-1">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <CollectionManager
        initialCollections={collections.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          bannerUrl: c.bannerUrl,
          bannerMobileUrl: c.bannerMobileUrl,
          isActive: c.isActive,
          isFeatured: c.isFeatured,
          startDate: c.startDate,
          endDate: c.endDate,
          sortOrder: c.sortOrder,
          productCount: c._count.products,
          productIds: productIdsByCollection.get(c.id) ?? [],
        }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.images[0]?.url ?? null,
        }))}
      />
    </div>
  )
}
