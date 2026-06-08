import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CLASS_STATIC, DAY_NAMES, SLUG_TO_ID, ID_TO_SLUG } from '@/lib/classes'
import { getSchedule, getClassSettings } from '@/lib/dal'

type Props = { params: Promise<{ slug: string }> }

const META: Record<string, { title: string; description: string }> = {
  twerk: {
    title: 'Twerk Classes in Portland, OR — bounce lab',
    description: 'Beginner-friendly twerk classes in Portland, Oregon. Learn hip movement, body confidence, and choreography. Drop-in $25 or monthly pass. Every Saturday at bounce lab.',
  },
  'high-heels': {
    title: 'High Heels Dance Classes in Portland, OR — bounce lab',
    description: 'High heels dance classes in Portland, Oregon. Build confidence, posture, and floor presence. Beginner-friendly. Drop-in $30. Every Friday at bounce lab.',
  },
  stretching: {
    title: 'Stretching Classes in Portland, OR — bounce lab',
    description: 'Stretching and flexibility classes in Portland, Oregon. All levels welcome. Improve mobility and reduce tension. Drop-in $20. Every Thursday at bounce lab.',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = META[slug]
  if (!m) return {}
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://bounce-lab.com/classes/${slug}` },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `https://bounce-lab.com/classes/${slug}`,
    },
  }
}

export default async function ClassPage({ params }: Props) {
  const { slug } = await params
  const classId = SLUG_TO_ID[slug]
  if (!classId) notFound()

  const [schedule, photoPositions] = await Promise.all([getSchedule(), getClassSettings()])
  const cls = CLASS_STATIC[classId]
  const sched = schedule.find(s => s.classType === classId)
  const dayName = sched ? DAY_NAMES[sched.dayOfWeek] : ''
  const photo = photoPositions[classId]?.photoUrl ?? cls.photo
  const photoPos = photoPositions[classId]?.photoPosition ?? '50% 50%'
  const texts = photoPositions[classId]?.modalTexts ?? cls.modalTexts

  const otherClasses = Object.entries(ID_TO_SLUG)
    .filter(([id]) => id !== classId)
    .map(([id, s]) => ({ id, slug: s, label: CLASS_STATIC[id as keyof typeof CLASS_STATIC].label }))

  return (
    <>
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
            <Link href={cls.bookUrl} className="btn-hero-primary">Book a Class</Link>
            <Link href="/#classes" className="btn-hero-outline">All Classes</Link>
          </div>
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
          <Link href={cls.bookUrl} className="btn-outline-dark" style={{ marginTop: 12 }}>
            Book {cls.label} →
          </Link>
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
            <Link href={cls.bookUrl} className="btn-price" style={{ marginTop: 32 }}>
              Reserve Your Spot
            </Link>
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

      {/* CTA */}
      <section className="mk-cta">
        <p className="mk-cta-pre">Ready to start?</p>
        <h2 className="mk-cta-title">Join {cls.label} in Portland</h2>
        <p className="mk-cta-sub">No experience needed. Just show up, feel the music, and let your body do the rest.</p>
        <Link href={cls.bookUrl} className="btn-cta">Book Your First Class</Link>
      </section>
    </>
  )
}
