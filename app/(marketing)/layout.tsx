import Image from 'next/image'
import Link from 'next/link'
import HeaderScrollClient from '@/components/HeaderScrollClient'
import ScrollFadeClient from '@/components/ScrollFadeClient'
import { getCurrentUser, getSchedule } from '@/lib/dal'
import { DAY_NAMES, ID_TO_SLUG, CLASS_STATIC, CLASS_IDS, type ClassSchedule } from '@/lib/classes'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [user, schedule] = await Promise.all([getCurrentUser(), getSchedule()])

  return (
    <div className="marketing-root">
      <HeaderScrollClient user={user} />
      <main>{children}</main>
      <Footer schedule={schedule} />
      <ScrollFadeClient />
    </div>
  )
}

function Footer({ schedule }: { schedule: ClassSchedule[] }) {
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
            Twerk · High Heels · Stretching<br />
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
          <Link href="/book" className="mk-foot-link" style={{ marginTop: 8, color: 'var(--pink)' }}>Book a Class →</Link>
        </div>
        <div className="mk-foot-col">
          <p className="mk-foot-title">Contact</p>
          <a href="tel:+15034220858" className="mk-foot-link">(503) 422-0858</a>
          <span className="mk-foot-link" style={{ cursor: 'default' }}>Portland, Oregon</span>
        </div>
        <div className="mk-foot-col">
          <p className="mk-foot-title">Schedule</p>
          {sorted.map(s => (
            <span key={s.classType} className="mk-foot-link" style={{ cursor: 'default' }}>
              {DAY_NAMES[s.dayOfWeek]} — {s.timeDisplay}
            </span>
          ))}
          <div style={{ marginTop: '24px', display: 'flex', gap: '20px' }}>
            <a href="https://www.instagram.com/iryna.pytska" target="_blank" rel="noopener" className="mk-foot-link" style={{ margin: 0 }}>Instagram</a>
          </div>
        </div>
      </div>
      <div className="mk-foot-bar">
        <span className="mk-foot-copy">© 2025 bounce lab Dance Studio. All Rights Reserved.</span>
        <Link href="/book" className="mk-foot-top">Book a Class →</Link>
      </div>
    </footer>
  )
}
