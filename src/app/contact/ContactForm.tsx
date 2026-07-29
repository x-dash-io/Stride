'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-6 bg-accent rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
        <p className="text-muted-foreground">Thank you for reaching out. We will get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
        <Input id="name" type="text" required placeholder="John Doe" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <Input id="email" type="email" required placeholder="john@example.com" />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
        <Input id="subject" type="text" required placeholder="How can we help?" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
        <textarea id="message" required rows={5} className="w-full px-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground text-sm resize-y transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" placeholder="Tell us more..." />
      </div>
      <Button type="submit" variant="default" className="w-full">Send Message</Button>
    </form>
  )
}
