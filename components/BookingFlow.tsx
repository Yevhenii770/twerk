'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ClassSession } from '@/db/schema'
import { CLASS_STATIC, CLASS_IDS, ID_TO_SLUG, MONTHLY_PASS_SESSION_COUNT, nextBookableSessions, type ClassId } from '@/lib/classes'
import { createPaidBooking, createPaidMonthlyBooking } from '@/app/actions/checkout'
import { squareWebPaymentsSdkUrl, squareApplicationId, squareLocationIdPublic } from '@/lib/square-client'
import { track } from '@/lib/analytics'
import { classAddress } from '@/lib/studio'
import { purchaseEventId } from '@/lib/metaEventId'
import ContactForm from '@/components/ContactForm'
import { TRUST_LINE } from '@/lib/nextFormat'

type Step = 'class' | 'session' | 'details' | 'payment'
type BookingKind = 'dropin' | 'monthly'

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SquarePayments>
    }
  }
}

interface SquarePayments {
  card: () => Promise<SquareCard>
  paymentRequest: (req: { countryCode: string; currencyCode: string; total: { amount: string; label: string } }) => unknown
  applePay: (req: unknown) => Promise<SquareWallet>
  googlePay: (req: unknown) => Promise<SquareWallet>
}
interface SquareWallet {
  attach?: (selector: string, opts?: Record<string, unknown>) => Promise<void>
  tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>
  destroy?: () => Promise<void>
}
interface SquareCard {
  attach: (selector: string) => Promise<void>
  tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>
  destroy: () => Promise<void>
}

