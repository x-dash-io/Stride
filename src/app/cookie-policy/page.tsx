import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | STRIDE',
  description: 'How STRIDE uses cookies and similar technologies on our website.',
}

export default function CookiePolicyPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: July 2026</p>

        <div className="prose max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">How We Use Cookies</h2>
            <p>STRIDE uses cookies for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Essential:</strong> Required for the website to function (cart, authentication, security)</li>
              <li><strong>Analytics:</strong> Help us understand how visitors use our site (page views, navigation paths)</li>
              <li><strong>Functional:</strong> Remember your preferences (currency, language, saved items)</li>
              <li><strong>Marketing:</strong> Used to deliver relevant advertisements and measure campaign effectiveness</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Types of Cookies We Use</h2>
            <div className="space-y-4 mt-2">
              <div>
                <p className="font-medium text-foreground">Session Cookies</p>
                <p>These are temporary cookies that expire when you close your browser. They enable core functionality like maintaining your cart during a browsing session.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Persistent Cookies</p>
                <p>These remain on your device for a set period. We use them to remember your preferences and login status across visits.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Third-Party Cookies</p>
                <p>We use services like Google Analytics and Facebook Pixel that may set their own cookies. Please refer to their respective privacy policies for details.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Managing Cookies</h2>
            <p>You can control and manage cookies in your browser settings. Most browsers allow you to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>View cookies stored on your device</li>
              <li>Block cookies from specific sites</li>
              <li>Delete all cookies</li>
              <li>Set preferences for Do Not Track</li>
            </ul>
            <p className="mt-4">Please note that blocking essential cookies may affect the functionality of our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">GDPR Compliance</h2>
            <p>For visitors from the European Economic Area, we obtain your consent before placing non-essential cookies. You can change your cookie preferences at any time through the cookie consent banner.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p>If you have questions about our cookie policy, please contact us at privacy@stride.co.ke.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
