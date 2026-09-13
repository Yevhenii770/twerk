import { Suspense } from 'react'
import BookingFlow from '@/components/BookingFlow'
import type { Metadata } from 'next'
import { ensureUpcomingSessions, getUpcomingSessions } from '@/lib/sessions'
import { CLASS_STATIC, CLASS_IDS, type ClassId } from '@/lib/classes'
import { getClassSettings } from '@/lib/dal'
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
  const [sessions, classSettings] = await Promise.all([getUpcomingSessions(), getClassSettings()])

  const sessionsByClass: Record<string, ClassSession[]> = Object.fromEntries(CLASS_IDS.map(id => [id, []]))
  for (const s of sessions) {
    if (!sessionsByClass[s.classType]) sessionsByClass[s.classType] = []
    sessionsByClass[s.classType].push(s)
  }

  const monthlyPrices = Object.fromEntries(
    CLASS_IDS.map((id: ClassId) => [id, classSettings[id]?.monthlyPrice ?? CLASS_STATIC[id].monthly])
  ) as Record<ClassId, number | null>

  // The next upcoming session's own price is the true drop-in price a customer would actually
  // be charged — it's kept in sync with the admin's configured price (see updateDropinPrice),
  // so reading it here avoids the class picker showing a stale hardcoded default.
  const dropinPrices = Object.fromEntries(
    CLASS_IDS.map((id: ClassId) => [id, sessionsByClass[id]?.[0]?.price ?? CLASS_STATIC[id].dropin])
  ) as Record<ClassId, number>

  return (
    <section style={{ minHeight: '100vh', paddingTop: 40 }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '52px 72px 40px' }}>
        <p className="mk-eyebrow">Reserve your spot</p>
        <h1 className="mk-section-title">Book a Class</h1>
      </div>
      <Suspense fallback={<div style={{ padding: 48, color: 'var(--mid)', fontSize: 14 }}>Loading...</div>}>
        <BookingFlow sessionsByClass={sessionsByClass} monthlyPrices={monthlyPrices} dropinPrices={dropinPrices} />
      </Suspense>
    </section>
  )
}
