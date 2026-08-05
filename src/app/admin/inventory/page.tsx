import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { InventoryTable } from './InventoryTable'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Inventory | STRIDE',
}

export default async function AdminInventoryPage({
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
          { variant: { sku: { contains: search, mode: 'insensitive' } } },
          { variant: { product: { name: { contains: search, mode: 'insensitive' } } } },
          { variant: { product: { slug: { contains: search, mode: 'insensitive' } } } },
        ],
      }
    : {}

  const [rows, total, warehouses, totals] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        warehouse: { select: { id: true, name: true } },
        variant: {
          select: {
            id: true,
            sku: true,
            size: true,
            colour: true,
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: [{ quantityOnHand: 'asc' }],
      skip,
      take: perPage,
    }),
    prisma.inventory.count({ where }),
    prisma.warehouse.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventory.aggregate({
      _sum: { quantityOnHand: true, quantityReserved: true },
      _count: { _all: true },
    }),
  ])

  const lowStockCount = await prisma.inventory.count({
    where: { quantityOnHand: { lte: prisma.inventory.fields.lowStockThreshold } },
  })

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            {total} SKU row{total !== 1 ? 's' : ''} • {totals._sum.quantityOnHand ?? 0} units on hand • {lowStockCount} low stock
          </p>
        </div>
      </div>

      {warehouses.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {warehouses.map((warehouse) => (
            <span key={warehouse.id} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-medium">
              {warehouse.name}
            </span>
          ))}
        </div>
      )}

      <form method="get" className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by SKU, product name or slug..."
            className="pl-9"
          />
        </div>
      </form>

      <InventoryTable
        rows={rows.map((row) => ({
          id: row.id,
          sku: row.variant.sku,
          size: row.variant.size,
          colour: row.variant.colour,
          productId: row.variant.product.id,
          productName: row.variant.product.name,
          productSlug: row.variant.product.slug,
          warehouse: row.warehouse.name,
          quantityOnHand: row.quantityOnHand,
          quantityReserved: row.quantityReserved,
          lowStockThreshold: row.lowStockThreshold,
        }))}
        page={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  )
}
