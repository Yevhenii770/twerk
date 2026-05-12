import Image from 'next/image'
import Link from 'next/link'
import ClassesWithModals from '@/components/ClassesWithModals'
import WeekCalendarClient from '@/components/WeekCalendarClient'
import { fetchInstagramPosts } from '@/lib/instagram'

const INSTA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 12, height: 12, color: 'var(--pink)' }}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const instaBadge = (
  <div className="insta-badge">
    <svg viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  </div>
)

const instaOverlay = (
  <div className="insta-overlay">
    <div className="insta-overlay-icon">
      <svg viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
      <span>View</span>
    </div>
  </div>
)

export default async function HomePage() {
  const instaPosts = await fetchInstagramPosts()
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="mk-hero">
        <div className="mk-hero-video">
          <video autoPlay muted loop playsInline poster="/studio.jpg">
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="mk-hero-overlay" />
        <div className="mk-hero-content">
          <p className="mk-hero-tag">Portland, OR · Est. 2024</p>
          <h1 className="mk-hero-title">
            Feel your<br />
            <em>body</em><br />
            move.
          </h1>
          <p className="mk-hero-sub">A warm, judgment-free studio for every woman who wants to discover the joy of movement. No experience needed.</p>
          <div className="mk-hero-btns">
            <Link href="/book" className="btn-hero-primary">Book a Class</Link>
            <Link href="#classes" className="btn-hero-outline">See Classes</Link>
          </div>
        </div>
        <div className="mk-scroll-hint">
          <span className="mk-scroll-line" />
          Scroll
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <div className="mk-stats fade-in">
        <div className="mk-stat">
          <span className="mk-stat-val">Twerk · High Heels · Stretching</span>
          <span className="mk-stat-label">Three Directions</span>
        </div>
        <div className="mk-stat">
          <span className="mk-stat-val">Mon · Tue · Sat</span>
          <span className="mk-stat-label">Classes Every Week</span>
        </div>
        <div className="mk-stat">
          <span className="mk-stat-val">All Levels</span>
          <span className="mk-stat-label">Beginners Always Welcome</span>
        </div>
      </div>

      {/* ═══ CLASSES ═══ */}
      <section className="mk-classes-section fade-in" id="classes">
        <div className="mk-classes-header">
          <div>
            <p className="mk-eyebrow">What we offer</p>
            <h2 className="mk-section-title">Our Classes</h2>
          </div>
          <span className="mk-schedule-note">3 directions · all levels welcome</span>
        </div>
        <ClassesWithModals />
      </section>

      {/* ═══ INSTRUCTOR / ABOUT ═══ */}
      <section className="mk-instructor fade-in" id="about">
        <div className="mk-instr-photo">
          <Image src="/photo-1.jpg" alt="Iryna Pytska — Founder" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
        <div className="mk-instr-content">
          <p className="mk-eyebrow">The founder</p>
          <p className="mk-instr-quote">
            &ldquo;Find your flow, and dance your truth. This studio is for every woman who&apos;s been waiting for permission to take up space.&rdquo;
          </p>
          <div>
            <p className="mk-instr-name">Iryna Pytska</p>
            <p className="mk-instr-role">Founder &amp; Instructor · bounce lab</p>
          </div>
        </div>
      </section>

      {/* ═══ MANIFESTO ═══ */}
      <div className="mk-manifesto fade-in">
        <p className="mk-manifesto-text">
          <span className="muted">Every woman deserves a space where she can</span><br />
          <span className="accent">move freely, feel beautiful,</span><br />
          <span className="muted">and dance like no one&apos;s watching.</span>
        </p>
      </div>

      {/* ═══ SCHEDULE ═══ */}
      <section className="mk-schedule fade-in" id="schedule">
        <div className="mk-schedule-head">
          <div>
            <p className="mk-eyebrow">When we meet</p>
            <h2 className="mk-section-title">Weekly Schedule</h2>
          </div>
          <span className="mk-schedule-note">3 classes · every week</span>
        </div>
        <WeekCalendarClient />
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="mk-pricing fade-in" id="pricing">
        <div className="mk-pricing-header">
          <p className="mk-eyebrow">Transparent pricing</p>
          <h2 className="mk-section-title">Simple &amp; Clear</h2>
        </div>
        <div className="pricing-cols">
          <div className="pcol">
            <p className="pcol-name">Twerk</p>
            <div className="pcol-options">
              <div className="popt">
                <span className="popt-label">Drop-in</span>
                <div className="popt-price">
                  <span className="popt-curr">$</span>
                  <span className="popt-num">25</span>
                  <span className="popt-per">/ class</span>
                </div>
              </div>
              <div className="popt">
                <span className="popt-label">Monthly Pass</span>
                <div className="popt-price">
                  <span className="popt-curr">$</span>
                  <span className="popt-num">80</span>
                  <span className="popt-per">/ month</span>
                </div>
                <span className="popt-note">4 classes included</span>
              </div>
            </div>
            <Link href="/book" className="btn-price">Book a Class</Link>
          </div>
          <div className="pcol">
            <p className="pcol-name">High Heels</p>
            <div className="pcol-options">
              <div className="popt">
                <span className="popt-label">Drop-in</span>
                <div className="popt-price">
                  <span className="popt-curr">$</span>
                  <span className="popt-num">30</span>
                  <span className="popt-per">/ class</span>
                </div>
              </div>
              <div className="popt">
                <span className="popt-label">Monthly Pass</span>
                <div className="popt-price">
                  <span className="popt-curr">$</span>
                  <span className="popt-num">100</span>
                  <span className="popt-per">/ month</span>
                </div>
                <span className="popt-note">4 classes included</span>
              </div>
            </div>
            <Link href="/book" className="btn-price">Book a Class</Link>
          </div>
          <div className="pcol">
            <p className="pcol-name">Stretching</p>
            <div className="pcol-options">
              <div className="popt">
                <span className="popt-label">Drop-in</span>
                <div className="popt-price">
                  <span className="popt-curr">$</span>
                  <span className="popt-num">20</span>
                  <span className="popt-per">/ class</span>
                </div>
              </div>
            </div>
            <Link href="/book" className="btn-price">Book a Class</Link>
          </div>
        </div>
        <div className="pricing-private">
          <div>
            <p className="pricing-private-text">Also available: <span>Private Lessons</span></p>
            <p className="pricing-private-sub">One-on-one sessions tailored to your pace — any direction, flexible scheduling.</p>
          </div>
          <Link href="/book" className="btn-private">Inquire</Link>
        </div>
      </section>

      {/* ═══ INSTAGRAM ═══ */}
      <section className="mk-instagram fade-in">
        <div className="mk-instagram-top">
          <div>
            <p className="mk-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {INSTA_SVG}
              Instagram
            </p>
            <h2 className="mk-section-title">Life at the Studio</h2>
          </div>
          <p className="mk-section-body" style={{ maxWidth: '280px', textAlign: 'right' }}>
            Behind the scenes, real moments, and the energy you can feel before you even walk in.
          </p>
        </div>
        <div className="mk-instagram-grid">
          {instaPosts.map(post => {
            const isExternal = post.media_url.startsWith('http')
            const isVideo = post.media_type === 'VIDEO'
            const imgSrc = isVideo ? (post.thumbnail_url ?? post.media_url) : post.media_url

            const pos = post.objectPosition ?? 'center'
            return (
              <a key={post.id} className="insta-cell" href={post.permalink} target="_blank" rel="noopener">
                {isVideo && !isExternal ? (
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transition: 'transform 0.55s ease' }}>
                    <source src={post.media_url} type="video/mp4" />
                  </video>
                ) : isExternal ? (
                  <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transition: 'transform 0.55s ease' }} />
                ) : (
                  <Image src={imgSrc} alt="" fill style={{ objectFit: 'cover', objectPosition: pos }} />
                )}
                {instaBadge}
                {instaOverlay}
              </a>
            )
          })}
        </div>
        <div className="mk-instagram-bottom">
          <div>
            <p className="mk-instagram-handle"><span>@</span>iryna.pytska</p>
            <p className="mk-instagram-sub">Follow along for class updates, behind-the-scenes, and real studio moments.</p>
          </div>
          <a href="https://www.instagram.com/iryna.pytska" target="_blank" rel="noopener" className="btn-insta">
            Follow on Instagram
          </a>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="mk-cta fade-in" id="book">
        <p className="mk-cta-pre">Ready to start?</p>
        <h2 className="mk-cta-title">Your first step onto<br />the dance floor starts here</h2>
        <p className="mk-cta-sub">No experience needed. Just show up, feel the music, and let your body do the rest.</p>
        <Link href="/book" className="btn-cta">Book Your First Class</Link>
      </section>
    </>
  )
}
