import { Suspense } from 'react'
import BookingFormNew from '@/components/BookingFormNew'
import type { Metadata } from 'next'
import { getSchedule } from '@/lib/dal'

export const metadata: Metadata = {
  title: "Book a Dance Class in Portland, OR",
  description: "Reserve your spot in a Twerk, High Heels, or Stretching class at bounce lab in Portland, Oregon. Drop-in $20–$30. Easy online booking.",
  keywords: "book dance class Portland, reserve twerk class, book high heels class Portland, dance class booking Portland Oregon, drop-in dance class Portland",
  alternates: { canonical: "https://bounce-lab.com/book" },
  openGraph: {
    title: "Book a Class — bounce lab Portland",
    description: "Twerk · High Heels · Stretching. Drop-in or monthly pass. Portland, Oregon.",
    url: "https://bounce-lab.com/book",
    images: [{ url: "/og-image-v2.jpg", width: 1200, height: 630, alt: "Book a dance class at bounce lab Portland" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Dance Class — bounce lab Portland, OR",
    description: "Twerk · High Heels · Stretching. Drop-in from $20. Book your spot online.",
    images: ["/og-image-v2.jpg"],
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
