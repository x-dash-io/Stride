import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AddressForm } from '@/components/forms/AddressForm'
import { requireCustomer } from '@/lib/authz'

export const metadata: Metadata = {
  title: 'Add Address | STRIDE',
  description: 'Add a new shipping address.',
}

export default async function NewAddressPage() {
  const session = await requireCustomer({ callbackUrl: '/account/addresses' })

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="mb-8">
        <Link href="/account/addresses" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Addresses
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Add Address</h1>
        <p className="text-muted-foreground">Add a new shipping or billing address</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-6">
          <AddressForm />
        </div>
      </div>
    </div>
  )
}
