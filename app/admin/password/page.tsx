'use client'

import { useActionState } from 'react'
import { changePassword } from '@/app/actions/auth'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const [state, action, pending] = useActionState(changePassword, null)

  return (
    <div className="light-page" style={{ minHeight: '100vh', background: '#fff', color: '#111', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #111', background: '#111' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>bounce lab</p>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>Change Password</h1>
          </div>
          <Link href="/admin" style={{ fontSize: 12, color: '#fff', textDecoration: 'none', border: '1px solid #555', padding: '7px 14px', whiteSpace: 'nowrap' }}>
            ← Admin
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 24px' }}>

        {state?.success ? (
          <div style={{ background: '#D4EDDA', border: '1px solid #A8D5B5', padding: '20px 24px', marginBottom: 24, borderRadius: 2 }}>
            <p style={{ color: '#155724', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Password changed</p>
            <p style={{ color: '#155724', fontSize: 13 }}>Your new password is active. Next time you log in, use it.</p>
          </div>
        ) : state?.message && !state.success ? (
          <div style={{ background: '#F8D7DA', border: '1px solid #F5C6CB', padding: '16px 20px', marginBottom: 24, borderRadius: 2 }}>
            <p style={{ color: '#721C24', fontSize: 13, fontWeight: 600 }}>{state.message}</p>
          </div>
        ) : null}

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#DDD' }}>
          <Field name="current" label="Current password" placeholder="Enter current password" />
          <Field name="next"    label="New password"     placeholder="Min 6 characters" />
          <Field name="confirm" label="Confirm new password" placeholder="Repeat new password" />

          <button
            type="submit"
            disabled={pending}
            style={{
              background: pending ? '#999' : '#111',
              color: '#fff',
              border: 'none',
              padding: '18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: pending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              marginTop: 1,
            }}
          >
            {pending ? 'Saving...' : 'Change Password'}
          </button>
        </form>

      </div>
    </div>
  )
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <div style={{ background: '#fff', padding: '4px 0' }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', padding: '12px 20px 2px', fontWeight: 600 }}>
        {label}
      </label>
      <input
        name={name}
        type="password"
        placeholder={placeholder}
        required
        style={{
          width: '100%', padding: '8px 20px 14px', border: 'none', outline: 'none',
          fontFamily: 'inherit', fontSize: 15, color: '#111', background: '#fff',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
