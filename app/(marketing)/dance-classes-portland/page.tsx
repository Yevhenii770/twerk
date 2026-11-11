import Link from 'next/link'
import type { Metadata } from 'next'
import { CLASS_IDS, CLASS_STATIC, ID_TO_SLUG, classPrices, describeSchedule, formatSlot, startingPrices } from '@/lib/classes'
import { getSchedule, getClassSettings } from '@/lib/dal'
import { STUDIO_ADDRESS, MAPS_URL, faqSchema, type Faq } from '@/lib/seoContent'
import { GUIDES } from '@/lib/guides'

const URL = 'https://bounce-lab.com/dance-classes-portland'
const TITLE = 'Dance Classes in Portland for Adult Beginners — Twerk & Heels'

export async function generateMetadata(): Promise<Metadata> {
  const [schedule, classSettings] = await Promise.all([getSchedule(), getClassSettings()])
  const description = `Adult beginner dance classes for women in Portland, OR: ${describeSchedule(schedule)}. Drop-in $${startingPrices(classSettings).dropin}, no experience needed.`
  return {
    title: TITLE,
    description,
    alternates: { canonical: URL },
    openGraph: { title: TITLE, description, url: URL, images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: TITLE }] },
  }
}

export default async function DanceClassesPortlandPage() {
  const [schedule, classSettings] = await Promise.all([getSchedule(), getClassSettings()])
  const p = startingPrices(classSettings)

  const faqs: Faq[] = [
    { q: 'Are there dance classes in Portland for adults with no experience?', a: `Yes — every class at bounce lab is built for adult beginners. Our weekly classes are ${describeSchedule(schedule)}.` },
    { q: 'How much do adult dance classes cost in Portland?', a: `At bounce lab a drop-in class is $${p.dropin}${p.monthly != null ? ` and a Monthly Pass is $${p.monthly} (valid 5 weeks, any class on the schedule)` : ''}.` },
    { q: 'Which dance class should I try first?', a: 'If you want something energetic that works the glutes and hips, start with Twerk. If you want to feel confident, feminine and work on posture and presence, try High Heels. Both are beginner-friendly.' },
    { q: 'Where is the studio?', a: `bounce lab is at ${STUDIO_ADDRESS}, on East Burnside — easy to reach from Northeast and Southeast Portland.` },
  ]

  return (
    <section className="legal-page" style={{ paddingTop: 40 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <div className="legal-header">
        <p className="mk-eyebrow">Portland, OR · Adult beginners welcome</p>
        <h1 className="mk-section-title">Dance Classes in Portland for Adult Beginners</h1>
        <p className="legal-updated">Twerk &amp; High Heels for women — small groups, no experience needed, judgment-free.</p>
      </div>
      <div className="legal-content">
        <p>
          Looking for a dance class in Portland where you don&apos;t have to be &ldquo;a dancer&rdquo; already? bounce lab is a
          small studio on East Burnside built for adult women who want to move, sweat and feel more confident in their
          bodies. Most of our students start with zero dance experience.
        </p>

        <h2>Our Weekly Classes</h2>
        <ul>
          {CLASS_IDS.map(id => {
            const s = schedule.find(x => x.classType === id)
            const price = classPrices(id, classSettings)
            return (
              <li key={id}>
                <Link href={`/classes/${ID_TO_SLUG[id]}`}><strong>{CLASS_STATIC[id].label} dance class</strong></Link>
                {s && <> — every {formatSlot(s)} ({s.duration})</>} · drop-in ${price.dropin}. {CLASS_STATIC[id].desc}
              </li>
            )
          })}
        </ul>

        <h2>Why Adult Beginners Choose bounce lab</h2>
        <ul>
          <li><strong>Beginner-first teaching.</strong> Every move is broken down slowly, with easier and harder options.</li>
          <li><strong>Women-only, judgment-free.</strong> Nobody is watching you — everyone is busy having fun.</li>
          <li><strong>A real workout.</strong> Twerk and heels build strength in the legs, glutes and core, plus balance and mobility.</li>
          <li><strong>Flexible pricing.</strong> Drop in for ${p.dropin}{p.monthly != null && <>, or save with a ${p.monthly} Monthly Pass</>}.</li>
        </ul>

        <h2>Your First Class</h2>
        <p>
          Book online, arrive 5–10 minutes early, and wear something you can move in. Not sure what to bring? Read our guides:{' '}
          {GUIDES.map((g, i) => (
            <span key={g.slug}>{i > 0 && ' · '}<Link href={`/guides/${g.slug}`}>{g.title}</Link></span>
          ))}.
          Prefer one-on-one? We also offer <Link href="/private-lessons">private dance lessons</Link>.
        </p>

        <h2>Location</h2>
        <p>
          <a href={MAPS_URL} target="_blank" rel="noopener">{STUDIO_ADDRESS}</a>. Whole Foods next door is a convenient place to park.
        </p>

        <h2>FAQ</h2>
        {faqs.map(f => (
          <div key={f.q}>
            <p><strong>{f.q}</strong></p>
            <p>{f.a}</p>
          </div>
        ))}

        <p style={{ marginTop: 40 }}>
          <Link href="/book" className="btn-price" style={{ display: 'inline-block', width: 'auto', padding: '16px 40px', color: 'white' }}>Book Your First Class</Link>
        </p>
      </div>
    </section>
  )
}
