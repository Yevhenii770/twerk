'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateDropinPrice, updateMonthlyPrice } from '@/app/actions/classSettings'

const CLASS_LABELS: Record<string, string> = { twerk: 'Twerk', highheels: 'High Heels' }

type SaveResult = { success: boolean; error?: string } | undefined

export default function ClassPricingCard({ classType, dropinPrice, monthlyPrice }: {
  classType: string; dropinPrice: number; monthlyPrice: number
}) {
  return (
    <div style={{ border: '1px solid #E0E0E0', background: '#fff', padding: '14px 18px', flex: '1 1 280px', minWidth: 260 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10 }}>{CLASS_LABELS[classType] ?? classType}</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <PriceField label="Drop-in" price={dropinPrice} save={(v) => updateDropinPrice(classType, v)} />
        <PriceField label="Monthly Pass" price={monthlyPrice} save={(v) => updateMonthlyPrice(classType, v)} />
      </div>
    </div>
  )
}

function PriceField({ label, price, save }: { label: string; price: number; save: (v: number) => Promise<SaveResult> }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(price))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const onSave = () => {
    const parsed = parseInt(value, 10)
    if (Number.isNaN(parsed)) { setError('Enter a valid number'); return }
    setError(null)
    startTransition(async () => {
      const result = await save(parsed)
      if (!result?.success) { setError(result?.error || 'Could not save'); return }
      router.refresh()
      setEditing(false)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {editing ? (
        <>
          <span style={{ fontSize: 11, color: '#666', minWidth: 68 }}>{label}</span>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} style={{ width: 60, padding: '6px 8px', border: '1px solid #CCC', fontFamily: 'inherit', fontSize: 12 }} />
          <button disabled={pending} onClick={onSave} style={miniBtn('#1565C0')}>Save</button>
          <button onClick={() => { setValue(String(price)); setError(null); setEditing(false) }} style={miniBtn('#888')}>Cancel</button>
          {error && <span style={{ fontSize: 11, color: '#C62828', width: '100%' }}>{error}</span>}
        </>
      ) : (
        <button onClick={() => setEditing(true)} style={miniBtn('#455A64')}>{label}: ${price}</button>
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
