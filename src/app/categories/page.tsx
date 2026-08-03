import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Categories | STRIDE',
  description: 'Browse footwear categories at STRIDE.',
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { products: { some: { status: 'ACTIVE' } } },
    include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container-max py-12 min-h-screen">
      <Breadcrumbs items={[{ label: 'Products', href: '/products' }, { label: 'Categories' }]} />
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 mt-4">Categories</h1>
      <p className="text-muted-foreground mb-12">Browse by category</p>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No categories available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all"
            >
              <h2 className="text-2xl font-serif font-semibold mb-2 group-hover:text-primary transition-colors">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{category.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{category._count.products} product{category._count.products !== 1 && 's'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
