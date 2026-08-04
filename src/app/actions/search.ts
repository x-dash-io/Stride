'use server'

import { prisma } from '@/lib/prisma'

export async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) return []

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      publishedAt: { not: null, lte: new Date() },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      brand: true,
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand.name,
    category: product.category?.name || 'Featured',
    price: product.salePrice ? Number(product.salePrice) : Number(product.basePrice),
    originalPrice: product.salePrice ? Number(product.basePrice) : null,
    image: product.images[0]?.url || null,
  }))
}
