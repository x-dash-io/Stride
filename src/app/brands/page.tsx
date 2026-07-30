import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Brands | STRIDE',
  description: 'Browse premium footwear brands available at STRIDE.',
}

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    where: { products: { some: { status: 'ACTIVE' } } },
    include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container-max py-12 min-h-screen">
      <Breadcrumbs items={[{ label: 'Products', href: '/products' }, { label: 'Brands' }]} />
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 mt-4">Our Brands</h1>
      <p className="text-muted-foreground mb-12">Discover {brands.length} premium footwear brands</p>

      {brands.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No brands available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <h2 className="text-xl font-serif font-semibold mb-2 group-hover:text-primary transition-colors">{brand.name}</h2>
              {brand.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{brand.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{brand._count.products} product{brand._count.products !== 1 && 's'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
