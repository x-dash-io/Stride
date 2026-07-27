import Link from 'next/link'
import { getProducts } from '@/lib/queries'
import { ProductCard } from '@/components/products/ProductGrid'

interface ProductRecommendationsProps {
  productId?: string
  categoryId?: string
}

export default async function ProductRecommendations({
  productId,
  categoryId,
}: ProductRecommendationsProps) {
  const { items: products } = await getProducts({
    category: categoryId,
    limit: 8,
  })

  const filtered = products.filter((p) => p.id !== productId).slice(0, 6)

  if (filtered.length === 0) return null

  return (
    <section className="py-12">
      <h2 className="text-2xl font-serif font-bold mb-6">You May Also Like</h2>
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin">
        {filtered.map((product) => (
          <div key={product.id} className="min-w-[280px] max-w-[280px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
