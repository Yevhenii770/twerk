import Link from 'next/link'
import type { Metadata } from 'next'
import { STUDIO_ADDRESS, faqSchema, type Faq } from '@/lib/seoContent'

const URL = 'https://bounce-lab.com/bachelorette-dance-class-portland'
const TITLE = 'Bachelorette Party Dance Class in Portland — Twerk or Heels'
const DESCRIPTION = 'A private twerk or heels dance class for your bachelorette, birthday or girls’ night in Portland. No experience needed — you learn a short routine and film it at the end.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: TITLE }] },
}

// No prices / group sizes here on purpose — every party is quoted individually via the contact form.
const faqs: Faq[] = [
  { q: 'Do we need any dance experience?', a: 'No. The class is made for groups who have never danced together. Everything is broken down step by step, and the goal is to have fun, not to be perfect.' },
  { q: 'Twerk or heels — which one should we pick?', a: 'Twerk is high-energy, playful and full of laughs. Heels is more about feeling sexy and confident, with walks, poses and a short routine. Not sure? Tell us about your group and we will suggest one — or mix both.' },
  { q: 'Can we film the routine?', a: 'Yes — most groups film the final routine at the end. It is the best souvenir of the party.' },
  { q: 'What should we wear?', a: 'Anything you can move in. For heels, bring heels with an ankle strap or dance in socks. Matching outfits are always a good idea for the video.' },
  { q: 'Is it only for bachelorettes?', a: 'Not at all. Birthdays, girls’ nights out and women’s team events are all welcome.' },
  { q: 'Where is it?', a: `At the bounce lab studio, ${STUDIO_ADDRESS}.` },
  { q: 'How do we book?', a: 'Send us a message with your date, the number of people and the style you like. We will reply with available times and pricing.' },
]

export default function BachelorettePage() {
  return (
    <section className="legal-page" style={{ paddingTop: 40 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <div className="legal-header">
        <p className="mk-eyebrow">Private group class · Portland, OR</p>
        <h1 className="mk-section-title">Bachelorette &amp; Girls&apos; Night Dance Class</h1>
        <p className="legal-updated">Twerk or Heels · just your group · no experience needed</p>
      </div>
      <div className="legal-content">
        <p>
          Looking for something more fun than another brunch? Bring the bride and your girls to bounce lab for a private
          twerk or heels class. It&apos;s just your group, music you like, a lot of laughing — and by the end you&apos;ll
          have a short routine to film together.
        </p>

        <h2>How it goes</h2>
        <ul>
          <li><strong>Warm-up</strong> to get everyone moving and loosen up.</li>
          <li><strong>The basics</strong> of twerk or heels, shown slowly so everyone gets it.</li>
          <li><strong>A short routine</strong> to a song you love.</li>
          <li><strong>Film it</strong> — the final run-through is your video for the group chat.</li>
        </ul>

        <h2>Good for</h2>
        <ul>
          <li>Bachelorette parties</li>
          <li>Birthdays</li>
          <li>Girls&apos; night out</li>
          <li>Women&apos;s team events and corporate get-togethers</li>
        </ul>

        <h2>Who teaches</h2>
        <p>
          Classes are taught by <Link href="/instructor">Iryna</Link>, founder of bounce lab — a former professional dancer
          who has been teaching twerk and heels since 2022. Her classes are relaxed and judgment-free, so even the most shy
          friend ends up dancing.
        </p>

        <h2>FAQ</h2>
        {faqs.map(f => (
          <div key={f.q}>
            <p><strong>{f.q}</strong></p>
            <p>{f.a}</p>
          </div>
        ))}

        <p style={{ marginTop: 40 }}>
          <Link href="/contact" className="btn-price" style={{ display: 'inline-block', width: 'auto', padding: '16px 40px', color: 'white' }}>Ask About Your Date</Link>
        </p>
        <p>
          Just want to try a class first? Join a regular <Link href="/classes/twerk">twerk</Link> or{' '}
          <Link href="/classes/high-heels">heels</Link> class.
        </p>
      </div>
    </section>
  )
}
