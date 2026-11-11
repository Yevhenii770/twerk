import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GUIDES, GUIDE_BY_SLUG } from '@/lib/guides'
import { CLASS_STATIC, SLUG_TO_ID, classPrices, formatSlot } from '@/lib/classes'
import { getSchedule, getClassSettings } from '@/lib/dal'

type Props = { params: Promise<{ slug: string }> }

// Rendered per request (not prerendered) so the class day/time in the CTA always matches the
// admin schedule, same as every other marketing page.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = GUIDE_BY_SLUG[slug]
  if (!g) return {}
  const url = `https://bounce-lab.com/guides/${g.slug}`
  return {
    title: g.metaTitle,
    description: g.description,
    alternates: { canonical: url },
    openGraph: { title: g.title, description: g.description, url, type: 'article', images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: g.title }] },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const g = GUIDE_BY_SLUG[slug]
  if (!g) notFound()

  const classId = SLUG_TO_ID[g.classSlug]
  const cls = CLASS_STATIC[classId]
  const [schedule, classSettings] = await Promise.all([getSchedule(), getClassSettings()])
  const sched = schedule.find(s => s.classType === classId)
  const price = classPrices(classId, classSettings)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.title,
    description: g.description,
    datePublished: g.published,
    dateModified: g.published,
    image: 'https://bounce-lab.com/og-image-v2.jpg',
    mainEntityOfPage: `https://bounce-lab.com/guides/${g.slug}`,
    author: { '@type': 'Person', name: 'Iryna Pytska', url: 'https://www.instagram.com/iryna.pytska' },
    publisher: { '@type': 'Organization', name: 'bounce lab Dance Studio', url: 'https://bounce-lab.com', logo: { '@type': 'ImageObject', url: 'https://bounce-lab.com/logo.png' } },
  }

  return (
    <article className="legal-page" style={{ paddingTop: 40 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="legal-header">
        <p className="mk-eyebrow">Beginner guide · {cls.label}</p>
        <h1 className="mk-section-title">{g.title}</h1>
        <p className="legal-updated">By Iryna Pytska, founder of bounce lab · Portland, OR</p>
      </div>
      <div className="legal-content">
        <p>{g.intro}</p>
        {g.blocks.map(b => (
          <section key={b.h2}>
            <h2>{b.h2}</h2>
            {b.p?.map((t, i) => <p key={i}>{t}</p>)}
            {b.list && <ul>{b.list.map(li => <li key={li}>{li}</li>)}</ul>}
          </section>
        ))}

        <h2>Ready for your first {cls.label} class?</h2>
        <p>
          Join our beginner-friendly <Link href={`/classes/${g.classSlug}`}>{cls.label.toLowerCase()} dance class in Portland</Link>
          {sched && <> — every <strong>{formatSlot(sched)}</strong></>}. Drop-in ${price.dropin}, no experience needed.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link href={cls.bookUrl} className="btn-price" style={{ display: 'inline-block', width: 'auto', padding: '16px 40px', color: 'white' }}>Book {cls.label}</Link>
        </p>

        <h2>More beginner guides</h2>
        <ul>
          {GUIDES.filter(x => x.slug !== g.slug).map(x => (
            <li key={x.slug}><Link href={`/guides/${x.slug}`}>{x.title}</Link></li>
          ))}
          <li><Link href="/dance-classes-portland">Dance classes in Portland for adult beginners</Link></li>
        </ul>
      </div>
    </article>
  )
}
