'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Subscribed!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Check className="h-4 w-4" />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground">Subscribe to newsletter</label>
      <div className="flex items-center gap-0">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="h-9 rounded-l-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-transparent w-48"
          aria-label="Email address"
        />
        <Button type="submit" size="sm" className="rounded-l-none h-9" disabled={status === 'loading'}>
          {status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Subscribe'}
        </Button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-destructive">{message}</p>
      )}
    </form>
  )
}
