'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SizeGuidePage() {
  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-max py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Size Guide</span>
        </div>
      </div>

      {/* Header */}
      <section className="container-max pb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
          Size Guide
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Find your perfect fit with our comprehensive sizing charts. All our shoes come with our fit guarantee.
        </p>
      </section>

      {/* Size Charts */}
      <section className="container-max section-padding border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Men's Sizing */}
          <div>
            <h2 className="text-3xl font-serif font-bold mb-8">Men&apos;s Sizing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">US Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">EU Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { us: '6', eu: '38.5', length: '24.1' },
                    { us: '7', eu: '39', length: '24.6' },
                    { us: '8', eu: '40', length: '25.4' },
                    { us: '9', eu: '41', length: '26.0' },
                    { us: '10', eu: '42', length: '26.7' },
                    { us: '11', eu: '43', length: '27.3' },
                    { us: '12', eu: '44', length: '28.0' },
                    { us: '13', eu: '45', length: '28.6' },
                  ].map((size) => (
                    <tr key={size.us} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{size.us}</td>
                      <td className="py-3 px-4">{size.eu}</td>
                      <td className="py-3 px-4">{size.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Women's Sizing */}
          <div>
            <h2 className="text-3xl font-serif font-bold mb-8">Women&apos;s Sizing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">US Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">EU Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { us: '5', eu: '35', length: '22.0' },
                    { us: '6', eu: '36', length: '22.6' },
                    { us: '7', eu: '37', length: '23.2' },
                    { us: '8', eu: '38', length: '23.8' },
                    { us: '9', eu: '39', length: '24.4' },
                    { us: '10', eu: '40', length: '25.1' },
                    { us: '11', eu: '41', length: '25.7' },
                    { us: '12', eu: '42', length: '26.3' },
                  ].map((size) => (
                    <tr key={size.us} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{size.us}</td>
                      <td className="py-3 px-4">{size.eu}</td>
                      <td className="py-3 px-4">{size.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* How to Measure */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h3 className="text-2xl font-serif font-bold mb-6">How to Measure Your Feet</h3>
          <ol className="space-y-4 text-lg">
            <li className="flex gap-4">
              <span className="font-bold text-accent min-w-8">1.</span>
              <span>Place a sheet of paper on the floor and ensure your heel is against the wall.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-accent min-w-8">2.</span>
              <span>Mark the longest part of your foot (typically your longest toe).</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-accent min-w-8">3.</span>
              <span>Use a ruler or measuring tape to measure the distance from the wall to the mark.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-accent min-w-8">4.</span>
              <span>Compare your measurement to our size chart above.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-accent min-w-8">5.</span>
              <span>We recommend measuring both feet as they may differ slightly. Use the larger measurement.</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Fit Tips */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12 text-balance">Fit Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg p-8">
            <h3 className="text-xl font-serif font-bold mb-4">Room to Breathe</h3>
            <p className="text-muted-foreground">
              There should be approximately a thumb&apos;s width of space between your longest toe and the end of the shoe.
            </p>
          </div>
          <div className="bg-card rounded-lg p-8">
            <h3 className="text-xl font-serif font-bold mb-4">Secure Fit</h3>
            <p className="text-muted-foreground">
              Your heel should not slip when walking. The shoe should feel snug around your midfoot and arch.
            </p>
          </div>
          <div className="bg-card rounded-lg p-8">
            <h3 className="text-xl font-serif font-bold mb-4">Afternoon Fitting</h3>
            <p className="text-muted-foreground">
              Feet swell throughout the day. Shop for shoes in the afternoon for the most accurate fit.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-max section-padding border-t border-border">
        <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready to Find Your Perfect Fit?</h2>
          <p className="text-lg opacity-90 mb-8">Browse our collection and find the perfect shoes for you.</p>
          <Button variant="secondary" asChild><Link href="/products" className="bg-primary-foreground text-primary hover:bg-opacity-90">Shop Now</Link></Button>
        </div>
      </section>
    </div>
  )
}