export default function BookingFlow({ sessionsByClass, monthlyPrices, dropinPrices, addresses }: {
  sessionsByClass: Record<string, ClassSession[]>
  monthlyPrices: Record<ClassId, number | null>
  dropinPrices: Record<ClassId, number>
  /** Hall address per class — Twerk and Heels are in different studios. */
  addresses: Record<ClassId, string>
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paramSession = searchParams.get('session')
  // ?session=<id> (from "Next class → Book" links) or ?session=next (Instagram bio link): land
  // straight on the details form with that date chosen. Falls back silently if it's gone/full.
  const presetSession = useMemo(() => {
    if (!paramSession) return null
    const bookable = Object.values(sessionsByClass).flat()
      .filter(s => !s.cancelled && s.bookingOpen && s.booked < s.capacity)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    const wantClass = searchParams.get('class')
    if (paramSession === 'next') return bookable.find(s => !wantClass || s.classType === wantClass) ?? null
    return bookable.find(s => String(s.id) === paramSession) ?? null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const paramClass = (presetSession?.classType ?? searchParams.get('class')) as ClassId | null
  const hasPresetClass = Boolean(paramClass && CLASS_IDS.includes(paramClass))

  const [classType, setClassType] = useState<ClassId>(hasPresetClass ? (paramClass as ClassId) : 'twerk')
  const [bookingKind, setBookingKind] = useState<BookingKind>('dropin')
  const [step, setStep] = useState<Step>(presetSession ? 'details' : hasPresetClass ? 'session' : 'class')
  const [sessionId, setSessionId] = useState<number | null>(presetSession?.id ?? null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [notes, setNotes] = useState('')
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [showContactHelp, setShowContactHelp] = useState(false)

  const cardRef = useRef<SquareCard | null>(null)
  const walletsRef = useRef<{ applePay?: SquareWallet; googlePay?: SquareWallet }>({})
  // Invisible Cloudflare bot check on the payment step (anti card-testing). Real visitors almost
  // never see it; if it can't load (ad blocker), payment still works with stricter server limits.
  const turnstileToken = useRef('')
  const turnstileId = useRef<string | null>(null)
  const [wallets, setWallets] = useState<{ applePay?: boolean; googlePay?: boolean }>({})
  const [cardReady, setCardReady] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [sdkErrorRecoverable, setSdkErrorRecoverable] = useState(true)
  const [sdkRetryToken, setSdkRetryToken] = useState(0)

  const sessions = useMemo(() => sessionsByClass[classType] ?? [], [sessionsByClass, classType])
  const session = sessions.find(s => s.id === sessionId) ?? null
  const staticInfo = CLASS_STATIC[classType]
  const isMonthly = bookingKind === 'monthly'
  const monthlySessions = useMemo(() => nextBookableSessions(sessions, MONTHLY_PASS_SESSION_COUNT), [sessions])
  const monthlyPrice = monthlyPrices[classType]
  const monthlyAvailable = monthlyPrice != null && monthlySessions.length === MONTHLY_PASS_SESSION_COUNT

  // Returning visitors: prefill name / email / phone from this browser (never required).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bl_contact') || 'null')
      if (saved && typeof saved === 'object') {
        if (saved.firstName) setFirstName(saved.firstName)
        if (saved.lastName) setLastName(saved.lastName)
        if (saved.email) setEmail(saved.email)
        if (saved.phone) handlePhoneChange(saved.phone)
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    track('view_booking', { class_slug: hasPresetClass ? ID_TO_SLUG[paramClass as ClassId] : undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Monthly Pass has no per-date step — keep `step` in sync when the kind toggle changes.
  useEffect(() => {
    if (isMonthly && step === 'session') setStep('details')
    if (!isMonthly && step === 'details' && !sessionId) setStep('session')
  }, [isMonthly, step, sessionId])

  useEffect(() => {
    if (step !== 'payment') return
    const appId = squareApplicationId()
    const locationId = squareLocationIdPublic()
    if (!appId || !locationId) {
      setSdkError('Payments are not configured yet on this site. Please contact us to book directly.')
      setSdkErrorRecoverable(false)
      return
    }

    let cancelled = false
    const scriptId = 'square-web-payments-sdk'
    const init = async () => {
      if (!window.Square) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.getElementById(scriptId)
          if (existing) { existing.addEventListener('load', () => resolve()); return }
          const script = document.createElement('script')
          script.id = scriptId
          script.src = squareWebPaymentsSdkUrl()
          script.onload = () => resolve()
          // Remove the failed tag so a retry (bumping sdkRetryToken) creates a fresh
          // script instead of finding this one and waiting on a 'load' that will never fire.
          script.onerror = () => { script.remove(); reject(new Error('Failed to load payment form')) }
          document.body.appendChild(script)
        })
      }
      if (cancelled || !window.Square) return
      const payments = await window.Square.payments(appId, locationId)
      const card = await payments.card()
      await card.attach('#sq-card-container')
      if (cancelled) { card.destroy(); return }
      cardRef.current = card
      setCardReady(true)

      // Apple Pay / Google Pay — shown only where the device + domain support them.
      const amount = (isMonthly ? monthlyPrice ?? 0 : session?.price ?? 0).toFixed(2)
      const req = payments.paymentRequest({ countryCode: 'US', currencyCode: 'USD', total: { amount, label: 'bounce lab' } })
      try {
        const gp = await payments.googlePay(req)
        await gp.attach?.('#sq-gpay', { buttonColor: 'black', buttonType: 'long', buttonSizeMode: 'fill' })
        if (cancelled) { gp.destroy?.(); return }
        walletsRef.current.googlePay = gp
        setWallets(w => ({ ...w, googlePay: true }))
      } catch (e) { console.info('[booking] Google Pay unavailable:', e instanceof Error ? e.message : e) }
      try {
        const ap = await payments.applePay(req)
        if (cancelled) return
        walletsRef.current.applePay = ap
        setWallets(w => ({ ...w, applePay: true }))
      } catch (e) { console.info('[booking] Apple Pay unavailable:', e instanceof Error ? e.message : e) }
    }

    init().catch((err) => {
      setSdkErrorRecoverable(true)
      setSdkError(err instanceof Error ? err.message : 'Failed to load payment form')
    })

    return () => {
      cancelled = true
      cardRef.current?.destroy().catch(() => {})
      cardRef.current = null
      walletsRef.current.googlePay?.destroy?.().catch(() => {})
      walletsRef.current = {}
      setWallets({})
      setCardReady(false)
    }
  }, [step, sdkRetryToken])

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (step !== 'payment' || !siteKey) return
    let cancelled = false
    const mount = () => {
      const el = document.getElementById('bkf-turnstile')
      if (cancelled || !el || !window.turnstile || turnstileId.current) return
      turnstileId.current = window.turnstile.render(el, {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: (t: string) => { turnstileToken.current = t },
        'expired-callback': () => { turnstileToken.current = '' },
        'error-callback': () => { turnstileToken.current = '' },
      })
    }
    if (window.turnstile) mount()
    else if (!document.getElementById('cf-turnstile-script')) {
      const sc = document.createElement('script')
      sc.id = 'cf-turnstile-script'
      sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      sc.async = true
      sc.onload = mount
      document.body.appendChild(sc)
    } else document.getElementById('cf-turnstile-script')!.addEventListener('load', mount)
    return () => {
      cancelled = true
      if (turnstileId.current) { try { window.turnstile?.remove(turnstileId.current) } catch {} }
      turnstileId.current = null
      turnstileToken.current = ''
    }
  }, [step])

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    let formatted = ''
    if (digits.length === 0) formatted = ''
    else if (digits.length <= 3) formatted = `(${digits}`
    else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    setPhoneDisplay(formatted)
  }

  const validateDetails = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) { setDetailsError('Please enter your first and last name'); return false }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setDetailsError('Please enter a valid email'); return false }
    if (phone.length !== 10) { setDetailsError('Please enter a valid phone number'); return false }
    setDetailsError(null)
    try { localStorage.setItem('bl_contact', JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone })) } catch {}
    return true
  }

  const handlePay = async (method: { tokenize: SquareCard['tokenize'] } | null = cardRef.current) => {
    if (!method) return
    if (isMonthly ? !monthlyAvailable : !session) return
    setPaymentError(null)
    setShowContactHelp(false)
    setPaying(true)
    try {
      const tokenResult = await method.tokenize()
      if (tokenResult.status !== 'OK' || !tokenResult.token) {
        setPaymentError(tokenResult.errors?.[0]?.message || 'Card details are invalid. Please check and try again.')
        setPaying(false)
        return
      }

      track('begin_checkout', { class_slug: ID_TO_SLUG[classType] })

      // Square ties the idempotency key to the exact request, including the source token —
      // reusing it for a retry (a new tokenize() call always produces a new token) gets
      // rejected with IDEMPOTENCY_KEY_REUSED instead of actually processing the retry. Each
      // distinct payment attempt needs its own key.
      const result = isMonthly
        ? await createPaidMonthlyBooking({
            classType,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: `+1 ${phoneDisplay}`,
            notes: notes.trim() || undefined,
            sourceId: tokenResult.token,
            idempotencyKey: crypto.randomUUID(),
            turnstileToken: turnstileToken.current || undefined,
          })
        : await createPaidBooking({
            sessionId: session!.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: `+1 ${phoneDisplay}`,
            notes: notes.trim() || undefined,
            sourceId: tokenResult.token,
            idempotencyKey: crypto.randomUUID(),
            turnstileToken: turnstileToken.current || undefined,
          })

      if (!result.success) {
        setPaymentError(result.error)
        setPaying(false)
        // Turnstile tokens are single-use: get a fresh one for the next attempt.
        turnstileToken.current = ''
        if (turnstileId.current) { try { window.turnstile?.reset(turnstileId.current) } catch {} }
        return
      }

      track('payment_success', {
        class_slug: ID_TO_SLUG[classType],
        value: isMonthly ? monthlyPrice ?? undefined : session!.price,
        currency: 'USD',
        event_id: purchaseEventId(result.bookingId),
      })
      router.push(`/manage-booking/${result.managementToken}?fresh=1`)
    } catch {
      setPaymentError('Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Stepper step={step} />

      {(step === 'class' || step === 'session') && isMonthly && (
        <TicketSwitch
          bookingKind={bookingKind}
          onChange={setBookingKind}
          dropinPrice={dropinPrices[classType]}
          monthlyPrice={monthlyPrices[classType]}
        />
      )}

      {step === 'class' && (
        <Section step={1} title="Choose a class">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CLASS_IDS.map(key => {
              const info = CLASS_STATIC[key]
              const upcoming = sessionsByClass[key]?.filter(s => !s.cancelled) ?? []
              const next = upcoming[0]
              const keyMonthlyPicks = nextBookableSessions(sessionsByClass[key] ?? [], MONTHLY_PASS_SESSION_COUNT)
              const keyMonthlyPrice = monthlyPrices[key]
              const keyMonthlyAvailable = keyMonthlyPrice != null && keyMonthlyPicks.length === MONTHLY_PASS_SESSION_COUNT
              const disabled = isMonthly && !keyMonthlyAvailable
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => { setClassType(key); setSessionId(null); setStep(isMonthly ? 'details' : 'session'); track('select_class', { class_slug: ID_TO_SLUG[key] }) }}
                  style={{ ...cardBtnStyle(false), opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 3, color: 'var(--dark)' }}>{info.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--mid)' }}>{info.level} · {next ? `${fmtDate(next.date)}, ${fmtTime(next.startTime)}` : 'No upcoming sessions'}</p>
                    <p style={{ fontSize: 12, color: 'var(--mid)', marginTop: 4 }}>
                      {isMonthly
                        ? (keyMonthlyAvailable ? `${MONTHLY_PASS_SESSION_COUNT} classes, all booked today` : 'Monthly Pass not available right now')
                        : info.desc}
                    </p>
                  </div>
                  <span style={{ fontSize: 18, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, color: 'var(--pink)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    ${isMonthly ? keyMonthlyPrice : dropinPrices[key]}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {step !== 'class' && (
        <Section step={1} title="Your class">
          <div style={cardBtnStyle(true) as React.CSSProperties}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 3, color: '#fff' }}>{staticInfo.label}{isMonthly ? ' — Monthly Pass' : ''}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{staticInfo.level}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>📍 {addresses[classType] ?? classAddress(classType)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 20, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, color: '#fff', marginBottom: 4 }}>${isMonthly ? monthlyPrice : dropinPrices[classType]}</p>
              {(step === 'session' || (step === 'details' && isMonthly)) && (
                <button type="button" onClick={() => setStep('class')} style={linkBtnStyle}>Change class</button>
              )}
            </div>
          </div>
        </Section>
      )}

      {step === 'session' && !isMonthly && (
        <Section step={2} title="Choose date & time">
          {sessions.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--mid)' }}>No upcoming sessions scheduled yet — please check back soon or contact us.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map(s => {
              const remaining = Math.max(0, s.capacity - s.booked)
              const soldOut = s.cancelled || !s.bookingOpen || remaining <= 0
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={soldOut}
                  onClick={() => { setSessionId(s.id); setStep('details'); track('select_class', { class_slug: ID_TO_SLUG[classType], date: s.date }) }}
                  style={{
                    ...cardBtnStyle(false),
                    opacity: soldOut ? 0.5 : 1,
                    cursor: soldOut ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', marginBottom: 3 }}>{fmtDate(s.date)}</p>
                    <p style={{ fontSize: 12, color: 'var(--mid)' }}>{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: soldOut ? '#999' : remaining <= 3 ? 'var(--pink)' : 'var(--mid)' }}>
                    {soldOut ? 'Sold Out' : `${remaining} spot${remaining === 1 ? '' : 's'} left`}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>
      )}

      {(step === 'details' || step === 'payment') && !isMonthly && session && (
        <Section step={2} title="Date & time">
          <div style={cardBtnStyle(true) as React.CSSProperties}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{fmtDate(session.date)}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{fmtTime(session.startTime)} – {fmtTime(session.endTime)}</p>
            </div>
            {step === 'details' && (
              <button type="button" onClick={() => setStep('session')} style={linkBtnStyle}>Change</button>
            )}
          </div>
        </Section>
      )}

      {(step === 'details' || step === 'payment') && isMonthly && (
        <Section step={2} title={`Your ${MONTHLY_PASS_SESSION_COUNT} classes`}>
          {monthlyAvailable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {monthlySessions.map(s => (
                <div key={s.id} style={cardBtnStyle(true) as React.CSSProperties}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{fmtDate(s.date)}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--pink)' }}>Monthly Pass isn&apos;t available for this class right now — please choose Drop-in or contact us.</p>
          )}
        </Section>
      )}

      {!isMonthly && (step === 'class' || step === 'session' || step === 'details') && (
        <MonthlyUpsell price={monthlyPrices[classType]} dropin={dropinPrices[classType]} onSwitch={() => setBookingKind('monthly')} />
      )}

      {step === 'details' && (
        <Section step={3} title="Your details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <InputField label="First name" value={firstName} onChange={setFirstName} placeholder="Jane" />
              <InputField label="Last name" value={lastName} onChange={setLastName} placeholder="Doe" />
            </div>
            <InputField label="Email" value={email} onChange={setEmail} placeholder="jane@email.com" type="email" />
            <div>
              <label style={labelStyle}>Phone number</label>
              <input type="tel" placeholder="(555) 123-4567" value={phoneDisplay} onChange={e => handlePhoneChange(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything we should know?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {detailsError && <p style={{ fontSize: 12, color: 'var(--pink)' }}>{detailsError}</p>}
            <button
              type="button"
              onClick={() => { if (validateDetails()) { setStep('payment'); track('begin_checkout', { class_slug: ID_TO_SLUG[classType] }) } }}
              disabled={isMonthly && !monthlyAvailable}
              style={primaryBtnStyle}
            >
              Continue to Payment
            </button>
          </div>
        </Section>
      )}

      {step === 'payment' && (isMonthly ? monthlyAvailable : Boolean(session)) && (
        <>
          <Section step={4} title="Order summary">
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '20px 24px' }}>
              <SummaryRow label="Class" value={`${staticInfo.label}${isMonthly ? ' Monthly Pass' : ''}`} />
              {isMonthly ? (
                monthlySessions.map(s => (
                  <SummaryRow key={s.id} label={fmtDate(s.date)} value={`${fmtTime(s.startTime)} – ${fmtTime(s.endTime)}`} />
                ))
              ) : (
                <>
                  <SummaryRow label="Date" value={fmtDate(session!.date)} />
                  <SummaryRow label="Time" value={`${fmtTime(session!.startTime)} – ${fmtTime(session!.endTime)}`} />
                </>
              )}
              <SummaryRow label="Location" value={addresses[classType] ?? classAddress(classType)} />
              <SummaryRow label="Name" value={`${firstName} ${lastName}`} />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>Total</span>
                <span style={{ fontSize: 22, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, color: 'var(--dark)' }}>${isMonthly ? monthlyPrice : session!.price}</span>
              </div>
            </div>
          </Section>

          <Section step={5} title="Payment">
            {sdkError ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--pink)', marginBottom: 12 }}>{sdkError}</p>
                {sdkErrorRecoverable && (
                  <button
                    type="button"
                    onClick={() => { setSdkError(null); setSdkRetryToken(t => t + 1) }}
                    style={primaryBtnStyle}
                  >
                    Try again
                  </button>
                )}
              </>
            ) : (
              <>
                {wallets.applePay && (
                  <button type="button" aria-label="Pay with Apple Pay" disabled={paying} className="bkf-applepay"
                    onClick={() => handlePay(walletsRef.current.applePay ?? null)} />
                )}
                <div id="sq-gpay" onClick={() => { if (!paying && walletsRef.current.googlePay) handlePay(walletsRef.current.googlePay) }}
                  style={{ marginBottom: wallets.googlePay ? 10 : 0, minHeight: wallets.googlePay ? 48 : 0 }} />
                {(wallets.applePay || wallets.googlePay) && (
                  <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)', margin: '6px 0 12px' }}>or pay with card</p>
                )}
                <div id="bkf-turnstile" style={{ display: 'flex', justifyContent: 'center' }} />
                <div id="sq-card-container" style={{ marginBottom: 12, minHeight: 90, border: '1px solid var(--border)', padding: cardReady ? 0 : '16px' }}>
                  {!cardReady && <p style={{ fontSize: 12, color: 'var(--mid)' }}>Loading secure payment form…</p>}
                </div>
                {paymentError && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: 'var(--pink)', marginBottom: 8 }}>{paymentError}</p>
                    {!showContactHelp && (
                      <button type="button" onClick={() => setShowContactHelp(true)} style={linkBtnStyle}>
                        Trouble paying? Contact us →
                      </button>
                    )}
                  </div>
                )}
                <p style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 16, lineHeight: 1.6 }}>
                  Your card is processed securely by Square. We never see or store your card number.
                  Your spot is only confirmed once payment succeeds.
                </p>
                <button type="button" onClick={() => handlePay()} disabled={!cardReady || paying} style={primaryBtnStyle}>
                  {paying ? 'Processing…' : `Pay $${isMonthly ? monthlyPrice : session!.price}`}
                </button>
                <p className="mk-trust" style={{ textAlign: 'center' }}>{TRUST_LINE}</p>
                {showContactHelp && (
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)', marginBottom: 12 }}>
                      Let us know and we&apos;ll help you get booked in.
                    </p>
                    <ContactForm
                      prefill={{
                        name: `${firstName} ${lastName}`.trim(),
                        email,
                        phone: phoneDisplay,
                        inquiryType: 'problem',
                        message: `Trouble paying for ${staticInfo.label}${isMonthly ? ' Monthly Pass' : ''}${!isMonthly && session ? ` on ${fmtDate(session.date)}` : ''}. Error shown: "${paymentError}"`,
                      }}
                    />
                  </div>
                )}
              </>
            )}
            <button type="button" onClick={() => setStep('details')} style={{ ...linkBtnStyle, display: 'block', marginTop: 12, color: 'var(--mid)' }}>
              ← Back to details
            </button>
          </Section>
        </>
      )}
    </div>
  )
}

