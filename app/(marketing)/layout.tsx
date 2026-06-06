import Image from 'next/image'
import Link from 'next/link'
import HeaderScrollClient from '@/components/HeaderScrollClient'
import ScrollFadeClient from '@/components/ScrollFadeClient'
import { getCurrentUser } from '@/lib/dal'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="marketing-root">
      <HeaderScrollClient user={user} />
      <main>{children}</main>
      <Footer />
      <ScrollFadeClient />
    </div>
  )
}

function Footer() {
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
          <p className="mk-foot-title">Contact</p>
          <a href="tel:+15034220858" className="mk-foot-link">(503) 422-0858</a>
          <span className="mk-foot-link" style={{ cursor: 'default' }}>Portland, Oregon</span>
        </div>
        <div className="mk-foot-col">
          <p className="mk-foot-title">Schedule</p>
          <span className="mk-foot-link" style={{ cursor: 'default' }}>Monday — 4:00–5:00 PM</span>
          <span className="mk-foot-link" style={{ cursor: 'default' }}>Tuesday — 7:00–8:00 PM</span>
          <span className="mk-foot-link" style={{ cursor: 'default' }}>Saturday — 11:00 AM–12:20 PM</span>
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
