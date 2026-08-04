import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, MapPin, Edit, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function AddressesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/account/addresses')

  // Admins and Super Admins should use the admin dashboard, not the customer account page
  if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' },
  })

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping and billing addresses</p>
        </div>
        <Button asChild>
          <Link href="/account/addresses/new">
            <Plus className="w-4 h-4 mr-2" /> Add Address
          </Link>
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-card border border-border rounded-xl p-6 relative">
              {address.isDefault && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  <Check className="w-3 h-3 inline mr-1" /> Default
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-medium">{address.firstName} {address.lastName}</p>
                  <p className="text-sm text-muted-foreground">{address.label}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/addresses/${address.id}/edit`}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                <p>{address.phone}</p>
              </div>
              {address.isDefault && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50">
                    <Check className="w-4 h-4 mr-1" /> Set as Default
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No addresses saved"
          description="Add a default shipping address to speed up checkout on future orders."
          action={{ label: 'Add Your First Address', href: '/account/addresses/new', icon: Plus }}
          variant="card"
          className="py-16"
        />
      )}
    </div>
  )
}