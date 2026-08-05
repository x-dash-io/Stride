'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Star, ThumbsUp, MessageSquare } from 'lucide-react'
import { Review } from '@/types'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
}

function ReviewCard({ review }: { review: Review }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount)
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/reviews/${review.id}/helpful`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setHasVotedHelpful(data.hasVoted)
        setHelpfulCount(data.helpfulCount)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [review.id])

  const handleHelpful = async () => {
    const previous = hasVotedHelpful
    setHasVotedHelpful(!previous)
    setHelpfulCount((prev) => Math.max(0, prev + (previous ? -1 : 1)))
    try {
      const res = await fetch(`/api/reviews/${review.id}/helpful`, { method: 'POST' })
      if (!res.ok) {
        setHasVotedHelpful(previous)
        setHelpfulCount((prev) => Math.max(0, prev + (previous ? 1 : -1)))
        return
      }
      const data = await res.json()
      setHasVotedHelpful(data.hasVoted)
      setHelpfulCount(data.helpfulCount)
    } catch (err) {
      console.error('Failed to vote helpful:', err)
      setHasVotedHelpful(previous)
      setHelpfulCount((prev) => Math.max(0, prev + (previous ? 1 : -1)))
    }
  }

  return (
    <div className="border-b border-border pb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < review.rating ? 'fill-primary text-primary' : 'text-muted'
                  )}
                />
              ))}
            </div>
            {review.isVerifiedPurchase && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                Verified Purchase
              </span>
            )}
          </div>
          <p className="font-semibold mt-1">{review.user?.name || 'Anonymous'}</p>
        </div>
        <span className="text-sm text-muted-foreground shrink-0">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
      <p className="text-muted-foreground text-sm mb-3">{review.body}</p>
      {review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {review.images.map((image) => (
            <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.altText || 'Review photo'}
                width={72}
                height={72}
                className="w-[72px] h-[72px] rounded-lg object-cover border border-border hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={handleHelpful}
          aria-pressed={hasVotedHelpful}
          className={cn(
            'text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border transition-colors text-xs font-medium',
            hasVotedHelpful && 'text-primary border-primary bg-primary/5'
          )}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {hasVotedHelpful ? 'Helpful' : 'Mark as helpful'} ({helpfulCount})
        </button>
      </div>
    </div>
  )
}

export default function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLFormElement>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('review') === '1') {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [searchParams])

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const ratingDistribution = [0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) ratingDistribution[r.rating - 1]++
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setError('Please sign in to submit a review')
      return
    }
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    if (!body.trim()) {
      setError('Please write a review')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ productId, rating, body: body.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit review')
      }
      setSubmitted(true)
      setRating(0)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-muted/30 rounded-xl">
        <div className="text-center md:text-left">
          <p className="text-5xl font-bold text-primary">{avgRating.toFixed(1)}</p>
          <div className="flex justify-center md:justify-start mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-5 h-5',
                  i < Math.round(avgRating) ? 'fill-primary text-primary' : 'text-muted'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star - 1]
            const pct = reviews.length ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-10 flex items-center justify-end gap-0.5 text-muted-foreground">{star}<Star className="w-3 h-3 fill-current" /></span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-muted-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Be the first to share your thoughts and experience with this product."
          variant="card"
          className="py-10"
        />
      )}

      {/* Submit Form */}
      {!submitted ? (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 scroll-mt-24">
          <h3 className="text-lg font-semibold">Write a Review</h3>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star
                    className={cn(
                      'w-7 h-7 transition-colors',
                      star <= (hoverRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="review-body" className="text-sm font-medium mb-2 block">
              Your Review
            </label>
            <Textarea
              id="review-body"
              placeholder={
                session?.user
                  ? 'Share your experience with this product...'
                  : 'Sign in to leave a review'
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              disabled={!session?.user}
            />
          </div>

          <Button type="submit" disabled={submitting || !session?.user}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Star className="w-10 h-10 mx-auto mb-2 text-primary fill-primary" />
          <p className="font-semibold">Review Submitted!</p>
          <p className="text-sm text-muted-foreground">
            Thank you for your feedback. It will appear after approval.
          </p>
        </div>
      )}
    </div>
  )
}
