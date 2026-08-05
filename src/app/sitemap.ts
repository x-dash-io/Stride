import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stride.example.com'

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/accessibility`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/returns`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/size-guide`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.4 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: 'never' as const, priority: 0.7 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'never' as const, priority: 0.5 },
    { url: `${baseUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'never' as const, priority: 0.5 },
  ]

  try {
    const [products, categories, brands, collections, cmsPages] = await Promise.all([
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
        where: { isPublished: true, publishedAt: { not: null, lte: new Date() } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.collection.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ])

    const productPages = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/products?category=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const brandPages = brands.map((brand) => ({
      url: `${baseUrl}/products?brand=${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const collectionPages = collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: collection.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    const cmsPageUrls = cmsPages.map((page) => ({
      url: `${baseUrl}/pages/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...staticPages, ...productPages, ...categoryPages, ...brandPages, ...collectionPages, ...cmsPageUrls]
  } catch (error) {
    console.warn('Database not available for sitemap generation, returning static pages only:', error)
    return staticPages
  }
}

export { sitemap as default }