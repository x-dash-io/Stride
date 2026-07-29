import { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Thank You | STRIDE Newsletter',
  description: 'You have successfully subscribed to the STRIDE newsletter.',
}

export default function NewsletterThankYouPage() {
  return (
    <div className="container-max py-24">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">You&apos;re In!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for subscribing to the STRIDE newsletter. We will send you updates on new arrivals, exclusive offers, and style inspiration.
        </p>
        <Button variant="default" asChild><a href="/">Continue Shopping</a></Button>
      </div>
    </div>
  )
}