/**
 * Two boarding-pass-style tickets side by side — always fully sized and fully tappable (an
 * earlier overlapping "fanned" version looked nicer but hid most of the inactive ticket behind
 * the active one, so it couldn't reliably be tapped — a real usability bug, not just cosmetic).
 * Selection uses the same flat dark-fill flip as every other choice on this page (see
 * cardBtnStyle below) rather than a shadow/lift, so the ticket motif — the dashed tear-line,
 * punch-hole notches, and the dot-count stub — reads as native to the site instead of a
 * separate visual system. The stub carries real content: how many classes this option is worth
 * and what each costs — the 1-vs-MONTHLY_PASS_SESSION_COUNT dot count is data, not decoration.
 */
function TicketSwitch({ bookingKind, onChange, dropinPrice, monthlyPrice }: {
  bookingKind: BookingKind
  onChange: (kind: BookingKind) => void
  dropinPrice: number
  monthlyPrice: number | null
}) {
  const isMonthly = bookingKind === 'monthly'
  const perClass = monthlyPrice != null ? Math.round(monthlyPrice / MONTHLY_PASS_SESSION_COUNT) : null
  const savings = monthlyPrice != null ? dropinPrice * MONTHLY_PASS_SESSION_COUNT - monthlyPrice : 0

  return (
    <div className="bkf-switch" role="radiogroup" aria-label="Choose booking type">
      <button
        type="button"
        className={`bkf-ticket${!isMonthly ? ' is-active' : ''}`}
        role="radio"
        aria-checked={!isMonthly}
        onClick={() => onChange('dropin')}
      >
        <span className="bkf-ticket-main">
          <span className="bkf-ticket-eyebrow">Admit One</span>
          <span className="bkf-ticket-name">Drop-in</span>
          <span className="bkf-ticket-price">${dropinPrice}</span>
        </span>
        <span className="bkf-ticket-stub">
          <span className="bkf-ticket-dots"><span className="bkf-dot bkf-dot--filled" /></span>
          <span className="bkf-ticket-stub-label">1 class</span>
        </span>
      </button>

      <button
        type="button"
        className={`bkf-ticket${isMonthly ? ' is-active' : ''}`}
        role="radio"
        aria-checked={isMonthly}
        onClick={() => onChange('monthly')}
      >
        {savings > 0 && <span className="bkf-ticket-badge">Save ${savings}</span>}
        <span className="bkf-ticket-main">
          <span className="bkf-ticket-eyebrow">Season Pass</span>
          <span className="bkf-ticket-name">Monthly</span>
          <span className="bkf-ticket-price">{monthlyPrice != null ? `$${monthlyPrice}` : '—'}</span>
        </span>
        <span className="bkf-ticket-stub">
          <span className="bkf-ticket-dots">
            {Array.from({ length: MONTHLY_PASS_SESSION_COUNT }).map((_, i) => (
              <span key={i} className="bkf-dot bkf-dot--filled" />
            ))}
          </span>
          <span className="bkf-ticket-stub-label">
            {MONTHLY_PASS_SESSION_COUNT} classes{perClass != null ? ` · $${perClass} ea` : ''}
          </span>
        </span>
      </button>

      <style>{`
        .bkf-switch{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:28px;}
        .bkf-ticket{
          position:relative;padding:16px 15px 14px;text-align:left;
          background:#fff;border:1.5px solid var(--border);cursor:pointer;font-family:inherit;
          display:flex;flex-direction:column;gap:10px;
          transition:background .25s ease, border-color .25s ease;
        }
        .bkf-ticket.is-active{background:var(--card);border-color:var(--pink);}
        .bkf-ticket-main{display:flex;flex-direction:column;gap:4px;}
        .bkf-ticket-eyebrow{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--pink);}
        .bkf-ticket-name{font-family:var(--font-cormorant);font-style:italic;font-weight:600;font-size:19px;color:var(--dark);}
        .bkf-ticket-price{font-family:var(--font-cormorant);font-style:italic;font-weight:600;font-size:24px;color:var(--dark);}
        .bkf-ticket-stub{
          position:relative;border-top:2px dashed var(--border);padding-top:9px;margin-top:1px;
          display:flex;align-items:center;justify-content:space-between;gap:8px;
        }
        .bkf-ticket-stub::before,.bkf-ticket-stub::after{
          content:"";position:absolute;top:-8px;width:13px;height:13px;border-radius:50%;background:var(--cream);
        }
        .bkf-ticket-stub::before{left:-9px;}
        .bkf-ticket-stub::after{right:-9px;}
        .bkf-ticket-dots{display:flex;flex-wrap:nowrap;gap:3px;}
        .bkf-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
        .bkf-dot--filled{background:var(--pink);}
        .bkf-ticket-stub-label{font-size:10px;color:var(--mid);text-align:right;line-height:1.3;}
        .bkf-ticket-badge{
          position:absolute;top:-9px;right:10px;background:var(--pink);color:#fff;font-size:10px;
          font-weight:700;letter-spacing:.03em;text-transform:uppercase;padding:3px 8px;
        }
        .bkf-ticket:focus-visible{outline:2px solid var(--pink);outline-offset:3px;}
        @media (max-width: 380px){
          .bkf-ticket-name{font-size:17px;}
          .bkf-ticket-price{font-size:21px;}
          .bkf-ticket-stub-label{font-size:8.5px;}
        }
        @media (prefers-reduced-motion: reduce){
          .bkf-ticket, .bkf-ticket-name, .bkf-ticket-price, .bkf-ticket-stub, .bkf-ticket-stub-label{transition-duration:.01ms !important;}
        }
      `}</style>
    </div>
  )
}

