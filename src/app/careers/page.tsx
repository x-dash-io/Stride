import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | STRIDE',
  description: 'Join the STRIDE team. We are always looking for passionate people to help us redefine footwear in Kenya.',
}

const positions = [
  { title: 'Store Manager', location: 'Nairobi', type: 'Full-time', description: 'Lead our flagship store team, manage inventory, and deliver exceptional customer experiences.' },
  { title: 'Digital Marketing Specialist', location: 'Nairobi', type: 'Full-time', description: 'Drive our online presence across social media, email, and paid channels.' },
  { title: 'Supply Chain Coordinator', location: 'Nairobi', type: 'Full-time', description: 'Manage logistics, supplier relationships, and inventory planning.' },
  { title: 'Customer Experience Associate', location: 'Nairobi', type: 'Full-time', description: 'Be the voice of STRIDE, helping customers with orders, returns, and inquiries.' },
]

export default function CareersPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2">Join Our Team</h1>
        <p className="text-muted-foreground mb-8">Help us redefine footwear in Kenya.</p>

        <div className="prose max-w-none mb-12">
          <p>STRIDE is building the premier footwear destination in East Africa. We believe in great design, quality craftsmanship, and exceptional service. If that sounds like you, we want to hear from you.</p>
          <p className="mt-4">We value creativity, attention to detail, and a customer-first mindset. Our team is diverse, passionate, and always striving to be better.</p>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Open Positions</h2>
        <div className="space-y-4">
          {positions.map((role) => (
            <div key={role.title} className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{role.title}</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{role.type}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{role.location}</p>
              <p className="text-muted-foreground text-sm mt-2">{role.description}</p>
              <button className="btn-primary mt-4 text-sm">Apply Now</button>
            </div>
          ))}
        </div>

        {positions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No open positions at the moment. Check back later or follow us on social media for updates.</p>
          </div>
        )}
      </div>
    </div>
  )
}
