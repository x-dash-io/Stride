'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/providers/ToastProvider'

/**
 * Reads URL search params to surface toast notifications from server-side redirects.
 * - ?blocked=checkout → shown when an admin tries to visit /cart/checkout
 * - ?reason=suspended → shown when a suspended admin is redirected to /admin/subscription
 */
export function AdminSuspensionBanner() {
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  useEffect(() => {
    const blocked = searchParams.get('blocked')
    const reason = searchParams.get('reason')

    if (blocked === 'checkout') {
      showToast('info', 'Admin accounts cannot place orders. Use a customer account to make purchases.')
    }

    if (reason === 'suspended') {
      showToast('error', 'Some sections are locked because your store subscription is overdue. Please clear your dues to restore full access.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
