'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-max py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Privacy Policy</span>
        </div>
      </div>

      {/* Header */}
      <section className="container-max pb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground">Last updated: July 25, 2026</p>
      </section>

      {/* Content */}
      <section className="container-max section-padding border-t border-border max-w-4xl">
        <div className="prose prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              STRIDE (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the www.stride.com website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">2. Information Collection and Use</h2>
            <p className="text-muted-foreground mb-4">We collect several different types of information:</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Data:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                  <li>Payment information (processed by secure third-party payment providers)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Data:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>IP address</li>
                  <li>Referral source</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">3. Use of Data</h2>
            <p className="text-muted-foreground mb-4">STRIDE uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide and maintain our website</li>
              <li>To notify you about changes to our website</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information for improving our website</li>
              <li>To monitor the usage of our website</li>
              <li>To detect, prevent and address technical issues and fraud</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">4. Security of Data</h2>
            <p className="text-muted-foreground">
              The security of your data is important to us but remember that no method of transmission over the Internet is 100% secure. We use industry-standard SSL encryption to protect your personal information. However, we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">5. Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>The right to access, update or delete your personal data</li>
              <li>The right to rectification of inaccurate data</li>
              <li>The right to restrict processing of your data</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">6. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies to track activity on our website and hold certain information. Cookies are files with a small amount of data that are stored on your device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">7. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this page.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at hello@stride.co.ke or call +254 700 123 456.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
