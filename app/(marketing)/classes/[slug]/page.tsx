import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CLASS_STATIC, DAY_NAMES, SLUG_TO_ID, ID_TO_SLUG, type ClassId } from '@/lib/classes'
import { getSchedule, getClassSettings } from '@/lib/dal'
import { getGoogleReviews } from '@/lib/reviews'
import TrackedLink from '@/components/TrackedLink'
import TrackPageView from '@/components/TrackPageView'
import ScheduleInterestForm from '@/components/ScheduleInterestForm'

// Contextual CTA verb per class — copy only, price/day/time always pulled from live data.
const CTA_VERB: Record<ClassId, string> = {
  twerk: 'Reserve',
  highheels: 'Try',
  stretching: 'Book',
}

const CLASS_KEYWORDS: Record<ClassId, string[]> = {
  twerk: ['twerk'],
  highheels: ['heel'],
  stretching: ['stretch'],
}

type Props = { params: Promise<{ slug: string }> }

const META: Record<string, { title: string; description: string; keywords: string }> = {
  twerk: {
    title: 'Twerk Classes in Portland, OR — bounce lab',
    description: 'Beginner-friendly twerk classes in Portland, OR. Body confidence & choreography. Drop-in $25 or monthly $80. Book online.',
    keywords: 'twerk class Portland, twerk Portland Oregon, twerk dance class near me, beginner twerk class, twerk lessons Portland, twerk workshop Portland OR',
  },
  'high-heels': {
    title: 'High Heels Dance Classes in Portland, OR — bounce lab',
    description: 'High heels dance classes in Portland, OR. Posture & floor presence. Beginner-friendly. Drop-in $30 or monthly $100. Book online.',
    keywords: 'high heels dance class Portland, high heels class Portland Oregon, heels dance near me, high heels dance lessons, heels choreography class Portland',
  },
  stretching: {
    title: 'Stretching Classes in Portland, OR — bounce lab',
    description: 'Stretching & flexibility classes in Portland, OR. All levels welcome. Improve mobility. Drop-in $20. Every Thursday. Book online.',
    keywords: 'stretching class Portland, flexibility class Portland Oregon, stretching near me, adult stretching class, stretching for dancers Portland',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = META[slug]
  if (!m) return {}
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: { canonical: `https://bounce-lab.com/classes/${slug}` },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `https://bounce-lab.com/classes/${slug}`,
      images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: m.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: ['/og-image-v2.jpg'],
    },
  }
}

