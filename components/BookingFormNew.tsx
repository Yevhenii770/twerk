'use client'

import { useActionState, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBooking } from '@/app/actions/booking'

type ClassType = 'twerk' | 'highheels' | 'stretching'

const CLASS_INFO = {
  twerk:      { label: 'Twerk',      day: 1, dayName: 'Mondays',   dropin: 25, monthly: 80  },
  highheels:  { label: 'High Heels', day: 2, dayName: 'Tuesdays',  dropin: 30, monthly: 100 },
  stretching: { label: 'Stretching', day: 6, dayName: 'Saturdays', dropin: 20, monthly: null },
}

const TIME_MAP = {
  twerk: '4:00–5:00 PM', highheels: '7:00–8:00 PM', stretching: '11:00 AM–12:20 PM',
}

function getNextDates(dayOfWeek: number, count = 8): string[] {
  const dates: string[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  while (dates.length < count) {
    if (d.getDay() === dayOfWeek) {
      dates.push(d.toISOString().split('T')[0])
    }
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

export default function BookingFormNew() {
  const searchParams = useSearchParams()
  const paramClass = searchParams.get('class') as ClassType | null
  const [state, action, pending] = useActionState(createBooking, null)
  const [classType, setClassType] = useState<ClassType>(
    (paramClass && CLASS_INFO[paramClass]) ? paramClass : 'twerk'
  )
  const [bookingType, setBookingType] = useState<'dropin' | 'monthly'>('dropin')
  const [selectedDate, setSelectedDate] = useState('')

  const info = CLASS_INFO[classType]
  const dates = getNextDates(info.day)
  const price = bookingType === 'monthly' ? info.monthly : info.dropin

  useEffect(() => {
    setSelectedDate('')
    setBookingType('dropin')
  }, [classType])

  const fieldErrors = (state && !state.success && state.errors && !('_' in state.errors)) ? state.errors : null

  if (state?.success && state.data) {
    const { name, classType: ct, date, price: p, bookingType: bt } = state.data
    const label = CLASS_INFO[ct as ClassType]?.label
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
              Your request has been received. We&apos;ll reach out via phone or email to confirm your spot as soon as possible.
            </p>
          </div>
        </div>
        <button
          className="btn-join"
          onClick={() => window.location.reload()}
        >
          Book another class
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Class selector */}
      <div style={{ marginBottom: 36 }}>
        <p className="mk-eyebrow" style={{ marginBottom: 14 }}>Choose class</p>
        <div style={{ display: 'flex', gap: 1, background: 'var(--border)' }}>
          {(Object.entries(CLASS_INFO) as [ClassType, typeof CLASS_INFO[ClassType]][]).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => setClassType(key)}
              style={{
                flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase',
                background: classType === key ? 'var(--dark)' : 'var(--cream)',
                color: classType === key ? '#fff' : 'var(--mid)',
                transition: 'all 0.2s',
              }}
            >
              {val.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--mid)', marginTop: 10 }}>
          {info.dayName} · {TIME_MAP[classType]}
        </p>
      </div>

      <form action={action}>
        <input type="hidden" name="classType" value={classType} />
        <input type="hidden" name="bookingType" value={bookingType} />
        <input type="hidden" name="date" value={selectedDate} />

        {/* Booking type */}
        <div style={{ marginBottom: 32 }}>
          <p className="mk-eyebrow" style={{ marginBottom: 14 }}>Booking type</p>
          <div style={{ display: 'flex', gap: 1, background: 'var(--border)' }}>
            <TypeBtn active={bookingType === 'dropin'} onClick={() => setBookingType('dropin')} label="Drop-in" price={`$${info.dropin}`} />
            {info.monthly && (
              <TypeBtn active={bookingType === 'monthly'} onClick={() => setBookingType('monthly')} label="Monthly pass" price={`$${info.monthly} / 4 classes`} />
            )}
          </div>
        </div>

        {/* Date selector */}
        <div style={{ marginBottom: 32 }}>
          <p className="mk-eyebrow" style={{ marginBottom: 6 }}>
            {bookingType === 'monthly' ? 'Start date' : 'Select date'}
          </p>
          {bookingType === 'monthly' && (
            <p style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 14 }}>
              Pick the first class — the next 4 sessions will be shown automatically
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)' }}>
            {dates.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: '14px 8px', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12, textAlign: 'center',
                  background: selectedDate === d ? 'var(--pink)' : 'var(--cream)',
                  color: selectedDate === d ? '#fff' : 'var(--dark)',
                  transition: 'all 0.2s',
                }}
              >
                {formatDate(d)}
              </button>
            ))}
          </div>

          {/* Monthly: show 4 included classes */}
          {bookingType === 'monthly' && selectedDate && (
            <div style={{ marginTop: 1, background: 'var(--border)', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {getMonthlyDates(selectedDate).map((d, i) => (
                <div key={d} style={{
                  background: '#F0EBE4', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '12px 16px',
                }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mid)' }}>
                    Class {i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--dark)', fontWeight: 500 }}>
                    {formatDate(d)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {fieldErrors?.date && (
            <p style={{ fontSize: 12, color: 'var(--pink)', marginTop: 6 }}>{fieldErrors.date[0]}</p>
          )}
        </div>

        {/* Your info */}
        <div style={{ marginBottom: 32 }}>
          <p className="mk-eyebrow" style={{ marginBottom: 14 }}>Your info</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
            <Field name="name" placeholder="Full name" error={fieldErrors?.name?.[0]} />
            <PhoneField error={fieldErrors?.phone?.[0]} />
            <Field name="email" placeholder="Email (optional)" type="email" error={fieldErrors?.email?.[0]} />
          </div>
        </div>

        {/* Price + submit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--mid)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 40, fontStyle: 'italic', fontWeight: 300, color: 'var(--dark)', lineHeight: 1 }}>
              ${price}
            </p>
          </div>
          <button
            type="submit"
            disabled={pending || !selectedDate}
            style={{
              background: (!selectedDate || pending) ? '#C8C0B8' : '#E8167A',
              color: '#fff',
              fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '16px 44px', border: 'none', cursor: selectedDate ? 'pointer' : 'not-allowed',
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

function Field({ name, placeholder, type = 'text', error }: {
  name: string; placeholder: string; type?: string; error?: string
}) {
  return (
    <div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '16px 20px', border: 'none', outline: 'none',
          fontFamily: 'inherit', fontSize: 14, color: 'var(--dark)',
          background: 'var(--cream)', transition: 'box-shadow 0.2s',
        }}
        onFocus={e => e.target.style.boxShadow = 'inset 0 -2px 0 var(--pink)'}
        onBlur={e => e.target.style.boxShadow = 'none'}
      />
      {error && <p style={{ fontSize: 11, color: 'var(--pink)', padding: '4px 20px 8px', background: 'var(--cream)' }}>{error}</p>}
    </div>
  )
}

function TypeBtn({ active, onClick, label, price }: {
  active: boolean; onClick: () => void; label: string; price: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: '18px 16px', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
        background: active ? 'var(--dark)' : 'var(--cream)',
        color: active ? '#fff' : 'var(--dark)',
        transition: 'all 0.2s',
      }}
    >
      <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 20, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', color: active ? '#fff' : 'var(--pink)' }}>{price}</p>
    </button>
  )
}

function PhoneField({ error }: { error?: string }) {
  const [display, setDisplay] = useState('')
  const [raw, setRaw] = useState('')
  const [touched, setTouched] = useState(false)

  const isValid = raw.length === 10
  const isEmpty = raw.length === 0
  const showError = touched && !isEmpty && !isValid
  const showOk   = touched && isValid

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

  const borderColor = showError ? 'var(--pink)' : showOk ? '#22c55e' : 'var(--pink)'

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input
          type="tel"
          placeholder="+1 (___) ___-____"
          value={display}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          style={{
            width: '100%', padding: '16px 48px 16px 20px', border: 'none', outline: 'none',
            fontFamily: 'inherit', fontSize: 14, color: 'var(--dark)',
            background: 'var(--cream)', transition: 'box-shadow 0.2s',
            boxSizing: 'border-box',
            boxShadow: touched ? `inset 0 -2px 0 ${borderColor}` : 'none',
          }}
          onFocus={e => { e.target.style.boxShadow = `inset 0 -2px 0 ${borderColor}` }}
        />
        {showOk && (
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: 18, lineHeight: 1 }}>✓</span>
        )}
        {showError && (
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--pink)', fontSize: 18, lineHeight: 1 }}>✕</span>
        )}
      </div>
      <input type="hidden" name="phone" value={raw ? `+1 ${display}` : ''} />
      {showError && (
        <p style={{ fontSize: 11, color: 'var(--pink)', padding: '4px 20px 8px', background: 'var(--cream)' }}>
          Enter a 10-digit US phone number
        </p>
      )}
      {error && !showError && (
        <p style={{ fontSize: 11, color: 'var(--pink)', padding: '4px 20px 8px', background: 'var(--cream)' }}>{error}</p>
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
