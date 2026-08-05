'use client'

import { Check, Heart, Link2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/providers/ToastProvider'

interface ProductActionsProps {
  hasStock: boolean
  isAdding: boolean
  addedToCart: boolean
  isWishlisted: boolean
  productUrl?: string
  onAddToCart: () => void
  onToggleWishlist: () => void
}

export function ProductActions({ hasStock, isAdding, addedToCart, isWishlisted, productUrl, onAddToCart, onToggleWishlist }: ProductActionsProps) {
  const { showToast } = useToast()

  const handleShare = async () => {
    const url = productUrl || window.location.href
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: document.title, url })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      showToast('success', 'Link copied to clipboard')
    } catch {
      showToast('error', 'Could not copy the link')
    }
  }

  return (
    <div className="space-y-3 mb-8">
      <Button
        onClick={onAddToCart}
        disabled={!hasStock || isAdding}
        variant="default"
        className={cn('w-full py-4 rounded font-semibold text-lg', addedToCart && 'bg-green-600')}
      >
        {addedToCart ? (
          <> <Check className="w-5 h-5 mr-2" /> Added to Cart </>
        ) : isAdding ? (
          <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding... </>
        ) : !hasStock ? (
          'Out of Stock'
        ) : (
          'Add to Cart'
        )}
      </Button>

      <div className="flex gap-3">
        <button
          onClick={onToggleWishlist}
          className={cn(
            'flex-1 py-3 rounded border-2 transition-all flex items-center justify-center gap-2',
            isWishlisted ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
          )}
        >
          <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
          {isWishlisted ? 'Wishlisted' : 'Wishlist'}
        </button>
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2" onClick={handleShare}>
          <Link2 className="w-5 h-5" />
          Share
        </Button>
      </div>
    </div>
  )
}