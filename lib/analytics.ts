export type AnalyticsParams = Record<string, string | number | undefined>

type WindowWithAnalytics = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  fbq?: (...args: unknown[]) => void
}

/** Funnel events mirrored to Meta Pixel standard events, so ads can optimize on bookings. */
const META_EVENTS: Record<string, string> = {
  class_page_view: 'ViewContent',
  view_booking: 'InitiateCheckout',
  begin_checkout: 'AddPaymentInfo',
  payment_success: 'Purchase',
  contact_submitted: 'Lead',
  schedule_interest_submitted: 'Lead',
}

export function track(event: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return

  const clean: AnalyticsParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') clean[k] = v
  }
  clean.page_path = window.location.pathname

  const w = window as WindowWithAnalytics
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...clean })
  w.gtag?.('event', event, clean)

  const metaEvent = META_EVENTS[event]
  if (metaEvent && w.fbq) {
    // event_id pairs this browser event with the server-side Conversions API event so Meta
    // counts the booking once.
    const { event_id, ...custom } = clean
    w.fbq('track', metaEvent, custom, event_id ? { eventID: String(event_id) } : undefined)
  }
}
