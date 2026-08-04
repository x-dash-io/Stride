import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'

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
      brand: true,
      category: true,
      images: true,
      variants: {
        include: {
          inventory: true,
          images: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
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
      </div>

      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Product Edit Page</h2>
        <p className="text-muted-foreground mb-6">
          This page is under construction. For now, please use the API to edit products.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Back to Products</Link>
          </Button>
          <Button asChild>
            <Link href={`/products/${product.slug}`} target="_blank">
              View Product
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
