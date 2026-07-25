'use client'

import Link from 'next/link'
import { ChevronRight, Check } from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-max py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Accessibility</span>
        </div>
      </div>

      {/* Header */}
      <section className="container-max pb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
          Accessibility Statement
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          We are committed to ensuring our website is accessible to everyone, including people with disabilities.
        </p>
      </section>

      {/* Commitment */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-8">Our Commitment</h2>
        <p className="text-lg text-muted-foreground mb-6">
          STRIDE is committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability. We are continuously working to improve the accessibility of our website to comply with Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards.
        </p>
      </section>

      {/* Features */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Accessibility Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            'Fully keyboard navigable interface',
            'Screen reader compatible',
            'High contrast text and backgrounds',
            'Resizable fonts and responsive design',
            'Alt text for all images',
            'Descriptive link text',
            'Clear heading hierarchy',
            'Video captions and transcripts',
            'Form labels and error messages',
            'Skip navigation links',
            'Focus indicators on interactive elements',
            'Mobile-friendly responsive design',
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-8">Compliance Standards</h2>
        <div className="bg-muted/50 rounded-lg p-8">
          <p className="mb-6">
            We aim to comply with the following accessibility standards and guidelines:
          </p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="font-semibold min-w-max">WCAG 2.1:</span>
              <span className="text-muted-foreground">Web Content Accessibility Guidelines Level AA</span>
            </li>
            <li className="flex gap-4">
              <span className="font-semibold min-w-max">ADA:</span>
              <span className="text-muted-foreground">Americans with Disabilities Act</span>
            </li>
            <li className="flex gap-4">
              <span className="font-semibold min-w-max">Section 508:</span>
              <span className="text-muted-foreground">Rehabilitation Act of 1973</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Assistive Technology */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Tested Assistive Technologies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'NVDA', type: 'Screen Reader' },
            { name: 'JAWS', type: 'Screen Reader' },
            { name: 'VoiceOver', type: 'Screen Reader' },
            { name: 'Dragon NaturallySpeaking', type: 'Voice Control' },
            { name: 'Keyboard Navigation', type: 'Navigation' },
            { name: 'Mobile Screen Readers', type: 'Screen Reader' },
          ].map((tech) => (
            <div key={tech.name} className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">{tech.name}</h3>
              <p className="text-sm text-muted-foreground">{tech.type}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Accessibility Tips */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-12">Tips for Using Our Website</h2>
        <div className="space-y-6">
          {[
            {
              title: 'Keyboard Navigation',
              description: 'Use the Tab key to navigate through interactive elements, Enter to activate buttons, and arrow keys for menu navigation.',
            },
            {
              title: 'Screen Readers',
              description: 'Our website is fully compatible with major screen readers. Use standard screen reader commands for navigation.',
            },
            {
              title: 'Text Sizing',
              description: 'You can increase text size in your browser settings or use browser zoom. Most text will reflow and remain readable.',
            },
            {
              title: 'High Contrast',
              description: 'Enable high contrast mode in your operating system or browser for better visibility.',
            },
          ].map((tip, idx) => (
            <div key={idx} className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
              <p className="text-muted-foreground">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Known Issues */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-8">Known Issues</h2>
        <div className="bg-accent/10 border border-accent rounded-lg p-8">
          <p className="mb-4">
            We are aware of the following accessibility challenges and are actively working to improve them:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Some third-party payment processing may have limited accessibility features</li>
            <li>• Image galleries may require manual navigation with screen readers</li>
            <li>• Some interactive maps may have limited keyboard navigation</li>
          </ul>
          <p className="mt-6">
            If you encounter any accessibility issues not listed here, please let us know immediately.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="container-max section-padding border-t border-border">
        <h2 className="text-4xl font-serif font-bold mb-8">Contact Us</h2>
        <p className="text-lg text-muted-foreground mb-6">
          If you experience any difficulty accessing our website or have accessibility-related questions or suggestions, please contact us:
        </p>
        <div className="bg-card rounded-lg p-8 border border-border">
          <p className="mb-4">
            <span className="font-semibold">Email:</span> accessibility@stride.com
          </p>
          <p className="mb-4">
            <span className="font-semibold">Phone:</span> +1 (555) 123-4567
          </p>
          <p>
            <span className="font-semibold">Hours:</span> Monday - Friday, 9 AM - 5 PM PST
          </p>
        </div>
      </section>
    </div>
  )
}