function MonthlyUpsell({ price, dropin, onSwitch }: { price: number | null; dropin: number; onSwitch: () => void }) {
  if (price == null) return null
  const save = dropin * MONTHLY_PASS_SESSION_COUNT - price
  return (
    <button type="button" onClick={onSwitch} className="bkf-upsell">
      <span>Coming every week? <strong>Monthly Pass</strong> — {MONTHLY_PASS_SESSION_COUNT} classes for ${price}{save > 0 ? ` (save $${save})` : ''}</span>
      <span aria-hidden="true">→</span>
      <style>{`
        .bkf-upsell{display:flex;justify-content:space-between;align-items:center;gap:12px;width:100%;min-height:48px;margin:0 0 28px;padding:12px 16px;
          background:transparent;border:1px dashed var(--border);color:var(--mid);font-family:inherit;font-size:12px;text-align:left;cursor:pointer;transition:border-color .2s,color .2s;}
        .bkf-upsell strong{color:var(--dark);}
        .bkf-upsell:hover{border-color:var(--pink);color:var(--dark);}
        .bkf-upsell:focus-visible{outline:2px solid var(--pink);outline-offset:2px;}
        .bkf-applepay{display:block;width:100%;height:48px;margin-bottom:10px;border:0;border-radius:4px;cursor:pointer;background:#000;}
        @supports (-webkit-appearance: -apple-pay-button){
          .bkf-applepay{-webkit-appearance:-apple-pay-button;-apple-pay-button-type:plain;-apple-pay-button-style:black;}
        }
      `}</style>
    </button>
  )
}

