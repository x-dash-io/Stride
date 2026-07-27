'use client'

import { useState } from 'react'

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
        <input id="name" type="text" required className="input-base w-full" placeholder="John Doe" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input id="email" type="email" required className="input-base w-full" placeholder="john@example.com" />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
        <input id="subject" type="text" required className="input-base w-full" placeholder="How can we help?" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
        <textarea id="message" required rows={5} className="input-base w-full resize-y" placeholder="Tell us more..." />
      </div>
      <button type="submit" className="btn-primary w-full">Send Message</button>
    </form>
  )
}
