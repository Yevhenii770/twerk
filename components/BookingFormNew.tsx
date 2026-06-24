'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBooking } from '@/app/actions/booking'
import { CLASS_STATIC, CLASS_IDS, DAY_NAMES, type ClassId, type ClassSchedule } from '@/lib/classes'

function getNextDates(dayOfWeek: number, count = 8): string[] {
  const dates: string[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  while (dates.length < count) {
    if (d.getDay() === dayOfWeek) dates.push(d.toISOString().split('T')[0])
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function getMonthlyDates(startIso: string): string[] {
  const dates: string[] = []
  const d = new Date(startIso + 'T12:00:00')
  for (let i = 0; i < 4; i++) {
    dates.push(d.toISOString().split('T')[0])
    d.setDate(d.getDate() + 7)
  }
  return dates
}

export default function BookingFormNew({ schedule }: { schedule: ClassSchedule[] }) {
  const searchParams = useSearchParams()
  const paramClass = searchParams.get('class') as ClassId | null
  const [state, action, pending] = useActionState(createBooking, null)
  const [classType, setClassType] = useState<ClassId>(
    (paramClass && CLASS_IDS.includes(paramClass)) ? paramClass : 'twerk'
  )
  const [bookingType, setBookingType] = useState<'dropin' | 'monthly'>('dropin')
  const [selectedDate, setSelectedDate] = useState('')
  const [name, setName] = useState('')
  const [instagram, setInstagram] = useState('')
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const dateRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const instagramRef = useRef<HTMLDivElement>(null)

  const scheduleMap = Object.fromEntries(schedule.map(s => [s.classType, s]))
  const sched = scheduleMap[classType]
  const staticInfo = CLASS_STATIC[classType]
  const dayName = sched ? DAY_NAMES[sched.dayOfWeek] : ''
  const dates = sched ? getNextDates(sched.dayOfWeek) : []

  useEffect(() => {
    setSelectedDate('')
    setBookingType('dropin')
  }, [classType])

  useEffect(() => {
    if (clientErrors.date && selectedDate) setClientErrors(e => { const { date, ...rest } = e; return rest })
  }, [selectedDate, clientErrors.date])

  useEffect(() => {
    if (clientErrors.name && name.trim().length >= 2) setClientErrors(e => { const { name: _, ...rest } = e; return rest })
  }, [name, clientErrors.name])

  useEffect(() => {
    if (clientErrors.instagram) {
      const clean = instagram.replace(/^@+/, '')
      if (clean && /^[a-zA-Z0-9._]{1,30}$/.test(clean)) setClientErrors(e => { const { instagram: _, ...rest } = e; return rest })
    }
  }, [instagram, clientErrors.instagram])

  const fieldErrors = (state && !state.success && state.errors && !('_' in state.errors)) ? state.errors : null

  if (state?.success && state.data) {
    const { name, classType: ct, date, price: p, bookingType: bt } = state.data
    const label = CLASS_STATIC[ct as ClassId]?.label
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <p className="mk-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Booking confirmed</p>
        <h2 className="mk-section-title" style={{ marginBottom: 24 }}>See you there, {name}!</h2>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '28px 32px', textAlign: 'left', marginBottom: 32 }}>
          <Row label="Class" value={label} />
          <Row label="Type" value={bt === 'monthly' ? 'Monthly pass · 4 classes' : 'Drop-in'} />
          {bt === 'monthly' ? (
            getMonthlyDates(date).map((d, i) => (
              <Row key={d} label={`Class ${i + 1}`} value={formatDate(d)} />
            ))
          ) : (
            <Row label="Date" value={formatDate(date)} />
          )}
          <Row label="Price" value={`$${p}`} />
        </div>
        <div style={{
          background: '#F0FFF4', border: '1px solid #86EFAC',
          padding: '18px 24px', marginBottom: 32, textAlign: 'left',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>📬</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>
              We&apos;ll contact you soon
            </p>
            <p style={{ fontSize: 12, color: 'var(--mid)', lineHeight: 1.7 }}>
              Your request has been received. We&apos;ll reach out via phone or Instagram to confirm your spot.
            </p>
          </div>
        </div>
        <button className="btn-join" onClick={() => window.location.reload()}>
          Book another class
        </button>
      </div>
    )
  }

  const price = bookingType === 'monthly' ? staticInfo.monthly : staticInfo.dropin

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    const firstBad: React.RefObject<HTMLDivElement | null>[] = []

    if (!selectedDate) {
      errors.date = 'Please pick a date'
      firstBad.push(dateRef)
    }
    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Please enter your name'
      firstBad.push(nameRef)
    }
    const phoneInput = phoneRef.current?.querySelector<HTMLInputElement>('input[type="tel"]')
    const phoneDigits = phoneInput?.value.replace(/\D/g, '') ?? ''
    if (phoneDigits.length !== 10) {
      errors.phone = 'Please enter a valid phone number'
      firstBad.push(phoneRef)
    }
    const igClean = instagram.replace(/^@+/, '')
    if (!igClean || !/^[a-zA-Z0-9._]{1,30}$/.test(igClean)) {
      errors.instagram = 'Please enter your Instagram username'
      firstBad.push(instagramRef)
    }

    setClientErrors(errors)

    if (firstBad.length > 0 && firstBad[0].current) {
      firstBad[0].current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return Object.keys(errors).length === 0
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' }}>

      <form action={action} onSubmit={e => { if (!validate()) e.preventDefault() }}>
        <input type="hidden" name="classType" value={classType} />
        <input type="hidden" name="bookingType" value={bookingType} />
        <input type="hidden" name="date" value={selectedDate} />

        {/* Step 1 — Class */}
        <Section step={1} title="Choose your class">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CLASS_IDS.map(key => {
              const s = scheduleMap[key]
              const info = CLASS_STATIC[key]
              const active = classType === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setClassType(key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', border: active ? '2px solid var(--dark)' : '1px solid var(--border)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    background: active ? 'var(--dark)' : '#fff',
                    color: active ? '#fff' : 'var(--dark)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 3, color: active ? '#fff' : 'var(--dark)' }}>{info.label}</p>
                    <p style={{ fontSize: 12, color: active ? 'rgba(255,255,255,0.65)' : 'var(--mid)' }}>
                      {s ? `${DAY_NAMES[s.dayOfWeek]}s · ${s.timeDisplay}` : ''}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 18, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
                    color: active ? '#fff' : 'var(--pink)',
                  }}>
                    from ${info.dropin}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Step 2 — Booking type (skip if no monthly option) */}
        {staticInfo.monthly && (
          <Section step={2} title="How would you like to book?">
            <div style={{ display: 'flex', gap: 8 }}>
              <TypeBtn
                active={bookingType === 'dropin'}
                onClick={() => setBookingType('dropin')}
                label="Drop-in"
                desc="Single class"
                price={`$${staticInfo.dropin}`}
              />
              <TypeBtn
                active={bookingType === 'monthly'}
                onClick={() => setBookingType('monthly')}
                label="Monthly"
                desc="4 classes"
                price={`$${staticInfo.monthly}`}
              />
            </div>
          </Section>
        )}

        {/* Step 3 — Date */}
        <div ref={dateRef}>
        <Section step={staticInfo.monthly ? 3 : 2} title={bookingType === 'monthly' ? 'Pick your start date' : `Pick a ${dayName}`}>
          {bookingType === 'monthly' && (
            <p style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 12, lineHeight: 1.5 }}>
              Choose your first class — the next 3 sessions will be added automatically.
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 8 }}>
            {dates.map(d => {
              const active = selectedDate === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  style={{
                    padding: '14px 6px', border: active ? '2px solid var(--pink)' : '1px solid var(--border)',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, textAlign: 'center',
                    background: active ? 'var(--pink)' : '#fff',
                    color: active ? '#fff' : 'var(--dark)',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {formatDate(d)}
                </button>
              )
            })}
          </div>

          {bookingType === 'monthly' && selectedDate && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {getMonthlyDates(selectedDate).map((d, i) => (
                <div key={d} style={{
                  background: '#F0EBE4', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '10px 16px',
                }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>
                    Class {i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--dark)', fontWeight: 500 }}>
                    {formatDate(d)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(fieldErrors?.date || clientErrors.date) && (
            <p style={{ fontSize: 12, color: 'var(--pink)', marginTop: 8 }}>{clientErrors.date || fieldErrors?.date?.[0]}</p>
          )}
        </Section>
        </div>

        {/* Step — Contact info */}
        <Section step={staticInfo.monthly ? 4 : 3} title="Your details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div ref={nameRef}>
              <InputField label="Full name" name="name" placeholder="Jane Doe" error={clientErrors.name || fieldErrors?.name?.[0]} value={name} onChange={setName} />
            </div>
            <div ref={phoneRef}>
              <PhoneField error={clientErrors.phone || fieldErrors?.phone?.[0]} />
            </div>
            <div ref={instagramRef}>
              <InstagramField error={clientErrors.instagram || fieldErrors?.instagram?.[0]} value={instagram} onChange={setInstagram} />
            </div>
          </div>
        </Section>

        {/* Summary + submit */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: 'var(--dark)' }}>Total</span>
            <span style={{ fontSize: 28, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, color: 'var(--dark)' }}>
              ${price}
            </span>
          </div>
          <button
            type="submit"
            disabled={pending}
            style={{
              width: '100%',
              background: pending ? '#C8C0B8' : 'var(--pink)',
              color: '#fff',
              fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
              padding: '18px 0', border: 'none',
              cursor: pending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.2s',
            }}
          >
            {pending ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ step, title, children }: {
  step: number; title: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', background: 'var(--dark)',
          borderRadius: '50%', flexShrink: 0,
        }}>
          {step}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', letterSpacing: '0.02em' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

function InputField({ label, name, placeholder, error, type = 'text', value, onChange }: {
  label: string; name: string; placeholder: string; error?: string; type?: string
  value?: string; onChange?: (v: string) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        style={{
          width: '100%', padding: '14px 16px', border: '1px solid var(--border)', outline: 'none',
          fontFamily: 'inherit', fontSize: 14, color: 'var(--dark)',
          background: '#fff', transition: 'border-color 0.2s', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--pink)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      {error && <p style={{ fontSize: 11, color: 'var(--pink)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function TypeBtn({ active, onClick, label, desc, price }: {
  active: boolean; onClick: () => void; label: string; desc: string; price: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: '18px 16px', border: active ? '2px solid var(--dark)' : '1px solid var(--border)',
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
        background: active ? 'var(--dark)' : '#fff',
        color: active ? '#fff' : 'var(--dark)',
        transition: 'all 0.2s',
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: active ? '#fff' : 'var(--dark)' }}>{label}</p>
      <p style={{ fontSize: 11, marginBottom: 6, color: active ? 'rgba(255,255,255,0.6)' : 'var(--mid)' }}>{desc}</p>
      <p style={{ fontSize: 20, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, color: active ? '#fff' : 'var(--pink)' }}>{price}</p>
    </button>
  )
}

function InstagramField({ error, value, onChange }: { error?: string; value: string; onChange: (v: string) => void }) {
  const [touched, setTouched] = useState(false)

  const clean = value.replace(/^@+/, '')
  const isValid = /^[a-zA-Z0-9._]{1,30}$/.test(clean) && clean.length >= 1
  const isEmpty = clean.length === 0
  const showError = touched && !isEmpty && !isValid
  const showOk = touched && isValid

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 30)
    onChange(input)
  }

  const getBorderColor = () => {
    if (showError) return 'var(--pink)'
    if (showOk) return '#22c55e'
    return 'var(--border)'
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        Instagram
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          fontSize: 14, color: 'var(--mid)', pointerEvents: 'none',
        }}>@</span>
        <input
          type="text"
          placeholder="username"
          value={clean}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          style={{
            width: '100%', padding: '14px 44px 14px 32px', border: `1px solid ${getBorderColor()}`,
            outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark)',
            background: '#fff', transition: 'border-color 0.2s', boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = showError ? 'var(--pink)' : showOk ? '#22c55e' : 'var(--pink)' }}
        />
        {showOk && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: 18, lineHeight: 1 }}>✓</span>
        )}
        {showError && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--pink)', fontSize: 18, lineHeight: 1 }}>✕</span>
        )}
      </div>
      <input type="hidden" name="instagram" value={clean} />
      {showError && (
        <p style={{ fontSize: 11, color: 'var(--pink)', marginTop: 4 }}>
          Only letters, numbers, dots and underscores
        </p>
      )}
      {error && !showError && (
        <p style={{ fontSize: 11, color: 'var(--pink)', marginTop: 4 }}>{error}</p>
      )}
      <p style={{ fontSize: 11, color: 'var(--mid)', marginTop: 6, lineHeight: 1.5 }}>
        Don&apos;t know your @username?{' '}
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pink)', textDecoration: 'underline' }}>
          Open Instagram
        </a>
        {' '}→ tap your profile → it&apos;s at the top.
      </p>
    </div>
  )
}

