'use client'

import Link from 'next/link'
import { ChevronRight, PhoneCall, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReturnsPage() {
  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-max py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Returns & Support</span>
        </div>
      </div>

      {/* Header */}
      <section className="container-max pb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
          Returns & Exchanges Support
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Need help with your order size or item condition? Contact our team directly and we will assist you.
        </p>
      </section>

      {/* Return Inquiry Steps */}
      <section className="container-max section-padding border-t border-border">
        <div className="bg-card border border-border rounded-xl p-8 max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-serif font-bold">How Return & Exchange Inquiries Work</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about item fit, size exchange, or order condition upon delivery, please contact our customer care team with your order number.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/40">
              <PhoneCall className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">Call / WhatsApp</h3>
              <p className="text-xs text-muted-foreground">+254 700 123 456</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/40">
              <Mail className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">Email Us</h3>
              <p className="text-xs text-muted-foreground">hello@stride.co.ke</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/40">
              <MessageSquare className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">In-Store</h3>
              <p className="text-xs text-muted-foreground">Two Rivers Mall, Nairobi</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-max section-padding border-t border-border">
        <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Have Questions About Your Order?</h2>
          <p className="text-lg opacity-90 mb-8">Reach out to our customer support team for direct assistance.</p>
          <Button variant="secondary" asChild><Link href="/contact" className="bg-primary-foreground text-primary hover:bg-opacity-90">Contact Support</Link></Button>
        </div>
      </section>
    </div>
  )
}
