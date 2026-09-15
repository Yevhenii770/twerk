'use client'

import { useActionState } from 'react'
import Script from 'next/script'
import { submitContactMessage } from '@/app/actions/contact'
import { track } from '@/lib/analytics'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export default function ContactForm({ prefill }: {
  prefill?: { name?: string; email?: string; phone?: string; inquiryType?: 'question' | 'problem' | 'other'; message?: string }
} = {}) {
  const [state, action, pending] = useActionState(submitContactMessage, null)

  const fieldErrors = (state && !state.success && state.errors && !('_' in state.errors)) ? state.errors : null
  const generalError = (state && !state.success && state.errors && '_' in state.errors) ? state.errors._[0] : null

  if (state?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p className="mk-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Message sent</p>
        <h3 className="mk-section-title" style={{ fontSize: 22, marginBottom: 8 }}>Thanks for reaching out</h3>
        <p style={{ fontSize: 13, color: 'var(--mid)' }}>We&apos;ll get back to you as soon as we can.</p>
      </div>
    )
  }

  return (
    <form
      action={action}
      onSubmit={() => track('contact_submitted')}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}
    >
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

      <Field label="Name" name="name" placeholder="Jane Doe" defaultValue={prefill?.name} error={fieldErrors?.name?.[0]} />
      <Field label="Email" name="email" type="email" placeholder="jane@email.com" defaultValue={prefill?.email} error={fieldErrors?.email?.[0]} />
      <Field label="Phone (optional)" name="phone" type="tel" placeholder="(555) 123-4567" defaultValue={prefill?.phone} error={fieldErrors?.phone?.[0]} />

      <div>
        <label style={labelStyle}>What&apos;s this about? (optional)</label>
        <select name="inquiryType" style={inputStyle} defaultValue={prefill?.inquiryType ?? ''}>
          <option value="">Select one</option>
          <option value="question">General question</option>
          <option value="problem">Report a problem</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea name="message" placeholder="How can we help?" rows={5} defaultValue={prefill?.message} style={{ ...inputStyle, resize: 'vertical' }} />
        {fieldErrors?.message?.[0] && <p style={errorStyle}>{fieldErrors.message[0]}</p>}
      </div>

      {generalError && <p style={errorStyle}>{generalError}</p>}

      {TURNSTILE_SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
        </>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          background: pending ? '#C8C0B8' : 'var(--pink)',
          color: '#fff', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
          padding: '16px 0', border: 'none', cursor: pending ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        }}
      >
        {pending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid)',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', border: '1px solid var(--border)', outline: 'none',
  fontFamily: 'inherit', fontSize: 14, color: 'var(--dark)', background: '#fff', boxSizing: 'border-box',
}

const errorStyle: React.CSSProperties = { fontSize: 11, color: 'var(--pink)', marginTop: 4 }

function Field({ label, name, placeholder, type = 'text', defaultValue, error }: {
  label: string; name: string; placeholder: string; type?: string; defaultValue?: string; error?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} style={inputStyle} />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  )
}
