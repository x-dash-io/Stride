'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Star, CheckCircle2, XCircle, Trash2, Sparkles, MessagesSquare } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/providers/ToastProvider'

interface ModerationReview {
  id: string
  rating: number
  title: string
  body: string
  isApproved: boolean
  isFeatured: boolean
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  user: { id: string; name: string | null; email: string }
  product: { id: string; name: string; slug: string }
}

interface ReviewModerationProps {
  reviews: ModerationReview[]
  page: number
  totalPages: number
  currentStatus: string
  pendingCount: number
}

const TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'ALL', label: 'All' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  )
}

export function ReviewModeration({ reviews, page, totalPages, currentStatus, pendingCount }: ReviewModerationProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const action = async (reviewId: string, payload: Record<string, unknown>, successMsg: string) => {
    setPendingId(reviewId)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      showToast('success', successMsg)
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Action failed')
    } finally {
      setPendingId(null)
    }
  }

  const remove = async (reviewId: string) => {
    setPendingId(reviewId)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      showToast('success', 'Review deleted')
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setPendingId(null)
    }
  }

  const switchTab = (key: string) => {
    router.push(key === 'PENDING' ? '/admin/reviews' : `/admin/reviews?status=${key}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentStatus === tab.key
                ? 'bg-accent text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.key === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 text-xs bg-destructive text-white rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          variant="card"
          icon={MessagesSquare}
          title="No reviews here"
          description={
            currentStatus === 'PENDING'
              ? 'Great — every review has been moderated. New customer reviews will appear here.'
              : 'No reviews match this filter yet.'
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="text-[10px] uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                        Verified
                      </span>
                    )}
                    {review.isFeatured && (
                      <span className="text-[10px] uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {!review.isApproved && (
                      <span className="text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold">
                        Pending
                      </span>
                    )}
                  </div>
                  {review.title && <p className="font-semibold mt-1.5">{review.title}</p>}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{review.body}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>
                  {review.user.name || review.user.email} • {review.helpfulCount} helpful
                </span>
                <Link href={`/products/${review.product.slug}`} className="hover:text-accent font-medium truncate max-w-[45%]">
                  {review.product.name}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {!review.isApproved && (
                  <Button
                    size="sm"
                    variant="default"
                    disabled={pendingId === review.id}
                    onClick={() => action(review.id, { action: 'approve' }, 'Review approved')}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </Button>
                )}
                {review.isApproved && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === review.id}
                    onClick={() => action(review.id, { action: 'reject' }, 'Review rejected')}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                )}
                {review.isApproved && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === review.id}
                    onClick={() =>
                      action(review.id, { action: review.isFeatured ? 'unfeature' : 'feature' }, review.isFeatured ? 'Removed from featured' : 'Marked as featured')
                    }
                  >
                    <Sparkles className="w-4 h-4" /> {review.isFeatured ? 'Unfeature' : 'Feature'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={pendingId === review.id}
                  onClick={() => remove(review.id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={currentStatus === 'PENDING' ? `/admin/reviews?page=${page - 1}` : `/admin/reviews?status=${currentStatus}&page=${page - 1}`}
              className="text-sm hover:text-accent"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={currentStatus === 'PENDING' ? `/admin/reviews?page=${page + 1}` : `/admin/reviews?status=${currentStatus}&page=${page + 1}`}
              className="text-sm hover:text-accent"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
