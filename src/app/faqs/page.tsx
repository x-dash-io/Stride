import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQs | STRIDE',
  description: 'Frequently asked questions about ordering, shipping, returns, sizing, and payments at STRIDE.',
}

const faqs = [
  { category: 'Orders', qa: [
    { q: 'How do I place an order?', a: 'Browse our collection, select your preferred size and color, add to cart, and proceed to checkout. Payment is made seamlessly via M-Pesa STK Push.' },
    { q: 'Can I modify or cancel my order?', a: 'Please contact our team on +254 700 123 456 immediately if you need to modify your order before dispatch.' },
    { q: 'How do I track my order?', a: 'Once dispatched, you will receive order updates via SMS and email.' },
  ]},
  { category: 'Shipping & Delivery', qa: [
    { q: 'How long does delivery take?', a: 'Nairobi Metropolitan: 1-2 business days. Upcountry Kenya: 2-3 business days. Store Pickup: Same day.' },
    { q: 'How much does delivery cost?', a: 'Nairobi delivery is KSh 300. Upcountry delivery across Kenya is KSh 500. Store pickup at Two Rivers Mall is Free.' },
    { q: 'Do you deliver across all of Kenya?', a: 'Yes! We deliver to all 47 counties in Kenya.' },
  ]},
  { category: 'Returns & Exchanges', qa: [
    { q: 'What should I do if I need help with an order or size?', a: 'If you have any questions about fit or item condition, please contact our support team at hello@stride.co.ke or call +254 700 123 456.' },
  ]},
  { category: 'Sizing', qa: [
    { q: 'How do I find my correct size?', a: 'Check our size guide page for detailed measurements in EU/UK/US sizes. Each product page also lists available sizes.' },
  ]},
  { category: 'Payment', qa: [
    { q: 'What payment methods do you accept?', a: 'We accept M-Pesa STK Push (Lipa na M-Pesa) prompt sent directly to your phone and Cash on Delivery.' },
    { q: 'Is M-Pesa payment secure?', a: 'Yes, all M-Pesa transactions are processed securely through Safaricom\'s official Daraja API.' },
  ]},
]

export default function FAQsPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-12">Everything you need to know about shopping at STRIDE.</p>

        <div className="space-y-10">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="text-2xl font-semibold mb-4">{section.category}</h2>
              <div className="space-y-4">
                {section.qa.map((item, i) => (
                  <details key={i} className="group border border-border rounded-lg">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-accent/50 rounded-lg [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-4 pb-4 text-muted-foreground">{item.a}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
