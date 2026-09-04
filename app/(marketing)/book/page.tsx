import { Suspense } from 'react'
import BookingFlow from '@/components/BookingFlow'
import type { Metadata } from 'next'
import { ensureUpcomingSessions, getUpcomingSessions } from '@/lib/sessions'
import { CLASS_IDS } from '@/lib/classes'
import type { ClassSession } from '@/db/schema'

export const metadata: Metadata = {
  title: "Book a Dance Class in Portland, OR",
  description: "Reserve your spot in a Twerk or High Heels class at bounce lab in Portland, Oregon. Pick a date, pay securely, and you're booked.",
  keywords: "book dance class Portland, reserve twerk class, book high heels class Portland, dance class booking Portland Oregon, drop-in dance class Portland",
  alternates: { canonical: "https://bounce-lab.com/book" },
  openGraph: {
    title: "Book a Class — bounce lab Portland",
    description: "Twerk · High Heels. Choose a date, pay securely, get confirmed instantly. Portland, Oregon.",
    url: "https://bounce-lab.com/book",
    images: [{ url: "/og-image-v2.jpg", width: 1200, height: 630, alt: "Book a dance class at bounce lab Portland" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Dance Class — bounce lab Portland, OR",
    description: "Twerk · High Heels. Book your spot online in minutes.",
    images: ["/og-image-v2.jpg"],
  },
}

export default async function BookPage() {
  await ensureUpcomingSessions()
  const sessions = await getUpcomingSessions()

  const sessionsByClass: Record<string, ClassSession[]> = Object.fromEntries(CLASS_IDS.map(id => [id, []]))
  for (const s of sessions) {
    if (!sessionsByClass[s.classType]) sessionsByClass[s.classType] = []
    sessionsByClass[s.classType].push(s)
  }

  return (
    <section style={{ minHeight: '100vh', paddingTop: 40 }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '52px 72px 40px' }}>
        <p className="mk-eyebrow">Reserve your spot</p>
        <h1 className="mk-section-title">Book a Class</h1>
      </div>
      <Suspense fallback={<div style={{ padding: 48, color: 'var(--mid)', fontSize: 14 }}>Loading...</div>}>
        <BookingFlow sessionsByClass={sessionsByClass} />
      </Suspense>
    </section>
  )
}
