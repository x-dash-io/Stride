'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/providers/ToastProvider'
import { Mail, CheckCircle2 } from 'lucide-react'

export function NewsletterForm() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Subscription failed')
      setSubscribed(true)
      showToast('success', data.message || 'Subscribed!')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Subscription failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-5 h-5" />
        <span>You&apos;re subscribed — welcome to the family!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2 items-center">
      <div className="relative flex-1 h-10">
        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="pl-10 h-full"
          aria-label="Email address"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="h-10">
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  )
}
