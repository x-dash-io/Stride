import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { ProductsFilter, ProductsSearchFilter } from '@/components/admin/ProductsFilter'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Products | STRIDE',
}

const statusFilters = ['ALL', 'ACTIVE', 'DRAFT', 'INACTIVE', 'DISCONTINUED'] as const

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  INACTIVE: 'bg-red-100 text-red-800',
  DISCONTINUED: 'bg-orange-100 text-orange-800',
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const params = await searchParams
  const currentStatus = params.status || 'ALL'
  const search = params.search || ''
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 20
  const skip = (page - 1) * perPage

  const where: any = {}
  if (currentStatus !== 'ALL') {
    where.status = currentStatus
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { take: 1, where: { isPrimary: true } },
        variants: { select: { id: true, inventory: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="container-max py-8">
      <ProductsFilter search={search} status={currentStatus} total={total} />
      <ProductsSearchFilter search={search} status={currentStatus} />

      {items.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-medium">Product</th>
                  <th className="text-left px-6 py-4 font-medium">Brand</th>
                  <th className="text-left px-6 py-4 font-medium">Category</th>
                  <th className="text-left px-6 py-4 font-medium">Price</th>
                  <th className="text-left px-6 py-4 font-medium">Status</th>
                  <th className="text-left px-6 py-4 font-medium">Variants</th>
                  <th className="text-right px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => 
                    sum + (v.inventory?.reduce((s, i) => s + i.quantityOnHand, 0) || 0), 0
                  )
                  const price = product.salePrice ?? product.basePrice
                  
                  return (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images[0]?.url && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.brand?.name || '-'}</td>
                      <td className="px-6 py-4">{product.category?.name || '-'}</td>
                      <td className="px-6 py-4 font-medium">
                        {formatPrice(Number(price))}
                        {product.salePrice && product.salePrice < product.basePrice && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            {formatPrice(Number(product.basePrice))}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{product._count.variants} variants</span>
                          <span className="text-xs text-muted-foreground">({totalStock} in stock)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            search ? `No products matching "${search}"` : 'No products have been created in the catalog yet.'
          }
          action={!search ? { label: 'Create First Product', href: '/admin/products/new', icon: Plus } : undefined}
          variant="card"
          className="py-16"
        />
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={`/admin/products?${new URLSearchParams({ 
                ...(currentStatus !== 'ALL' && { status: currentStatus }),
                ...(search && { search }),
                page: String(page - 1) 
              }).toString()}`}
              className="px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent"
            >
              Previous
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-md text-sm font-medium border border-input opacity-50 cursor-not-allowed">
              Previous
            </span>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) pageNum = i + 1
            else if (page <= 3) pageNum = i + 1
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
            else pageNum = page - 2 + i
            const params = new URLSearchParams()
            if (currentStatus !== 'ALL') params.set('status', currentStatus)
            if (search) params.set('search', search)
            params.set('page', String(pageNum))
            return (
              <Link
                key={pageNum}
                href={`/admin/products?${params.toString()}`}
                className={`px-4 py-2 rounded-md text-sm font-medium ${page === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                {pageNum}
              </Link>
            )
          })}
          {page < totalPages ? (
            <Link
              href={`/admin/products?${new URLSearchParams({ 
                ...(currentStatus !== 'ALL' && { status: currentStatus }),
                ...(search && { search }),
                page: String(page + 1) 
              }).toString()}`}
              className="px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent"
            >
              Next
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-md text-sm font-medium border border-input opacity-50 cursor-not-allowed">
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  )
}
