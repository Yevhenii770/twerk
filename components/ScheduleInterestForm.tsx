'use client'

import { useActionState, useState } from 'react'
import { submitScheduleInterest } from '@/app/actions/scheduleInterest'
import { track } from '@/lib/analytics'
import type { ClassId } from '@/lib/classes'

export default function ScheduleInterestForm({ classId, className }: { classId: ClassId; className: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(submitScheduleInterest, null)

  const handleOpen = () => {
    track('schedule_interest_opened', { class_slug: classId })
    setOpen(true)
  }

  const fieldErrors = (state && !state.success && state.errors && !('_' in state.errors)) ? state.errors : null
  const generalError = (state && !state.success && state.errors && '_' in state.errors) ? state.errors._[0] : null

  if (state?.success) {
    return (
      <div className="cls-notify">
        <p className="cls-notify-title">You&apos;re on the list</p>
        <p className="cls-notify-sub">We&apos;ll let you know if additional times become available.</p>
      </div>
    )
  }

  return (
    <div className="cls-notify">
      <p className="cls-notify-title">Can&apos;t make this time?</p>
      <p className="cls-notify-sub">
        Join the list and we&apos;ll let you know when new {className} times open. This doesn&apos;t guarantee a new time will be added.
      </p>
      {!open ? (
        <button type="button" className="cls-notify-btn" onClick={handleOpen}>
          Notify Me About New Times
        </button>
      ) : (
        <form
          action={action}
          onSubmit={() => track('schedule_interest_submitted', { class_slug: classId })}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input type="hidden" name="classType" value={classId} />
          {/* Honeypot — real visitors never fill this hidden field */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
          />
          <div>
            <label className="cls-notify-label" htmlFor={`interest-name-${classId}`}>Name (optional)</label>
            <input id={`interest-name-${classId}`} name="name" type="text" className="cls-notify-field" placeholder="Jane" />
          </div>
          <div>
            <label className="cls-notify-label" htmlFor={`interest-email-${classId}`}>Email</label>
            <input id={`interest-email-${classId}`} name="email" type="email" className="cls-notify-field" placeholder="jane@email.com" />
          </div>
          <div>
            <label className="cls-notify-label" htmlFor={`interest-phone-${classId}`}>Or phone</label>
            <input id={`interest-phone-${classId}`} name="phone" type="tel" className="cls-notify-field" placeholder="(555) 123-4567" />
          </div>
          {(fieldErrors?.email?.[0] || fieldErrors?.phone?.[0] || generalError) && (
            <p style={{ fontSize: 11, color: 'var(--pink)' }}>
              {fieldErrors?.email?.[0] || fieldErrors?.phone?.[0] || generalError}
            </p>
          )}
          <button type="submit" disabled={pending} className="cls-notify-btn">
            {pending ? 'Submitting...' : 'Notify Me About New Times'}
          </button>
        </form>
      )}
    </div>
  )
}
