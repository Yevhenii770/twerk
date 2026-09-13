import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBookingByToken } from '@/app/actions/manageBooking'
import { buildGoogleCalendarUrl, STUDIO_ADDRESS_DISPLAY, STUDIO_DIRECTIONS_URL } from '@/lib/calendar'
import ManageBookingActions from '@/components/ManageBookingActions'

export const metadata: Metadata = { robots: { index: false, follow: false } }

const CLASS_LABELS: Record<string, string> = { twerk: 'Twerk', highheels: 'High Heels' }

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

const STATUS_LABEL: Record<string, string> = {
  paid: 'Confirmed', cancelled: 'Cancelled', refunded: 'Refunded', failed: 'Payment Failed',
}

export default async function ManageBookingPage({
  params, searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ fresh?: string }>
}) {
  const { token } = await params
  const { fresh } = await searchParams
  const data = await getBookingByToken(token)
  if (!data) notFound()

  const { booking, session, groupBookings } = data
  const isGroup = groupBookings.length > 1
  const classLabel = session ? (CLASS_LABELS[session.classType] ?? session.classType) : booking.classType

  const calUrl = session ? buildGoogleCalendarUrl({
    title: `${classLabel} @ bounce lab`,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    details: `Your ${classLabel} class at bounce lab.`,
  }) : null

  const totalPaidCents = isGroup
    ? groupBookings.reduce((sum, g) => sum + (g.booking.amountPaidCents ?? 0), 0)
    : booking.amountPaidCents
  const hasPaidBooking = isGroup ? groupBookings.some(g => g.booking.status === 'paid') : booking.status === 'paid'

  return (
    <section style={{ minHeight: '100vh', paddingTop: 40, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 480, width: '100%', padding: '48px 24px 80px', textAlign: 'center' }}>
        {fresh === '1' && booking.status === 'paid' ? (
          <>
            <p className="mk-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>{isGroup ? 'Monthly Pass confirmed' : 'Booking confirmed'}</p>
            <h1 className="mk-section-title" style={{ marginBottom: 24 }}>See you there, {booking.firstName || booking.name}!</h1>
          </>
        ) : (
          <>
            <p className="mk-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>{isGroup ? 'Your Monthly Pass' : 'Your booking'}</p>
            <h1 className="mk-section-title" style={{ marginBottom: 24 }}>{classLabel}{isGroup ? ' Monthly Pass' : ''}</h1>
          </>
        )}

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '28px 32px', textAlign: 'left', marginBottom: 24 }}>
          {!isGroup && <Row label="Status" value={STATUS_LABEL[booking.status] ?? booking.status} />}
          <Row label="Class" value={classLabel} />
          {!isGroup && session && <Row label="Date" value={fmtDate(session.date)} />}
          {!isGroup && session && <Row label="Time" value={`${fmtTime(session.startTime)} – ${fmtTime(session.endTime)}`} />}
          <Row label="Location" value={STUDIO_ADDRESS_DISPLAY} />
          <Row label="Name" value={booking.name} />
          {totalPaidCents != null && <Row label="Amount paid" value={`$${(totalPaidCents / 100).toFixed(2)}`} />}
          <Row label="Reference" value={`#${booking.id}`} />
        </div>

        {isGroup && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '20px 24px', textAlign: 'left', marginBottom: 24 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: 12 }}>
              {groupBookings.length} Classes
            </p>
            {groupBookings.map((g) => {
              const s = g.session
              const gCalUrl = s ? buildGoogleCalendarUrl({
                title: `${CLASS_LABELS[s.classType] ?? s.classType} @ bounce lab`,
                date: s.date, startTime: s.startTime, endTime: s.endTime,
                details: `Your ${classLabel} class at bounce lab.`,
              }) : null
              return (
                <div key={g.booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>{s ? fmtDate(s.date) : '—'}</p>
                    {s && <p style={{ fontSize: 12, color: 'var(--mid)' }}>{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--mid)' }}>{STATUS_LABEL[g.booking.status] ?? g.booking.status}</span>
                    {g.booking.status === 'paid' && s && (
                      <>
                        {gCalUrl && <a href={gCalUrl} target="_blank" rel="noopener" style={{ fontSize: 11, color: 'var(--pink)' }}>Google Cal</a>}
                        <a href={`/api/ics/${g.booking.managementToken}`} style={{ fontSize: 11, color: 'var(--pink)' }}>Apple Cal</a>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isGroup && booking.status === 'paid' && session && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <a href={STUDIO_DIRECTIONS_URL} target="_blank" rel="noopener" className="btn-outline-dark" style={{ fontSize: 11, padding: '12px 20px' }}>
              Get Directions
            </a>
            {calUrl && (
              <a href={calUrl} target="_blank" rel="noopener" className="btn-outline-dark" style={{ fontSize: 11, padding: '12px 20px' }}>
                Add to Google Calendar
              </a>
            )}
            <a href={`/api/ics/${token}`} className="btn-outline-dark" style={{ fontSize: 11, padding: '12px 20px' }}>
              Add to Apple Calendar
            </a>
          </div>
        )}
        {isGroup && hasPaidBooking && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <a href={STUDIO_DIRECTIONS_URL} target="_blank" rel="noopener" className="btn-outline-dark" style={{ fontSize: 11, padding: '12px 20px' }}>
              Get Directions
            </a>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ManageBookingActions token={token} canCancel={hasPaidBooking} isGroup={isGroup} />
        </div>

        <p style={{ fontSize: 12, color: 'var(--mid)', marginTop: 32 }}>
          Questions? <a href="/contact" style={{ color: 'var(--pink)' }}>Contact us</a>
        </p>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--dark)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
