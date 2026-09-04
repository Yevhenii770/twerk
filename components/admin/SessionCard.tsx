'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateSessionCapacity, updateSessionPrice, setSessionBookingOpen, cancelSession } from '@/app/actions/adminBooking'
import AttendeeRow from './AttendeeRow'
import type { Booking, ClassSession } from '@/db/schema'

const CLASS_LABELS: Record<string, string> = { twerk: 'Twerk', highheels: 'High Heels' }

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export default function SessionCard({ session, attendees }: { session: ClassSession; attendees: Booking[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingCapacity, setEditingCapacity] = useState(false)
  const [capacity, setCapacity] = useState(String(session.capacity))
  const [editingPrice, setEditingPrice] = useState(false)
  const [price, setPrice] = useState(String(session.price))
  const [pending, startTransition] = useTransition()

  const activeAttendees = attendees.filter(a => a.status === 'paid')
  const booked = activeAttendees.length;

  const saveCapacity = () => {
    const value = parseInt(capacity, 10)
    if (Number.isNaN(value)) return
    startTransition(async () => { await updateSessionCapacity(session.id, value); router.refresh(); setEditingCapacity(false) })
  }

  const savePrice = () => {
    const value = parseInt(price, 10)
    if (Number.isNaN(value)) return
    startTransition(async () => { await updateSessionPrice(session.id, value); router.refresh(); setEditingPrice(false) })
  }

  return (
    <div style={{ border: '1px solid #E0E0E0', background: '#fff', marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: session.cancelled ? '#FBEAEA' : '#F5F5F5', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>
            {fmtDate(session.date)} · {fmtTime(session.startTime)} — {CLASS_LABELS[session.classType] ?? session.classType}
            {session.cancelled && <span style={{ color: '#C62828', marginLeft: 8, fontSize: 11 }}>CANCELLED</span>}
            {!session.bookingOpen && !session.cancelled && <span style={{ color: '#7A4F00', marginLeft: 8, fontSize: 11 }}>CLOSED</span>}
          </p>
          <p style={{ fontSize: 11, color: '#666', margin: '2px 0 0' }}>{booked} / {session.capacity} booked</p>
        </div>
        <span style={{ fontSize: 18, color: '#999' }}>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div>
          <div style={{ padding: '10px 18px', borderBottom: '1px solid #EEE', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', background: '#FAFAFA' }}>
            {editingCapacity ? (
              <>
                <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} style={{ width: 70, padding: '6px 8px', border: '1px solid #CCC', fontFamily: 'inherit', fontSize: 12 }} />
                <button disabled={pending} onClick={saveCapacity} style={miniBtn('#1565C0')}>Save</button>
                <button onClick={() => setEditingCapacity(false)} style={miniBtn('#888')}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditingCapacity(true)} style={miniBtn('#455A64')}>Edit Capacity ({session.capacity})</button>
            )}
            {editingPrice ? (
              <>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={{ width: 70, padding: '6px 8px', border: '1px solid #CCC', fontFamily: 'inherit', fontSize: 12 }} />
                <button disabled={pending} onClick={savePrice} style={miniBtn('#1565C0')}>Save</button>
                <button onClick={() => setEditingPrice(false)} style={miniBtn('#888')}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditingPrice(true)} style={miniBtn('#455A64')}>Edit Price (${session.price})</button>
            )}
            <button
              disabled={pending}
              onClick={() => startTransition(async () => { await setSessionBookingOpen(session.id, !session.bookingOpen); router.refresh() })}
              style={miniBtn(session.bookingOpen ? '#7A4F00' : '#2E7D32')}
            >
              {session.bookingOpen ? 'Close Booking' : 'Reopen Booking'}
            </button>
            {!session.cancelled && (
              <button
                disabled={pending}
                onClick={() => { if (window.confirm('Cancel this whole session? Existing bookings must still be cancelled/refunded individually.')) startTransition(async () => { await cancelSession(session.id); router.refresh() }) }}
                style={miniBtn('#C62828')}
              >
                Cancel Session
              </button>
            )}
          </div>

          {attendees.length === 0 ? (
            <p style={{ padding: '16px 18px', fontSize: 12, color: '#888' }}>No bookings yet.</p>
          ) : (
            attendees.map(a => <AttendeeRow key={a.id} booking={a} />)
          )}
        </div>
      )}
    </div>
  )
}

function miniBtn(bg: string): React.CSSProperties {
  return {
    background: bg, color: '#fff', border: 'none', padding: '6px 12px', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
  }
}