function Stepper({ step }: { step: Step }) {
  const labels: Step[] = ['class', 'session', 'details', 'payment']
  const idx = labels.indexOf(step)
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
      {labels.map((l, i) => (
        <div key={l} style={{ flex: 1, height: 3, background: i <= idx ? 'var(--pink)' : 'var(--border)', transition: 'background 0.2s' }} />
      ))}
    </div>
  )
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', background: 'var(--dark)', borderRadius: '50%', flexShrink: 0 }}>
          {step}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', letterSpacing: '0.02em' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--dark)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--mid)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }
// 16px avoids iOS Safari's auto-zoom-on-focus behavior for inputs below that size.
const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 16px', border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit', fontSize: 16, color: 'var(--dark)', background: '#fff', boxSizing: 'border-box' }
const linkBtnStyle: React.CSSProperties = { fontSize: 11, color: 'var(--pink)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }
const primaryBtnStyle: React.CSSProperties = { width: '100%', background: 'var(--pink)', color: '#fff', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, padding: '18px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }

function cardBtnStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', border: active ? '2px solid var(--dark)' : '1px solid var(--border)',
    fontFamily: 'inherit', textAlign: 'left', width: '100%',
    background: active ? 'var(--dark)' : '#fff', color: active ? '#fff' : 'var(--dark)',
  }
}
