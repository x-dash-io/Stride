import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQs | STRIDE',
  description: 'Frequently asked questions about ordering, shipping, returns, sizing, and payments at STRIDE.',
}

const faqs = [
  { category: 'Orders', qa: [
    { q: 'How do I place an order?', a: 'Browse our collection, select your preferred size and color, add to cart, and proceed to checkout. You can pay via M-Pesa or card.' },
    { q: 'Can I modify or cancel my order?', a: 'You can cancel within 1 hour of placing the order. Contact us immediately for modifications.' },
    { q: 'How do I track my order?', a: 'Once shipped, you will receive a tracking number via SMS and email.' },
  ]},
  { category: 'Shipping', qa: [
    { q: 'How long does delivery take?', a: 'Nairobi: 1-2 business days. Other Kenyan cities: 2-4 business days. East Africa: 5-7 business days.' },
    { q: 'How much does shipping cost?', a: 'Free for orders over KES 10,000. Standard shipping is KES 500, express is KES 750.' },
    { q: 'Do you ship internationally?', a: 'Currently we ship within Kenya and select East African countries.' },
  ]},
  { category: 'Returns', qa: [
    { q: 'What is your return policy?', a: 'Free returns within 14 days of delivery. Items must be unworn with original tags.' },
    { q: 'How do I initiate a return?', a: 'Visit your order history in your account and select "Return Item", or contact our support team.' },
    { q: 'When will I get my refund?', a: 'Refunds are processed within 5-7 business days after we receive the returned item.' },
  ]},
  { category: 'Sizing', qa: [
    { q: 'How do I find my correct size?', a: 'Check our size guide page for detailed measurements. Each product page also has size-specific measurements.' },
    { q: 'What if I order the wrong size?', a: 'You can exchange for a different size within 14 days. We offer free size exchanges.' },
  ]},
  { category: 'Payment', qa: [
    { q: 'What payment methods do you accept?', a: 'We accept M-Pesa (Lipa Na M-Pesa), credit/debit cards, and bank transfers.' },
    { q: 'Is M-Pesa payment secure?', a: 'Yes, all M-Pesa transactions are processed through Safaricom\'s secure Daraja API.' },
    { q: 'Do you offer installment payments?', a: 'Not yet, but we are working on introducing Lipa Mdogo Mdogo soon.' },
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
