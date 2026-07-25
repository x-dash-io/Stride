'use client'

import Link from 'next/link'
import { ChevronRight, Check } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-max py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Shipping</span>
        </div>
      </div>

      {/* Header */}
      <section className="container-max pb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
          Shipping Information
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          We ship worldwide with fast, reliable delivery. Learn about our shipping options and policies.
        </p>
      </section>

      {/* Shipping Options */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Shipping Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Standard Shipping',
              time: '5-7 Business Days',
              cost: 'Free over $100',
              basePrice: '$9.99',
              features: ['USPS/UPS', 'Tracking included', 'Fully insured'],
            },
            {
              name: 'Express Shipping',
              time: '2-3 Business Days',
              cost: '$19.99',
              basePrice: '$19.99',
              features: ['Priority delivery', 'Real-time tracking', 'Signature on delivery'],
              highlight: true,
            },
            {
              name: 'Overnight Shipping',
              time: '1 Business Day',
              cost: '$49.99',
              basePrice: '$49.99',
              features: ['Overnight delivery', '24/7 support', 'Guaranteed delivery'],
            },
          ].map((option) => (
            <div
              key={option.name}
              className={`rounded-lg p-8 border ${
                option.highlight
                  ? 'bg-accent/10 border-accent'
                  : 'bg-card border-border'
              }`}
            >
              <h3 className="text-2xl font-serif font-bold mb-2">{option.name}</h3>
              <p className="text-accent font-semibold mb-4">{option.time}</p>
              <p className="text-3xl font-bold mb-6">{option.basePrice}</p>
              <ul className="space-y-3">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-accent" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping Destinations */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Shipping Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6">Domestic Shipping</h3>
            <p className="text-muted-foreground mb-4">
              We ship throughout the United States. Standard shipping is free on orders over $100.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Continental United States: 5-7 business days</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Alaska & Hawaii: 7-10 business days</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> All orders include tracking</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Delivery signature may be required</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6">International Shipping</h3>
            <p className="text-muted-foreground mb-4">
              We ship to over 100 countries worldwide. International rates vary by destination.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Processing: 1-2 business days</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Delivery: 7-14 business days</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Customs handling included</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> DHL Express available</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Track Your Order</h2>
        <div className="bg-muted/50 rounded-lg p-8">
          <p className="text-lg mb-6">
            Once your order ships, you&apos;ll receive a tracking number via email. You can also track your order from your account dashboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-accent mb-2">Step 1: Order Confirmation</p>
              <p className="text-sm text-muted-foreground">Receive confirmation email immediately</p>
            </div>
            <div>
              <p className="font-semibold text-accent mb-2">Step 2: Processing</p>
              <p className="text-sm text-muted-foreground">Your order is packed and prepared</p>
            </div>
            <div>
              <p className="font-semibold text-accent mb-2">Step 3: Shipment</p>
              <p className="text-sm text-muted-foreground">Receive tracking number and delivery details</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'Do you ship internationally?',
              a: 'Yes! We ship to over 100 countries. International shipping rates vary by destination.',
            },
            {
              q: 'Is shipping free?',
              a: 'Standard shipping is free on orders over $100. Otherwise, it starts at $9.99.',
            },
            {
              q: 'Can I change my shipping address?',
              a: 'Yes, as long as your order hasn\'t been shipped yet. Contact us within 2 hours of ordering.',
            },
            {
              q: 'What if my package is lost?',
              a: 'All our packages are fully insured. If your package is lost, we\'ll replace it or refund you.',
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
          <h2 className="text-3xl font-serif font-bold mb-4">Questions About Shipping?</h2>
          <p className="text-lg opacity-90 mb-8">Contact our support team anytime. We&apos;re here to help!</p>
          <Link href="/contact" className="btn-secondary bg-primary-foreground text-primary hover:bg-opacity-90">
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  )
}
