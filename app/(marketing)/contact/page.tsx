import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: "Contact Us — bounce lab Portland, OR",
  description: "Questions, feedback, or a problem with the site? Get in touch with bounce lab dance studio in Portland, Oregon.",
  alternates: { canonical: "https://bounce-lab.com/contact" },
  robots: { index: true, follow: true },
}

export default function ContactPage() {
  return (
    <section style={{ minHeight: '100vh', paddingTop: 40 }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '52px 72px 40px' }}>
        <p className="mk-eyebrow">Get in touch</p>
        <h1 className="mk-section-title">Contact Us</h1>
        <p style={{ fontSize: 13, color: 'var(--mid)', marginTop: 12, maxWidth: 480, lineHeight: 1.6 }}>
          Have a question, found a problem on the site, or need help with something? Send us a message below.
          Looking to book a class? <a href="/book" style={{ color: 'var(--pink)' }}>Head to the booking page →</a>
        </p>
      </div>
      <div style={{ padding: '40px 24px 80px', maxWidth: 560, margin: '0 auto' }}>
        <ContactForm />
      </div>
    </section>
  )
}
