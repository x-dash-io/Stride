'use client'

import Link from 'next/link'
import { Award, Heart, Truck, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container-max section-padding">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">
            Our Story
          </p>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
            Crafted for Excellence
          </h1>
          <p className="text-lg text-muted-foreground">
            Founded in 2010, STRIDE has been dedicated to creating premium footwear that combines timeless design with uncompromising quality. Every shoe tells a story of craftsmanship and passion.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container-max section-padding bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To craft exceptional footwear that empowers individuals to express themselves through style and comfort. We believe that luxury should be accessible, and quality should never be compromised.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every pair of shoes we create is designed to be worn, not just displayed. Our mission is to provide footwear that makes you feel confident with every step.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To become the world&apos;s most trusted premium footwear brand, recognized for our unwavering commitment to quality, innovation, and sustainability.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We envision a future where luxury and sustainability go hand in hand, where craftsmanship is celebrated, and where every customer feels valued and respected.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-max section-padding">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">
            Our Values
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">
            What Guides Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card rounded-lg p-8">
            <Award className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-serif font-bold mb-3">Quality</h3>
            <p className="text-muted-foreground">
              We never compromise on materials, construction, or design. Every shoe undergoes rigorous quality control.
            </p>
          </div>

          <div className="bg-card rounded-lg p-8">
            <Heart className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-serif font-bold mb-3">Craftsmanship</h3>
            <p className="text-muted-foreground">
              Our artisans bring decades of experience to every pair. Handcrafted details make the difference.
            </p>
          </div>

          <div className="bg-card rounded-lg p-8">
            <Truck className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-serif font-bold mb-3">Sustainability</h3>
            <p className="text-muted-foreground">
              We&apos;re committed to sustainable practices, from sourcing materials to eco-friendly packaging.
            </p>
          </div>

          <div className="bg-card rounded-lg p-8">
            <Shield className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-serif font-bold mb-3">Integrity</h3>
            <p className="text-muted-foreground">
              Transparency and honesty are at the core of everything we do. We stand behind our products.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-max section-padding bg-muted/20">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">
            Milestones
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">
            Our Journey
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-accent"></div>
              <div className="w-1 h-24 bg-border"></div>
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">2010 - Foundation</h3>
              <p className="text-muted-foreground">
                STRIDE was founded by our visionary founder with a simple goal: create the finest premium footwear in the world.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-accent"></div>
              <div className="w-1 h-24 bg-border"></div>
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">2014 - International Expansion</h3>
              <p className="text-muted-foreground">
                Our first international boutique opened in Paris, establishing STRIDE as a luxury brand on the global stage.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-accent"></div>
              <div className="w-1 h-24 bg-border"></div>
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">2018 - Sustainability Initiative</h3>
              <p className="text-muted-foreground">
                We launched our comprehensive sustainability program, committing to ethical sourcing and eco-friendly practices.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-accent"></div>
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">2024 - Direct to Consumer</h3>
              <p className="text-muted-foreground">
                We launched our e-commerce platform, bringing our premium collection directly to discerning customers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-max section-padding">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">
            Leadership
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">
            Meet Our Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Alexander Montoya',
              title: 'Founder & Creative Director',
              bio: 'With 30+ years in luxury footwear, Alexander leads our design vision.',
            },
            {
              name: 'Sophie Laurent',
              title: 'Head of Craftsmanship',
              bio: 'Master artisan overseeing production quality and heritage techniques.',
            },
            {
              name: 'James Richardson',
              title: 'Chief Sustainability Officer',
              bio: 'Driving our commitment to environmental responsibility and ethical practices.',
            },
          ].map((member) => (
            <div key={member.name} className="bg-card rounded-lg p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4"></div>
              <h3 className="text-lg font-serif font-bold mb-1">{member.name}</h3>
              <p className="text-sm text-accent mb-4">{member.title}</p>
              <p className="text-muted-foreground text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-max section-padding bg-primary text-primary-foreground rounded-lg">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Join the STRIDE Community
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Discover our commitment to excellence. Shop our collection and experience premium footwear like never before.
          </p>
          <Button variant="secondary" asChild><Link href="/products" className="bg-primary-foreground text-primary">Explore Collection</Link></Button>
        </div>
      </section>
    </div>
  )
}
