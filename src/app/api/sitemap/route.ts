import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stride.co.ke'

  const [products, categories, brands, collections, pages] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE', publishedAt: { not: null, lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.collection.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.cmsPage.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ])

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/size-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/accessibility`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]

  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryRoutes = categories.map((c) => ({
    url: `${baseUrl}/products?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const brandRoutes = brands.map((b) => ({
    url: `${baseUrl}/products?brand=${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const collectionRoutes = collections.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const pageRoutes = pages.map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes, ...collectionRoutes, ...pageRoutes]
}