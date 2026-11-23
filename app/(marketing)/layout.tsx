import Image from 'next/image'
import Link from 'next/link'
import HeaderScrollClient from '@/components/HeaderScrollClient'
import ScrollFadeClient from '@/components/ScrollFadeClient'
import { getCurrentUser, getSchedule, getClassSettings } from '@/lib/dal'
import { DAY_NAMES, ID_TO_SLUG, CLASS_STATIC, CLASS_IDS, startingPrices, type ClassSchedule } from '@/lib/classes'
import StickyBookBar from '@/components/StickyBookBar'
import { getNextBookable, whenShort, fmtClock } from '@/lib/nextSessions'
import { GUIDES } from '@/lib/guides'
import InstagramLink from '@/components/InstagramLink'
import { classAddress, directionsUrl } from '@/lib/studio'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [user, schedule, settings, next] = await Promise.all([getCurrentUser(), getSchedule(), getClassSettings(), getNextBookable()])
  // Sticky phone bar: per-class next session (the bar picks the one matching the class page),
  // falling back to the soonest class overall.
  const nextLinks = Object.fromEntries(CLASS_IDS.flatMap(id => {
    const s = next[id]
    return s ? [[id, { href: `/book?session=${s.id}`, date: s.date, text: `${CLASS_STATIC[id].label} ${whenShort(s.date)} ${fmtClock(s.startTime)}` }]] : []
  }))
  const addresses = CLASS_IDS.map(id => ({ id, address: classAddress(id, settings) }))

  return (
    <div className="marketing-root">
      <HeaderScrollClient user={user} />
      <main>{children}</main>
      <Footer schedule={schedule} addresses={addresses} />
      <ScrollFadeClient />
      <StickyBookBar links={nextLinks} price={startingPrices(settings).dropin} />
    </div>
  )
}

function Footer({ schedule, addresses }: { schedule: ClassSchedule[]; addresses: { id: (typeof CLASS_IDS)[number]; address: string }[] }) {
  const sorted = [...schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  return (
    <footer className="mk-footer">
      <div className="mk-foot-main">
        <div className="mk-foot-col">
          <div className="mk-foot-logo">
            <Image src="/logo.png" alt="bounce lab" width={120} height={32} style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
          </div>
          <p className="mk-foot-desc">
            A space to move, feel, and express.<br />
            Twerk · High Heels<br />
            Portland, OR
          </p>
        </div>
        <div className="mk-foot-col">
          <p className="mk-foot-title">Classes</p>
          {CLASS_IDS.map(id => (
            <Link key={id} href={`/classes/${ID_TO_SLUG[id]}`} className="mk-foot-link">
              {CLASS_STATIC[id].label}
            </Link>
          ))}
          <Link href="/private-lessons" className="mk-foot-link">Private Lessons</Link>
          <Link href="/bachelorette-dance-class-portland" className="mk-foot-link">Bachelorette &amp; Girls&apos; Night</Link>
          <Link href="/instructor" className="mk-foot-link">Meet Your Instructor</Link>
          <Link href="/dance-classes-portland" className="mk-foot-link">Dance Classes for Beginners</Link>
          {GUIDES.map(g => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="mk-foot-link">{g.title}</Link>
          ))}
          <Link href="/book" className="mk-foot-link" style={{ marginTop: 8, color: 'var(--pink)' }}>Book a Class →</Link>
        </div>
        <div className="mk-foot-col">
          <p className="mk-foot-title">Contact</p>
          <a href="tel:+15034220858" className="mk-foot-link">(503) 422-0858</a>
          {addresses.map(a => (
            <a key={a.id} href={directionsUrl(a.address)} target="_blank" rel="noopener" className="mk-foot-link">
              {CLASS_STATIC[a.id].label}: {a.address}
            </a>
          ))}
          <Link href="/contact" className="mk-foot-link" style={{ marginTop: 8 }}>Found a problem? Contact us →</Link>
        </div>
        <div className="mk-foot-col">
          <p className="mk-foot-title">Schedule</p>
          {sorted.map(s => (
            <span key={s.classType} className="mk-foot-link" style={{ cursor: 'default' }}>
              {DAY_NAMES[s.dayOfWeek]} — {s.timeDisplay}
            </span>
          ))}
          <div style={{ marginTop: '24px', display: 'flex', gap: '20px' }}>
            <InstagramLink href="https://www.instagram.com/iryna.pytska" className="mk-foot-link" style={{ margin: 0 }}>Instagram</InstagramLink>
          </div>
        </div>
      </div>
      <div className="mk-foot-bar">
        <span className="mk-foot-copy">© 2026 bounce lab Dance Studio. All Rights Reserved. · <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</Link> · <Link href="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms</Link></span>
        <Link href="/book" className="mk-foot-top">Book a Class →</Link>
      </div>
    </footer>
  )
}
