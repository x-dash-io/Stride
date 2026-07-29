import { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Affiliate Program | STRIDE',
  description: 'Join the STRIDE affiliate program and earn commissions by promoting premium footwear.',
}

export default function AffiliatesPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2">Affiliate Program</h1>
        <p className="text-muted-foreground mb-12">Earn while sharing footwear you love.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 border border-border rounded-lg text-center">
            <p className="text-3xl font-bold text-primary mb-2">10%</p>
            <p className="text-sm text-muted-foreground">Commission on every sale</p>
          </div>
          <div className="p-6 border border-border rounded-lg text-center">
            <p className="text-3xl font-bold text-primary mb-2">30 days</p>
            <p className="text-sm text-muted-foreground">Cookie duration</p>
          </div>
          <div className="p-6 border border-border rounded-lg text-center">
            <p className="text-3xl font-bold text-primary mb-2">Monthly</p>
            <p className="text-sm text-muted-foreground">Payout schedule</p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="space-y-4 text-muted-foreground list-decimal pl-5">
            <li>Sign up for the affiliate program</li>
            <li>Get your unique referral link and creative assets</li>
            <li>Share STRIDE products on your blog, social media, or website</li>
            <li>Earn 10% commission on every sale made through your link</li>
            <li>Get paid monthly once you reach KES 2,000 in commissions</li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Who Can Join?</h2>
          <p className="text-muted-foreground">
            Fashion bloggers, social media influencers, content creators, and anyone with an audience
            interested in premium footwear. If you love shoes and have a platform, we want to work with you.
          </p>
        </section>

        <div className="p-8 bg-accent rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground mb-6">Join hundreds of affiliates earning with STRIDE.</p>
          <Button variant="default">Sign Up as an Affiliate</Button>
        </div>
      </div>
    </div>
  )
}
