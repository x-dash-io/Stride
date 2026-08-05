import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { ProductEditForm } from './ProductEditForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit Product | STRIDE',
}

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: { select: { id: true } },
      category: { select: { id: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        include: {
          inventory: true,
          images: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const initial = {
    name: product.name,
    slug: product.slug,
    brandId: product.brandId,
    categoryId: product.categoryId ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    description: product.description ?? undefined,
    gender: product.gender,
    status: product.status,
    tag: product.tag ?? undefined,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice !== null ? Number(product.salePrice) : undefined,
    costPrice: product.costPrice !== null ? Number(product.costPrice) : undefined,
    weightKg: product.weightKg !== null ? Number(product.weightKg) : undefined,
    metaTitle: product.metaTitle ?? undefined,
    metaDescription: product.metaDescription ?? undefined,
  }

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <h1 className="text-4xl font-serif font-bold">Edit Product</h1>
          <p className="text-muted-foreground mt-1">{product.name}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground`}>
            {product.status}
          </span>
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
            {product.variants.length} variants
          </span>
        </div>
      </div>

      <ProductEditForm productId={product.id} initial={initial} />
    </div>
  )
}
