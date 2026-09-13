'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelPaidBooking, refundPaidBooking, markAttendance, updateBookingContact } from '@/app/actions/adminBooking'
import type { Booking } from '@/db/schema'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  paid: { bg: '#D4EDDA', color: '#155724' },
  cancelled: { bg: '#E2E2E2', color: '#444' },
  refunded: { bg: '#F0E68C', color: '#5C4E00' },
  failed: { bg: '#F8D7DA', color: '#721C24' },
}

export default function AttendeeRow({ booking }: { booking: Booking }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState(booking.firstName ?? '')
  const [lastName, setLastName] = useState(booking.lastName ?? '')
  const [email, setEmail] = useState(booking.email ?? '')
  const [phone, setPhone] = useState(booking.phone)

  const act = (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if (!result.success) setError(result.error || 'Action failed')
      else router.refresh()
    })
  }

  if (editing) {
    return (
      <div style={{ padding: '12px 16px', background: '#FFFBEA', border: '1px solid #E0D8B0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" style={inputStyle} />
          <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" style={inputStyle} />
        </div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" style={inputStyle} />
        {error && <p style={{ fontSize: 11, color: '#C62828' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            disabled={pending}
            onClick={() => act(() => updateBookingContact(booking.id, { firstName, lastName, email, phone }))}
            style={smallBtnStyle('#1565C0')}
          >
            Save
          </button>
          <button onClick={() => setEditing(false)} style={smallBtnStyle('#666')}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ minWidth: 180 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>
          {booking.name}
          {booking.attended && <span style={{ marginLeft: 6, fontSize: 11, color: '#2E7D32' }}>✓ Attended</span>}
        </p>
        <p style={{ fontSize: 11, color: '#666', margin: '2px 0 0' }}>{booking.email} · {booking.phone}</p>
        {booking.notes && <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0', fontStyle: 'italic' }}>&ldquo;{booking.notes}&rdquo;</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          padding: '3px 8px', background: STATUS_STYLE[booking.status]?.bg ?? '#EEE', color: STATUS_STYLE[booking.status]?.color ?? '#333',
        }}>
          {booking.status}
        </span>
        {booking.amountPaidCents != null && <span style={{ fontSize: 12, fontWeight: 700 }}>${(booking.amountPaidCents / 100).toFixed(2)}</span>}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {booking.status === 'paid' && (
          <button disabled={pending} onClick={() => act(() => markAttendance(booking.id, !booking.attended))} style={smallBtnStyle('#455A64')}>
            {booking.attended ? 'Unmark' : 'Mark Attended'}
          </button>
        )}
        <button disabled={pending} onClick={() => setEditing(true)} style={smallBtnStyle('#1565C0')}>Edit</button>
        {booking.status === 'paid' && (
          <>
            <button disabled={pending} onClick={() => { if (window.confirm('Cancel this booking? Seat will be released. This does not refund the payment.')) act(() => cancelPaidBooking(booking.id)) }} style={smallBtnStyle('#555')}>
              Cancel
            </button>
            <button disabled={pending} onClick={() => { if (window.confirm('Refund this payment via Square and cancel the booking?')) act(() => refundPaidBooking(booking.id)) }} style={smallBtnStyle('#C62828')}>
              Refund
            </button>
          </>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: '#C62828', width: '100%' }}>{error}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = { flex: 1, padding: '8px 10px', border: '1px solid #CCC', fontFamily: 'inherit', fontSize: 13 }

function smallBtnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: '#fff', border: 'none', padding: '6px 12px', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
  }
}
