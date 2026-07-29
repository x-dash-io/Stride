'use client'

import Link from 'next/link'
import { ChevronRight, AlertCircle, Check, X } from 'lucide-react'
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
          <span className="text-foreground">Returns</span>
        </div>
      </div>

      {/* Header */}
      <section className="container-max pb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
          Returns & Exchanges
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          We want you to be completely satisfied. Easy returns and exchanges within 30 days.
        </p>
      </section>

      {/* Return Policy Overview */}
      <section className="container-max section-padding border-t border-border">
        <div className="bg-accent/10 border border-accent rounded-lg p-8 mb-12">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Our Guarantee</h3>
              <p>30-day returns on all original, unworn items. Free return shipping on orders over $100. No questions asked.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-4">30</div>
            <h3 className="text-lg font-semibold mb-2">Days to Return</h3>
            <p className="text-muted-foreground text-sm">Return items within 30 days of purchase for a full refund</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-4">FREE</div>
            <h3 className="text-lg font-semibold mb-2">Return Shipping</h3>
            <p className="text-muted-foreground text-sm">Free returns for orders over $100. $5.99 for smaller orders</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-4">5-7</div>
            <h3 className="text-lg font-semibold mb-2">Days to Refund</h3>
            <p className="text-muted-foreground text-sm">Refunds processed within 5-7 business days of receiving your return</p>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">How to Return an Item</h2>
        <div className="space-y-6">
          {[
            {
              step: 1,
              title: 'Start a Return',
              description: 'Log into your account and go to &quot;Orders&quot;. Select the item you want to return and click &quot;Start Return&quot;.',
            },
            {
              step: 2,
              title: 'Pack Your Item',
              description: 'Pack your item securely in its original packaging. Ensure the item is clean and unworn with all original materials.',
            },
            {
              step: 3,
              title: 'Get a Shipping Label',
              description: 'Download your prepaid shipping label from your account. Print it and attach it to your package.',
            },
            {
              step: 4,
              title: 'Ship Your Package',
              description: 'Drop your package at any shipping location. You can track your return package via email.',
            },
            {
              step: 5,
              title: 'Receive Your Refund',
              description: 'Once we receive and inspect your return, your refund will be processed within 5-7 business days.',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 pb-6 border-b border-border last:border-b-0">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold">
                  {item.step}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What Qualifies */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">What Qualifies for Return?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6 text-accent flex items-center gap-2"><Check className="w-6 h-6" /> Returnable Items</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Unworn shoes with original packaging</li>
              <li>• All original materials and boxes included</li>
              <li>• Within 30 days of purchase</li>
              <li>• Clean shoes without scuffs or damage</li>
              <li>• Wrong size or color received</li>
              <li>• Defective or damaged products</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6 text-destructive flex items-center gap-2"><X className="w-6 h-6" /> Non-Returnable Items</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Worn or scuffed shoes</li>
              <li>• Missing original packaging</li>
              <li>• Purchased over 30 days ago</li>
              <li>• Custom or personalized orders</li>
              <li>• Shoes purchased on clearance (final sale)</li>
              <li>• Items without proof of purchase</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Exchanges */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Exchanges</h2>
        <div className="bg-muted/50 rounded-lg p-8">
          <p className="text-lg mb-6">
            Need a different size or color? Exchanges are free and we&apos;ll ship your replacement within 1 business day.
          </p>
          <h3 className="text-xl font-semibold mb-4">Exchange Process:</h3>
          <ol className="space-y-3 text-muted-foreground">
            <li>1. Start an exchange from your account</li>
            <li>2. Select the item you want to exchange and the new size/color</li>
            <li>3. Ship the original item using our prepaid label</li>
            <li>4. Your replacement ships as soon as we process your return</li>
          </ol>
        </div>
      </section>

      {/* FAQs */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'How long do I have to return items?',
              a: 'You have 30 days from the date of purchase to return items. Items must be unworn and in original packaging.',
            },
            {
              q: 'Is return shipping free?',
              a: 'Return shipping is free for orders over $100. For orders under $100, return shipping is $5.99.',
            },
            {
              q: 'When will I receive my refund?',
              a: 'Once we receive your return, it will be processed within 5-7 business days. Refunds are issued to your original payment method.',
            },
            {
              q: 'Can I return sale items?',
              a: 'Items marked as final sale cannot be returned. All other sale items qualify for our 30-day return guarantee.',
            },
            {
              q: 'What if I received a damaged item?',
              a: 'Contact us immediately with photos. We&apos;ll replace your item or issue a full refund at no cost to you.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-border pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold mb-3">{faq.q}</h3>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-max section-padding border-t border-border">
        <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Need Help With a Return?</h2>
          <p className="text-lg opacity-90 mb-8">Our support team is ready to assist you with any questions.</p>
          <Button variant="secondary" asChild><Link href="/contact" className="bg-primary-foreground text-primary hover:bg-opacity-90">Contact Support</Link></Button>
        </div>
      </section>
    </div>
  )
}