function PhoneField({ error }: { error?: string }) {
  const [display, setDisplay] = useState('')
  const [raw, setRaw] = useState('')
  const [touched, setTouched] = useState(false)

  const isValid = raw.length === 10
  const isEmpty = raw.length === 0
  const showError = touched && !isEmpty && !isValid
  const showOk = touched && isValid

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setRaw(digits)
    let formatted = ''
    if (digits.length === 0) formatted = ''
    else if (digits.length <= 3) formatted = `(${digits}`
    else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    setDisplay(formatted)
  }

  const getBorderColor = () => {
    if (showError) return 'var(--pink)'
    if (showOk) return '#22c55e'
    return 'var(--border)'
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        Phone number
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="tel"
          placeholder="(555) 123-4567"
          value={display}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          style={{
            width: '100%', padding: '14px 44px 14px 16px', border: `1px solid ${getBorderColor()}`,
            outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark)',
            background: '#fff', transition: 'border-color 0.2s', boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = showError ? 'var(--pink)' : showOk ? '#22c55e' : 'var(--pink)' }}
        />
        {showOk && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: 18, lineHeight: 1 }}>✓</span>
        )}
        {showError && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--pink)', fontSize: 18, lineHeight: 1 }}>✕</span>
        )}
      </div>
      <input type="hidden" name="phone" value={raw ? `+1 ${display}` : ''} />
      {showError && (
        <p style={{ fontSize: 11, color: 'var(--pink)', marginTop: 4 }}>
          Enter a 10-digit US phone number
        </p>
      )}
      {error && !showError && (
        <p style={{ fontSize: 11, color: 'var(--pink)', marginTop: 4 }}>{error}</p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--dark)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
