import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getWishlist } from '@/lib/queries'
import { removeFromWishlist } from '@/app/actions/wishlist'
import WishlistClient from './WishlistClient'
import { requireCustomer } from '@/lib/authz'

export const metadata: Metadata = {
  title: 'My Wishlist | STRIDE',
  description: 'View and manage your wishlist items.',
}

export default async function WishlistPage() {
  const session = await requireCustomer({ callbackUrl: '/account/wishlist' })

  const wishlist = await getWishlist(session.user.id)

  const items = (wishlist?.items || []) as any[]

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {items.length > 0
            ? `${items.length} item${items.length !== 1 ? 's' : ''} saved`
            : 'Items you save will appear here'}
        </p>
      </div>

      <WishlistClient items={items} />
    </div>
  )
}
