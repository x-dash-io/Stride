import { Metadata } from 'next'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | STRIDE',
  description: 'Get in touch with STRIDE. Visit our store in Nairobi or reach out via phone or email.',
}

export default function ContactPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-12">
          We would love to hear from you. Get in touch with our team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">Visit Us</h3>
                <p>STRIDE Footwear</p>
                <p>Two Rivers Mall, Limuru Road</p>
                <p>Nairobi, Kenya</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Call Us</h3>
                <p>+254 700 123 456</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Email</h3>
                <p>hello@stride.co.ke</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                <p>Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: 10:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
