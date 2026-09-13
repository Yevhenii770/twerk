import { Suspense } from 'react'
import BookingFlow from '@/components/BookingFlow'
import type { Metadata } from 'next'
import { ensureUpcomingSessions, getUpcomingSessions } from '@/lib/sessions'
import { CLASS_IDS } from '@/lib/classes'
import type { ClassSession } from '@/db/schema'

// TEMPORARY, unlisted: /book is back on the old phone-confirm form while the Square checkout
// is still being verified with real cards. This route is the same Square-based BookingFlow the
// old /book used, kept reachable (but not linked or indexed) so real-card testing on production
// can continue without exposing it to customers. Delete this route once /book switches back.
export const metadata: Metadata = {
  title: "Payment test — not for customers",
  robots: { index: false, follow: false },
}

export default async function BookLiveTestPage() {
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
        <p className="mk-eyebrow">Internal — payment testing</p>
        <h1 className="mk-section-title">Book a Class</h1>
      </div>
      <Suspense fallback={<div style={{ padding: 48, color: 'var(--mid)', fontSize: 14 }}>Loading...</div>}>
        <BookingFlow sessionsByClass={sessionsByClass} />
      </Suspense>
    </section>
  )
}
