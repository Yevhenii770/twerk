import Link from 'next/link'
import type { Metadata } from 'next'
import { STUDIO_ADDRESS, faqSchema, type Faq } from '@/lib/seoContent'

const URL = 'https://bounce-lab.com/private-lessons'
const TITLE = 'Private Twerk & Heels Dance Lessons in Portland, OR'
const DESCRIPTION = 'One-on-one twerk and high heels dance lessons in Portland, Oregon. Tailored to your pace and goals, flexible scheduling, beginner-friendly. Send us a request.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: TITLE }] },
}

const faqs: Faq[] = [
  { q: 'Who are private dance lessons for?', a: 'Anyone who wants faster progress or more personal attention: complete beginners who would like a few lessons before joining a group class, students who want to polish technique, or anyone preparing a routine.' },
  { q: 'Which styles can I learn privately?', a: 'Twerk and High Heels — or a mix of both. The lesson is built around your level and goals.' },
  { q: 'How do I book a private lesson?', a: 'Send us a message through the contact form with the style you want and the days/times that work for you, and we will get back to you with options and pricing.' },
  { q: 'Where do private lessons take place?', a: `At the bounce lab studio, ${STUDIO_ADDRESS}.` },
]

export default function PrivateLessonsPage() {
  return (
    <section className="legal-page" style={{ paddingTop: 40 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <div className="legal-header">
        <p className="mk-eyebrow">One-on-one · Portland, OR</p>
        <h1 className="mk-section-title">Private Twerk &amp; Heels Dance Lessons</h1>
        <p className="legal-updated">Tailored to your pace — any direction, flexible scheduling.</p>
      </div>
      <div className="legal-content">
        <p>
          Want the instructor&apos;s full attention? Private lessons at bounce lab are one-on-one sessions in Twerk or High
          Heels, built entirely around you — your level, your goals and your schedule.
        </p>

        <h2>Why take a private lesson</h2>
        <ul>
          <li><strong>Learn faster.</strong> Every correction is for you, so technique clicks sooner.</li>
          <li><strong>Start with confidence.</strong> Nervous about a group class? A private lesson or two is a gentle way in.</li>
          <li><strong>Your goals.</strong> Work on a specific skill, a choreography, or simply feeling better in your body.</li>
          <li><strong>Flexible time.</strong> We find a slot that fits your week.</li>
        </ul>

        <h2>Styles</h2>
        <p>
          <Link href="/classes/twerk">Twerk</Link> — hip isolations, bounce technique, floor work and choreography.{' '}
          <Link href="/classes/high-heels">High Heels</Link> — walks, turns, posture and choreography in heels (or flats to start).
        </p>

        <h2>FAQ</h2>
        {faqs.map(f => (
          <div key={f.q}>
            <p><strong>{f.q}</strong></p>
            <p>{f.a}</p>
          </div>
        ))}

        <p style={{ marginTop: 40 }}>
          <Link href="/contact" className="btn-price" style={{ display: 'inline-block', width: 'auto', padding: '16px 40px', color: 'white' }}>Request a Private Lesson</Link>
        </p>
        <p>Prefer a group? See our <Link href="/dance-classes-portland">weekly dance classes in Portland</Link>.</p>
      </div>
    </section>
  )
}
