'use client'

import { useState } from 'react'
import { Star, ThumbsUp } from 'lucide-react'
import { getProductReviews } from '@/lib/data/reviews'

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  const reviews = getProductReviews(productId)
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rate) => ({
    rating: rate,
    count: reviews.filter((r) => r.rating === rate).length,
    percentage: reviews.length > 0 ? ((reviews.filter((r) => r.rating === rate).length / reviews.length) * 100).toFixed(0) : 0,
  }))

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    setReviewText('')
    setRating(5)
    setShowReviewForm(false)
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-serif font-bold mb-8">Reviews & Ratings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Rating Summary */}
        <div className="md:col-span-1">
          <div className="space-y-6">
            {/* Overall Rating */}
            <div>
              <p className="text-4xl font-bold mb-2">{averageRating}</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(averageRating))
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((dist) => (
                <div key={dist.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    {[...Array(dist.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-accent text-accent"
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {dist.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Write Review Button */}
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary w-full mt-4"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="md:col-span-2 bg-muted/30 rounded-lg p-8 border border-border">
            <h3 className="text-xl font-serif font-bold mb-6">Share Your Experience</h3>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="text-sm font-semibold block mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setRating(rate)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rate <= rating
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-sm font-semibold block mb-2">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="input-base min-h-28"
                  required
                ></textarea>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-primary w-full">
                Post Review
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to share your experience!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold mb-1">{review.author}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{review.text}</p>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