export default async function ClassPage({ params }: Props) {
  const { slug } = await params
  const classId = SLUG_TO_ID[slug]
  if (!classId) notFound()

  const [schedule, photoPositions, reviewsData] = await Promise.all([getSchedule(), getClassSettings(), getGoogleReviews()])
  const cls = CLASS_STATIC[classId]
  const sched = schedule.find(s => s.classType === classId)
  const dayName = sched ? DAY_NAMES[sched.dayOfWeek] : ''
  const photo = photoPositions[classId]?.photoUrl ?? cls.photo
  const photoPos = photoPositions[classId]?.photoPosition ?? '50% 50%'
  const texts = photoPositions[classId]?.modalTexts ?? cls.modalTexts

  const isBeginnerFriendly = cls.modalEyebrow.includes('Beginner Friendly')
  const ctaLabel = `${CTA_VERB[classId]} Your First ${cls.label} Class — $${cls.dropin}`

  const { reviews } = reviewsData
  const matchedReview = reviews.find(r => CLASS_KEYWORDS[classId].some(k => r.text.toLowerCase().includes(k)))
  const featuredReview = matchedReview ?? reviews[0] ?? null
  const isReviewClassSpecific = Boolean(matchedReview)

  const otherClasses = Object.entries(ID_TO_SLUG)
    .filter(([id]) => id !== classId)
    .map(([id, s]) => ({ id, slug: s, label: CLASS_STATIC[id as keyof typeof CLASS_STATIC].label }))

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bounce-lab.com' },
      { '@type': 'ListItem', position: 2, name: 'Classes', item: 'https://bounce-lab.com/#classes' },
      { '@type': 'ListItem', position: 3, name: `${cls.label} Classes Portland`, item: `https://bounce-lab.com/classes/${slug}` },
    ],
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${cls.label} Dance Class in Portland, OR`,
    description: META[slug]?.description ?? cls.desc,
    provider: {
      '@type': 'DanceSchool',
      name: 'bounce lab Dance Studio',
      url: 'https://bounce-lab.com',
      telephone: '+15034220858',
      address: { '@type': 'PostalAddress', addressLocality: 'Portland', addressRegion: 'OR', addressCountry: 'US' },
    },
    areaServed: [
      { '@type': 'City', name: 'Portland', containedIn: { '@type': 'State', name: 'Oregon' } },
      { '@type': 'City', name: 'Vancouver', containedIn: { '@type': 'State', name: 'Washington' } },
    ],
    offers: {
      '@type': 'Offer',
      price: cls.dropin.toString(),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://bounce-lab.com${cls.bookUrl}`,
    },
    url: `https://bounce-lab.com/classes/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <TrackPageView event="class_page_view" params={{ class_slug: slug, class_name: cls.label }} />

      {/* HERO */}
      <section className="cls-hero">
        <div className="cls-hero-img">
          <img src={photo} alt={`${cls.label} class Portland Oregon`} style={{ objectPosition: photoPos }} />
        </div>
        <div className="cls-hero-overlay" />
        <div className="cls-hero-content">
          <p className="mk-eyebrow">{cls.modalEyebrow}</p>
          <h1 className="cls-hero-title">
            {cls.label} Classes <span>in Portland, OR</span>
          </h1>
          {sched && (
            <p className="cls-hero-meta">
              Every {dayName} · {sched.timeDisplay} · {sched.duration}
            </p>
          )}
          <div className="cls-hero-btns">
            <TrackedLink href={cls.bookUrl} className="btn-hero-primary" event="book_cta_clicked" params={{ class_slug: slug, class_name: cls.label, placement: 'hero' }}>
              {ctaLabel}
            </TrackedLink>
            <Link href="/#classes" className="btn-hero-outline">All Classes</Link>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 14 }}>
            {dayName} · {sched?.timeDisplay} · {isBeginnerFriendly ? 'Beginner Friendly' : cls.level}
          </p>
        </div>
      </section>

      {/* CONTENT + SIDEBAR */}
      <section className="cls-content">
        <div className="cls-text">
          <p className="mk-eyebrow">About this class</p>
          <h2 className="mk-section-title" style={{ marginBottom: 32 }}>{cls.label}</h2>
          {texts.map((t, i) => (
            <p key={i} className="mk-section-body" style={{ marginBottom: 20 }}>{t}</p>
          ))}
          <TrackedLink href={cls.bookUrl} className="btn-outline-dark" style={{ marginTop: 12 }} event="book_cta_clicked" params={{ class_slug: slug, class_name: cls.label, placement: 'content' }}>
            Book {cls.label} →
          </TrackedLink>
        </div>

        <div className="cls-sidebar">
          <div className="cls-meta-card">
            <p className="mk-eyebrow">Class details</p>
            <div className="cls-meta-grid">
              <div className="cls-meta-item">
                <span className="cls-meta-k">Level</span>
                <span className="cls-meta-v">{cls.level}</span>
              </div>
              {sched && (
                <>
                  <div className="cls-meta-item">
                    <span className="cls-meta-k">Day</span>
                    <span className="cls-meta-v">Every {dayName}</span>
                  </div>
                  <div className="cls-meta-item">
                    <span className="cls-meta-k">Time</span>
                    <span className="cls-meta-v">{sched.timeDisplay}</span>
                  </div>
                  <div className="cls-meta-item">
                    <span className="cls-meta-k">Duration</span>
                    <span className="cls-meta-v">{sched.duration}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="cls-price-card">
            <p className="mk-eyebrow">Pricing</p>
            <div className="cls-price-row">
              <span className="cls-price-label">Drop-in</span>
              <span className="cls-price-val">${cls.dropin} <span style={{ fontSize: 14, fontStyle: 'normal', color: '#6B6059' }}>/ class</span></span>
            </div>
            {cls.monthly && (
              <div className="cls-price-row">
                <span className="cls-price-label">Monthly pass</span>
                <span className="cls-price-val">${cls.monthly} <span style={{ fontSize: 14, fontStyle: 'normal', color: '#6B6059' }}>/ mo</span></span>
              </div>
            )}
            <TrackedLink href={cls.bookUrl} className="btn-price" style={{ marginTop: 32 }} event="book_cta_clicked" params={{ class_slug: slug, class_name: cls.label, placement: 'sidebar' }}>
              Reserve Your Spot
            </TrackedLink>

            <ScheduleInterestForm classId={classId} className={cls.label} />
          </div>
        </div>
      </section>

      {/* OTHER CLASSES */}
      <section style={{ padding: '72px 72px', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <p className="mk-eyebrow">Also at bounce lab</p>
        <h2 className="mk-section-title" style={{ marginBottom: 40 }}>Other Classes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: 'var(--border)' }}>
          {otherClasses.map(({ id, slug: s, label }) => {
            const other = CLASS_STATIC[id as keyof typeof CLASS_STATIC]
            const otherSched = schedule.find(sc => sc.classType === id)
            const otherPhoto = photoPositions[id]?.photoUrl ?? other.photo
            const otherPos = photoPositions[id]?.photoPosition ?? '50% 50%'
            return (
              <Link key={id} href={`/classes/${s}`} style={{ display: 'block', background: 'var(--cream)', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/7', overflow: 'hidden', position: 'relative' }}>
                  <img src={otherPhoto} alt={`${label} Portland`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: otherPos, transition: 'transform 0.6s ease' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
                    {otherSched && <p className="mk-eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{DAY_NAMES[otherSched.dayOfWeek]} · {otherSched.timeDisplay}</p>}
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(28px,3vw,42px)', fontStyle: 'italic', color: 'white', lineHeight: 1 }}>{label}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      {featuredReview && (
        <section className="cls-proof">
          <div className="cls-proof-inner">
            <p className="mk-eyebrow">{isReviewClassSpecific ? `What students say about ${cls.label}` : 'What our students say'}</p>
            <div className="mk-review-card">
              <div className="mk-review-stars">
                {Array.from({ length: featuredReview.rating }).map((_, j) => (
                  <svg key={j} viewBox="0 0 20 20" fill="var(--pink)" style={{ width: 14, height: 14 }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mk-review-text">{featuredReview.text.length > 260 ? featuredReview.text.slice(0, 260) + '…' : featuredReview.text}</p>
              <div className="mk-review-author">
                {featuredReview.authorPhoto && (
                  <img src={featuredReview.authorPhoto} alt={featuredReview.authorName} className="mk-review-avatar" referrerPolicy="no-referrer" />
                )}
                <div>
                  <p className="mk-review-name">{featuredReview.authorName}</p>
                  <p className="mk-review-time">Google review · {featuredReview.relativeTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mk-cta">
        <p className="mk-cta-pre">Ready to start?</p>
        <h2 className="mk-cta-title">Join {cls.label} in Portland</h2>
        <p className="mk-cta-sub">No experience needed. Just show up, feel the music, and let your body do the rest.</p>
        <TrackedLink href={cls.bookUrl} className="btn-cta" event="book_cta_clicked" params={{ class_slug: slug, class_name: cls.label, placement: 'final_cta' }}>
          {ctaLabel}
        </TrackedLink>
      </section>
    </>
  )
}
