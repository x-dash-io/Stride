import { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Press | STRIDE',
  description: 'Press resources, media coverage, and brand information for STRIDE Footwear.',
}

const coverage = [
  { outlet: 'Business Daily Africa', title: 'STRIDE Raises $2M to Expand Footwear Retail in East Africa', date: 'June 2026' },
  { outlet: 'TechMoran', title: 'How STRIDE Is Using Tech to Solve Kenya\'s Footwear Shopping Problem', date: 'May 2026' },
  { outlet: 'The Standard', title: 'New Premium Footwear Brand STRIDE Opens Flagship Store at Two Rivers', date: 'March 2026' },
]

export default function PressPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2">Press</h1>
        <p className="text-muted-foreground mb-12">Press resources and media coverage.</p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">About STRIDE</h2>
          <p className="text-muted-foreground">
            STRIDE is a premium footwear brand based in Nairobi, Kenya. We curate the best international and local brands,
            offering a seamless shopping experience online and in-store. Founded in 2024, we have quickly become the
            go-to destination for quality footwear in East Africa.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Press Kit</h2>
          <div className="space-y-3">
            <Button variant="default" className="w-full sm:w-auto">Download Brand Assets (ZIP)</Button>
            <Button variant="secondary" className="w-full sm:w-auto ml-0 sm:ml-3 mt-3 sm:mt-0">Download Logo Package</Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Media Coverage</h2>
          <div className="space-y-4">
            {coverage.map((item) => (
              <div key={item.title} className="border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">{item.outlet} &middot; {item.date}</p>
                <p className="font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Press Contact</h2>
          <p className="text-muted-foreground">
            For press inquiries, please contact:<br />
            press@stride.co.ke<br />
            +254 700 123 456
          </p>
        </section>
      </div>
    </div>
  )
}
