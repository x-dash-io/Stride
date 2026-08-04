import { Metadata } from 'next'
import { SuccessState } from '@/components/ui/success-state'

export const metadata: Metadata = {
  title: 'Thank You | STRIDE Newsletter',
  description: 'You have successfully subscribed to the STRIDE newsletter.',
}

export default function NewsletterThankYouPage() {
  return (
    <SuccessState
      title="You're In!"
      message="Thank you for subscribing to the STRIDE newsletter. We will send you updates on new arrivals, exclusive offers, and style inspiration."
      action={{ label: 'Continue Shopping', href: '/' }}
      variant="full"
    />
  )
}
