'use client'

import Link from 'next/link'
import { ChevronRight, Check, Truck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
          Kenya Delivery Information
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          We deliver right to your doorstep anywhere in Kenya. Fast, reliable, and convenient.
        </p>
      </section>

      {/* Shipping Options */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Delivery Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Nairobi Standard',
              time: '1-2 Business Days',
              basePrice: 'KSh 300',
              features: ['Rider door delivery', 'SMS dispatch updates', 'Pay via M-Pesa STK Push'],
              highlight: true,
            },
            {
              name: 'Upcountry Kenya',
              time: '2-3 Business Days',
              basePrice: 'KSh 500',
              features: ['Mombasa, Kisumu, Nakuru, Eldoret & all counties', 'Courier tracking provided', 'Direct delivery to your doorstep/town agent'],
            },
            {
              name: 'Store Pickup',
              time: 'Same Day Pickup',
              basePrice: 'Free',
              features: ['Pick up at Two Rivers Mall', 'Try on in-store', 'Instant fulfillment'],
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

      {/* Shipping Coverage */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Coverage Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-accent" /> Nairobi Metropolitan
            </h3>
            <p className="text-muted-foreground mb-4">
              We cover all areas within Nairobi and surrounding zones including Westlands, Kilimani, Karen, Lavington, Kasarani, Kiambu Road, Thika Road, and Ruiru.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Same-day processing for orders placed before 12:00 PM</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Direct rider contact upon arrival</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 text-accent" /> Rest of Kenya (Upcountry)
            </h3>
            <p className="text-muted-foreground mb-4">
              We deliver across major cities and towns including Mombasa, Kisumu, Nakuru, Eldoret, Nyeri, Machakos, Meru, Malindi, Kakamega, and Naivasha.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Reliable courier partners</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Safe & secure parcel handling</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'How do I pay for shipping?',
              a: 'Shipping costs are added at checkout and paid seamlessly together with your order via M-Pesa STK Push.',
            },
            {
              q: 'Can I pick up my order in person?',
              a: 'Yes! Select Store Pickup at checkout to pick up your order free of charge at our Two Rivers Mall location in Nairobi.',
            },
            {
              q: 'Can I change my delivery address?',
              a: 'Yes, contact our team on +254 700 123 456 as soon as possible before dispatch.',
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
          <h2 className="text-3xl font-serif font-bold mb-4">Questions About Delivery?</h2>
          <p className="text-lg opacity-90 mb-8">Contact our support team anytime on +254 700 123 456.</p>
          <Button variant="secondary" asChild><Link href="/contact" className="bg-primary-foreground text-primary hover:bg-opacity-90">Contact Support</Link></Button>
        </div>
      </section>
    </div>
  )
}
