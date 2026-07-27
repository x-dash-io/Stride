import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sustainability | STRIDE',
  description: 'Our commitment to sustainable practices, ethical manufacturing, and reducing our environmental footprint.',
}

const goals = [
  { metric: '50%', label: 'Sustainable materials by 2028' },
  { metric: '100%', label: 'Carbon-neutral shipping by 2027' },
  { metric: '0', label: 'Single-use plastics in packaging by 2026' },
  { metric: '90%', label: 'Waste diversion from landfills' },
]

export default function SustainabilityPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2">Sustainability</h1>
        <p className="text-muted-foreground mb-12">Our commitment to a better future.</p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Promise</h2>
          <p className="text-muted-foreground">
            At STRIDE, we believe that great footwear should not come at the expense of our planet.
            We are committed to reducing our environmental footprint through sustainable materials,
            ethical manufacturing, and responsible operations.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Goals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {goals.map((goal) => (
              <div key={goal.label} className="text-center p-6 border border-border rounded-lg">
                <p className="text-3xl font-bold text-primary mb-2">{goal.metric}</p>
                <p className="text-sm text-muted-foreground">{goal.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Sustainable Materials</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>Recycled polyester from post-consumer plastic bottles</li>
            <li>Vegetable-tanned leather from certified tanneries</li>
            <li>Natural rubber outsoles from sustainable plantations</li>
            <li>Organic cotton linings</li>
            <li>Water-based adhesives throughout production</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Ethical Manufacturing</h2>
          <p className="text-muted-foreground">
            We partner with factories that share our values. Every facility in our supply chain undergoes
            regular audits for fair wages, safe working conditions, and environmental compliance.
            We publish our factory list and audit results annually.
          </p>
        </section>
      </div>
    </div>
  )
}
