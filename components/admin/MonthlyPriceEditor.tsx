'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateMonthlyPrice } from '@/app/actions/classSettings'

const CLASS_LABELS: Record<string, string> = { twerk: 'Twerk', highheels: 'High Heels' }

export default function MonthlyPriceEditor({ classType, price }: { classType: string; price: number }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(price))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const save = () => {
    const parsed = parseInt(value, 10)
    if (Number.isNaN(parsed)) { setError('Enter a valid number'); return }
    setError(null)
    startTransition(async () => {
      const result = await updateMonthlyPrice(classType, parsed)
      if (!result?.success) { setError(result?.error || 'Could not save'); return }
      router.refresh()
      setEditing(false)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', border: '1px solid #E0E0E0', background: '#fff', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#111', minWidth: 90 }}>{CLASS_LABELS[classType] ?? classType}</span>
      {editing ? (
        <>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} style={{ width: 70, padding: '6px 8px', border: '1px solid #CCC', fontFamily: 'inherit', fontSize: 12 }} />
          <button disabled={pending} onClick={save} style={miniBtn('#1565C0')}>Save</button>
          <button onClick={() => { setValue(String(price)); setError(null); setEditing(false) }} style={miniBtn('#888')}>Cancel</button>
          {error && <span style={{ fontSize: 11, color: '#C62828' }}>{error}</span>}
        </>
      ) : (
        <button onClick={() => setEditing(true)} style={miniBtn('#455A64')}>Edit Monthly Pass Price (${price})</button>
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
