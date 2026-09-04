'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelOwnBooking } from '@/app/actions/manageBooking'

export default function ManageBookingActions({ token, canCancel }: { token: string; canCancel: boolean }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  if (!canCancel) return null

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelOwnBooking(token)
      if (!result.success) { setError(result.error || 'Could not cancel booking'); setConfirming(false); return }
      router.refresh()
    })
  }

  return (
    <div style={{ marginTop: 20 }}>
      {error && <p style={{ fontSize: 12, color: 'var(--pink)', marginBottom: 10 }}>{error}</p>}
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)} style={{ fontSize: 12, color: 'var(--mid)', background: 'none', border: '1px solid var(--border)', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel this booking
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--dark)' }}>Are you sure?</span>
          <button type="button" onClick={handleCancel} disabled={pending} style={{ fontSize: 12, color: '#fff', background: 'var(--pink)', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {pending ? 'Cancelling…' : 'Yes, cancel'}
          </button>
          <button type="button" onClick={() => setConfirming(false)} style={{ fontSize: 12, color: 'var(--mid)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            Never mind
          </button>
        </div>
      )}
    </div>
  )
}
