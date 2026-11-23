'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addClosure, deleteClosure, type AffectedBooking } from '@/app/actions/closures'

type Row = { id: number; startDate: string; endDate: string; classType: string | null; note: string | null; affected: AffectedBooking[] }

const LABEL: Record<string, string> = { twerk: 'Twerk', highheels: 'High Heels' }

function fmt(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

/** Vacation / holiday closures: pick a range (one day, a week, a month…) and those classes stop
 * being bookable everywhere — including dates the system hasn't generated yet. */
export default function ClosuresPanel({ closures }: { closures: Row[] }) {
  const router = useRouter()
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [classType, setClassType] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const onAdd = () => {
    setError(null)
    startTransition(async () => {
      const res = await addClosure({ startDate: start, endDate: end || start, classType: classType || null, note })
      if (!res.success) { setError(res.error); return }
      setStart(''); setEnd(''); setNote('')
      router.refresh()
    })
  }

  const onDelete = (id: number) => {
    startTransition(async () => {
      await deleteClosure(id)
      router.refresh()
    })
  }

  return (
    <div style={{ border: '1px solid #E0E0E0', background: '#fff', padding: '16px 18px', marginBottom: 32 }}>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>
        Going on vacation or closed for a holiday? Pick the dates — those classes disappear from booking right away.
        For one day, leave &quot;To&quot; empty.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={lbl}>From<input type="date" value={start} onChange={e => setStart(e.target.value)} style={inp} /></label>
        <label style={lbl}>To<input type="date" value={end} min={start || undefined} onChange={e => setEnd(e.target.value)} style={inp} /></label>
        <label style={lbl}>Classes
          <select value={classType} onChange={e => setClassType(e.target.value)} style={inp}>
            <option value="">All classes</option>
            <option value="twerk">Twerk only</option>
            <option value="highheels">High Heels only</option>
          </select>
        </label>
        <label style={{ ...lbl, flex: '1 1 160px' }}>Note for students (optional)
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. holiday break" maxLength={80} style={inp} />
        </label>
        <button disabled={pending || !start} onClick={onAdd} style={btn('#C62828', pending || !start)}>Close these dates</button>
      </div>
      {error && <p style={{ fontSize: 12, color: '#C62828', marginTop: 8 }}>{error}</p>}

      {closures.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {closures.map(c => (
            <div key={c.id} style={{ borderTop: '1px solid #EEE', padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#111' }}>
                  <b>{c.classType ? LABEL[c.classType] : 'All classes'}</b> closed {fmt(c.startDate)}{c.endDate !== c.startDate && <> → {fmt(c.endDate)}</>}
                  {c.note && <span style={{ color: '#777' }}> · {c.note}</span>}
                </span>
                <button disabled={pending} onClick={() => onDelete(c.id)} style={btn('#455A64', pending)}>Reopen</button>
              </div>
              {c.affected.length > 0 && (
                <div style={{ background: '#FFF3CD', color: '#7A4F00', fontSize: 12, padding: '8px 10px', marginTop: 8 }}>
                  ⚠️ {c.affected.length} paid booking{c.affected.length === 1 ? '' : 's'} on these dates — contact them and cancel/refund below:
                  <ul style={{ margin: '6px 0 0 16px' }}>
                    {c.affected.map(a => (
                      <li key={a.id}>{a.name} · {LABEL[a.classType] ?? a.classType} {fmt(a.date)} · {a.phone}{a.email ? ` · ${a.email}` : ''}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#666' }
const inp: React.CSSProperties = { padding: '6px 8px', border: '1px solid #CCC', fontFamily: 'inherit', fontSize: 13, color: '#111', background: '#fff' }
function btn(bg: string, disabled: boolean): React.CSSProperties {
  return { background: bg, color: '#fff', border: 'none', padding: '9px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1, fontFamily: 'inherit' }
}
