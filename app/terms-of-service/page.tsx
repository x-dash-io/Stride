'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container-max py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Terms of Service</span>
        </div>
      </div>

      {/* Header */}
      <section className="container-max pb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-balance mb-6">
          Terms of Service
        </h1>
        <p className="text-muted-foreground">Last updated: July 25, 2026</p>
      </section>

      {/* Content */}
      <section className="container-max section-padding border-t border-border max-w-4xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on the STRIDE website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">3. Disclaimer</h2>
            <p className="text-muted-foreground">
              The materials on the STRIDE website are provided on an &apos;as is&apos; basis. STRIDE makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">4. Limitations</h2>
            <p className="text-muted-foreground">
              In no event shall STRIDE or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the STRIDE website.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">5. Accuracy of Materials</h2>
            <p className="text-muted-foreground">
              The materials appearing on the STRIDE website could include technical, typographical, or photographic errors. STRIDE does not warrant that any of the materials on our website are accurate, complete, or current. STRIDE may make changes to the materials contained on our website at any time without notice.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">6. Materials and Links</h2>
            <p className="text-muted-foreground">
              STRIDE has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by STRIDE of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">7. Modifications</h2>
            <p className="text-muted-foreground">
              STRIDE may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">8. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms and conditions are governed by and construed in accordance with the laws of California, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">9. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              When you create an account with us, you must provide accurate and complete information. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Maintaining the confidentiality of your password</li>
              <li>Restricting access to your computer</li>
              <li>Accepting responsibility for all activities under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at legal@stride.com or call +1 (555) 123-4567.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
