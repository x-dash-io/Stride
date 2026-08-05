import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { CategoryManager } from './CategoryManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Categories | STRIDE',
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const params = await searchParams
  const search = params.search || ''
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 25
  const skip = (page - 1) * perPage

  const where: any = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [rows, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
      skip,
      take: perPage,
    }),
    prisma.category.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">{total} categor{total === 1 ? 'y' : 'ies'}</p>
        </div>
      </div>

      <form method="get" className="mb-6 max-w-md">
        <div className="relative">
          <Input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or slug..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </form>

      <CategoryManager
        rows={rows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          parentId: row.parentId,
          imageUrl: row.imageUrl,
          icon: row.icon,
          sortOrder: row.sortOrder,
          isActive: row.isActive,
          productCount: row._count.products,
        }))}
        page={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  )
}