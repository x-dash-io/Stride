'use client'

import { Star, ThumbsUp } from 'lucide-react'
import { Product } from '@/types'

interface ProductReviewsProps {
  reviews: Product['reviews']
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  return (
    <section className="container-max py-12 border-t border-border">
      <h2 className="text-3xl font-serif font-bold mb-8">Customer Reviews</h2>
      {reviews && reviews.length > 0 ? (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-8 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified Purchase</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
              <p className="text-muted-foreground text-sm mb-4">{review.body}</p>
              <div className="flex items-center gap-4 text-sm">
                <button className="text-muted-foreground hover:text-foreground flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> Helpful ({review.helpfulCount})</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
      )}
    </section>
  )
}