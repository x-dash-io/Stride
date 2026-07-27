import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AddressForm } from '@/components/forms/AddressForm'

export const metadata: Metadata = {
  title: 'Edit Address | STRIDE',
  description: 'Edit your shipping address.',
}

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const { id } = await params

  const address = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!address) notFound()

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="mb-8">
        <Link href="/account/addresses" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Addresses
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Edit Address</h1>
        <p className="text-muted-foreground">Update your address details</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-6">
          <AddressForm
            addressId={address.id}
            initialData={{
              label: address.label,
              firstName: address.firstName,
              lastName: address.lastName,
              phone: address.phone || '',
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2 || '',
              city: address.city,
              state: address.state || '',
              postalCode: address.postalCode,
              country: address.country,
              isDefault: address.isDefault,
            }}
          />
        </div>
      </div>
    </div>
  )
}
