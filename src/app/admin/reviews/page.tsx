import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { ReviewModeration } from './ReviewModeration'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Reviews | STRIDE',
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const params = await searchParams
  const currentStatus = params.status || 'PENDING'
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 20
  const skip = (page - 1) * perPage

  const where =
    currentStatus === 'PENDING'
      ? { isApproved: false }
      : currentStatus === 'APPROVED'
        ? { isApproved: true }
        : {}

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
        _count: { select: { helpfulVotes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.review.count({ where }),
  ])

  const pendingCount = await prisma.review.count({ where: { isApproved: false } })
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            {total} review{total !== 1 ? 's' : ''}
            {pendingCount > 0 && ` • ${pendingCount} awaiting approval`}
          </p>
        </div>
      </div>

      <ReviewModeration
        reviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title ?? '',
          body: r.body,
          isApproved: r.isApproved,
          isFeatured: r.isFeatured,
          isVerifiedPurchase: r.isVerifiedPurchase,
          helpfulCount: r._count.helpfulVotes,
          createdAt: r.createdAt,
          user: r.user,
          product: r.product,
        }))}
        page={page}
        totalPages={totalPages}
        currentStatus={currentStatus}
        pendingCount={pendingCount}
      />
    </div>
  )
}
