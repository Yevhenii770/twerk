'use client'

import { useRouter } from 'next/navigation'
import { deleteBooking } from '@/app/actions/booking'

export default function DeleteConfirmBtn({ id }: { id: number }) {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        if (!window.confirm('Delete this booking? This cannot be undone.')) return
        await deleteBooking(id)
        router.refresh()
      }}
      style={{
        background: '#C62828',
        color: '#fff',
        border: 'none',
        padding: '7px 14px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: 'inherit',
        borderRadius: 2,
      }}
    >
      ✕ Delete
    </button>
  )
}
