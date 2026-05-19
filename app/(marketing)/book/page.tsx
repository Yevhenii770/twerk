import { Suspense } from 'react'
import BookingFormNew from '@/components/BookingFormNew'
import type { Metadata } from 'next'
import { getSchedule } from '@/lib/dal'

export const metadata: Metadata = {
  title: "Book a Dance Class in Portland, OR",
  description: "Reserve your spot in a Twerk, High Heels, or Stretching class at bounce lab in Portland, Oregon. Drop-in $20–$30. Easy online booking.",
  alternates: { canonical: "https://bounce-lab.com/book" },
  openGraph: {
    title: "Book a Class — bounce lab Portland",
    description: "Twerk · High Heels · Stretching. Drop-in or monthly pass. Portland, Oregon.",
    url: "https://bounce-lab.com/book",
  },
}

export default async function BookPage() {
  const schedule = await getSchedule()
  return (
    <section style={{ minHeight: '100vh', paddingTop: 40 }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '52px 72px 40px' }}>
        <p className="mk-eyebrow">Reserve your spot</p>
        <h1 className="mk-section-title">Book a Class</h1>
      </div>
      <Suspense fallback={<div style={{ padding: 48, color: 'var(--mid)', fontSize: 14 }}>Loading...</div>}>
        <BookingFormNew schedule={schedule} />
      </Suspense>
    </section>
  )
}
