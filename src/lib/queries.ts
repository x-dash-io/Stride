import { prisma } from '@/lib/prisma'

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, status: 'ACTIVE', publishedAt: { not: null, lte: new Date() } },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { isActive: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          inventory: { where: { quantityOnHand: { gt: 0 } } },
        },
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, image: true } }, images: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      collections: { include: { collection: true } },
    },
  })
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { isActive: true },
        include: { inventory: true, images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, image: true } }, images: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug, isActive: true },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  })
}

export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  })
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug, isActive: true } })
}

export async function getCollections(activeOnly = true) {
  return prisma.collection.findMany({
    where: activeOnly ? { isActive: true, startDate: { lte: new Date() }, OR: [{ endDate: null }, { endDate: { gte: new Date() } }] } : {},
    include: { products: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getBanners(placement?: string) {
  return prisma.banner.findMany({
    where: { isActive: true, ...(placement && { placement }) },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getCmsPage(slug: string) {
  return prisma.cmsPage.findUnique({ where: { slug, isPublished: true } })
}

export async function getCart(userId?: string, sessionId?: string) {
  return prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { brand: true, images: { where: { isPrimary: true }, take: 1 } } },
              inventory: true,
            },
          },
        },
      },
    },
  })
}

export async function getUserOrders(userId: string, page = 1, perPage = 10) {
  const skip = (page - 1) * perPage
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: { items: { include: { variant: true } } },
    }),
    prisma.order.count({ where: { userId } }),
  ])
  return { items, total }
}

export async function getOrderById(id: string, userId?: string) {
  return prisma.order.findFirst({
    where: { id, ...(userId && { userId }) },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payments: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })
}

export async function getWishlist(userId: string) {
  const wishlist = await prisma.wishlist.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              inventory: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  return wishlist
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payments: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })
}