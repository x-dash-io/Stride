import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getWishlist } from '@/lib/queries'
import { removeFromWishlist } from '@/app/actions/wishlist'
import WishlistClient from './WishlistClient'

export const metadata: Metadata = {
  title: 'My Wishlist | STRIDE',
  description: 'View and manage your wishlist items.',
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/account/wishlist')

  // Admins and Super Admins should use the admin dashboard, not the customer account page
  if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }

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
