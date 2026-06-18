import Image from 'next/image'
import Link from 'next/link'
import ClassesWithModals from '@/components/ClassesWithModals'
import WeekCalendarClient from '@/components/WeekCalendarClient'
import { fetchInstagramPosts } from '@/lib/instagram'
import HeroVideo from '@/components/HeroVideo'
import { getSchedule, getClassSettings } from '@/lib/dal'
import { DAY_SHORT } from '@/lib/classes'
import { getGoogleReviews } from '@/lib/reviews'

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
  const [instaPosts, schedule, photoPositions, reviewsData] = await Promise.all([fetchInstagramPosts(), getSchedule(), getClassSettings(), getGoogleReviews()])
  const { reviews, rating: googleRating, totalCount: googleReviewCount } = reviewsData
  const scheduleDays = schedule.map(s => DAY_SHORT[s.dayOfWeek]).join(' · ')

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'bounce lab Dance Studio',
    url: 'https://bounce-lab.com',
    description: 'Twerk, High Heels & Stretching dance classes in Portland, Oregon. Beginner-friendly, judgment-free studio for women.',
    publisher: { '@type': 'Organization', name: 'bounce lab Dance Studio', url: 'https://bounce-lab.com' },
    inLanguage: 'en-US',
  }

  const reviewSchema = reviews.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://bounce-lab.com/#business',
    name: 'bounce lab Dance Studio',
    url: 'https://bounce-lab.com',
    image: 'https://bounce-lab.com/og-image-v2.jpg',
    telephone: '+15034220858',
    priceRange: '$$',
    address: { '@type': 'PostalAddress', addressLocality: 'Portland', addressRegion: 'OR', postalCode: '97232', addressCountry: 'US' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: googleRating.toFixed(1),
      reviewCount: googleReviewCount,
      bestRating: 5,
    },
    review: reviews.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.authorName },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.text,
      datePublished: r.datePublished,
    })),
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      {reviewSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />}

      {/* ═══ HERO ═══ */}
      <section className="mk-hero">
        <div className="mk-hero-video">
          <HeroVideo />
        </div>
        <div className="mk-hero-overlay" />
        <div className="mk-hero-content">
          <p className="mk-hero-tag">Portland, OR · Est. 2024</p>
          <h1 className="mk-hero-title">
            <span className="sr-only">Dance Classes in Portland, OR — Twerk, High Heels &amp; Stretching — </span>
            Feel your<br />
            <em>body</em><br />
            move.
          </h1>
          <p className="mk-hero-sub">Portland&apos;s dance studio for women — Twerk, High Heels &amp; Stretching. Beginner-friendly, judgment-free. No experience needed.</p>
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
          <span className="mk-stat-val">{scheduleDays}</span>
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
        <ClassesWithModals schedule={schedule} photoPositions={photoPositions} />
      </section>

      {/* ═══ REVIEWS (moved up for trust) ═══ */}
      {reviews.length > 0 && (
        <section className="mk-reviews fade-in" id="reviews">
          <div className="mk-reviews-header">
            <div>
              <p className="mk-eyebrow">What our students say</p>
              <h2 className="mk-section-title">Real Reviews</h2>
            </div>
            <a
              href="https://www.google.com/maps/place/Bounce+Lab/@45.5308718,-122.6595633,17z"
              target="_blank"
              rel="noopener"
              className="mk-schedule-note"
              style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleRating} · {googleReviewCount} reviews on Google
            </a>
          </div>
          <div className="mk-reviews-grid">
            {reviews.map((review, i) => (
              <a key={i} href={review.googleMapsUri} target="_blank" rel="noopener" className="mk-review-card">
                <div className="mk-review-stars">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <svg key={j} viewBox="0 0 20 20" fill="var(--pink)" style={{ width: 14, height: 14 }}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mk-review-text">{review.text.length > 200 ? review.text.slice(0, 200) + '…' : review.text}</p>
                <div className="mk-review-author">
                  {review.authorPhoto && (
                    <img src={review.authorPhoto} alt={review.authorName} className="mk-review-avatar" referrerPolicy="no-referrer" />
                  )}
                  <div>
                    <p className="mk-review-name">{review.authorName}</p>
                    <p className="mk-review-time">{review.relativeTime}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ═══ INSTRUCTOR / ABOUT ═══ */}
      <section className="mk-instructor fade-in" id="about">
        <div className="mk-instr-photo">
          <Image src="/photo-1.jpg" alt="Iryna Pytska — Founder of bounce lab dance studio Portland" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="mk-instr-content">
          <p className="mk-eyebrow">The founder</p>
          <p className="mk-instr-quote">
            &ldquo;Bounce Lab &mdash; a space where women can reconnect with themselves and with each other through dance.&rdquo;
          </p>
          <div>
            <p className="mk-instr-name">Iryna Pytska</p>
            <p className="mk-instr-role">Founder &amp; Instructor · bounce lab</p>
          </div>
        </div>
      </section>

      {/* ═══ MANIFESTO + CTA ═══ */}
      <div className="mk-manifesto fade-in">
        <p className="mk-manifesto-text">
          <span className="muted">I created Bounce Lab for every woman</span><br />
          <span className="accent">who has ever felt lonely, lost,</span><br />
          <span className="accent">too quiet, too much, or not enough.</span><br />
          <span className="muted">Because sometimes all it takes is music, movement,</span><br />
          <span className="accent">and the right people around you</span><br />
          <span className="accent">to start feeling alive again.</span>
        </p>
        <Link href="/book" className="btn-manifesto-cta">Feel Alive Again — Book Your First Class</Link>
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
        <WeekCalendarClient schedule={schedule} />
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

      {/* ═══ FAQ ═══ */}
      <section className="mk-faq fade-in" id="faq">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "Do I need dance experience to join?", acceptedAnswer: { "@type": "Answer", text: "No experience needed. All classes at bounce lab are beginner-friendly — the most important thing is showing up and enjoying the movement. Many students come with zero dance background." } },
              { "@type": "Question", name: "What if I feel self-conscious or nervous?", acceptedAnswer: { "@type": "Answer", text: "That's completely normal — most of our students felt the same way before their first class. bounce lab is a judgment-free space where everyone supports each other. You'll feel comfortable from the very first minute." } },
              { "@type": "Question", name: "What should I wear to a twerk or high heels class?", acceptedAnswer: { "@type": "Answer", text: "Wear comfortable clothes you can move in. For High Heels class, bring a pair of heels (5–8 cm recommended) or train in socks while you build confidence. For Twerk and Stretching, athletic or dance wear works great." } },
              { "@type": "Question", name: "How much does a drop-in class cost in Portland?", acceptedAnswer: { "@type": "Answer", text: "Drop-in prices: Stretching $20, Twerk $25, High Heels $30. Monthly passes available: Twerk ($80/month for 4 classes) and High Heels ($100/month for 4 classes)." } },
              { "@type": "Question", name: "Can I cancel or reschedule my booking?", acceptedAnswer: { "@type": "Answer", text: "Yes! You can reschedule or cancel your booking up to 24 hours before the class at no charge. Just reach out to us by phone or email." } },
              { "@type": "Question", name: "Where do bounce lab classes take place in Portland?", acceptedAnswer: { "@type": "Answer", text: "Classes are held at 1107 NE 9th Ave, Portland, OR 97232. Street parking is available nearby." } },
              { "@type": "Question", name: "Do I need to book in advance?", acceptedAnswer: { "@type": "Answer", text: "We recommend booking online to reserve your spot — classes can fill up quickly. Walk-ins are welcome based on availability." } },
              { "@type": "Question", name: "What dance styles does bounce lab offer?", acceptedAnswer: { "@type": "Answer", text: "bounce lab offers three weekly classes in Portland: Twerk (every Saturday 11 AM–12:20 PM), High Heels (every Friday 7–8 PM), and Stretching (every Thursday 7–8 PM). All styles are beginner-friendly." } },
            ],
          }) }}
        />
        <div className="mk-faq-head">
          <div>
            <p className="mk-eyebrow">Common questions</p>
            <h2 className="mk-section-title">FAQ</h2>
          </div>
          <span className="mk-schedule-note">Beginner-friendly · Portland, OR</span>
        </div>
        <div className="faq-list">
          {[
            { q: "Do I need dance experience to join?", a: "No experience needed. All classes at bounce lab are beginner-friendly — the most important thing is showing up and enjoying the movement. Many students come with zero dance background." },
            { q: "What if I feel self-conscious or nervous?", a: "That's completely normal — most of our students felt the same way before their first class. bounce lab is a judgment-free space where everyone supports each other. You'll feel comfortable from the very first minute." },
            { q: "What should I wear to a twerk or high heels class?", a: "Wear comfortable clothes you can move in. For High Heels, bring a pair of heels (5–8 cm recommended) or train in socks while you build confidence. For Twerk and Stretching, athletic or dance wear works great." },
            { q: "How much does a drop-in class cost in Portland?", a: "Drop-in prices: Stretching $20, Twerk $25, High Heels $30. Monthly passes available: Twerk ($80/month for 4 classes) and High Heels ($100/month for 4 classes)." },
            { q: "Can I cancel or reschedule my booking?", a: "Yes! You can reschedule or cancel your booking up to 24 hours before the class at no charge. Just reach out to us by phone or email." },
            { q: "Where do bounce lab classes take place in Portland?", a: "Classes are held at 1107 NE 9th Ave, Portland, OR 97232. Street parking is available nearby." },
            { q: "Do I need to book in advance?", a: "We recommend booking online to reserve your spot — classes can fill up quickly. Walk-ins are welcome based on availability." },
            { q: "What dance styles does bounce lab offer?", a: "Three weekly classes: Twerk (every Saturday 11 AM–12:20 PM), High Heels (every Friday 7–8 PM), and Stretching (every Thursday 7–8 PM). All styles are beginner-friendly." },
          ].map(({ q, a }) => (
            <details key={q} className="faq-item">
              <summary>{q}</summary>
              <p className="faq-answer">{a}</p>
            </details>
          ))}
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
                  <img src={imgSrc} alt="bounce lab dance studio Portland" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transition: 'transform 0.55s ease' }} />
                ) : (
                  <Image src={imgSrc} alt="bounce lab dance studio Portland" fill style={{ objectFit: 'cover', objectPosition: pos }} />
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
        {googleRating > 0 && <p className="mk-cta-proof">{googleRating} ★ on Google · {googleReviewCount} reviews · Free cancellation</p>}
      </section>
    </>
  )
}
