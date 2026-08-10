export type AnalyticsParams = Record<string, string | number | undefined>

type WindowWithAnalytics = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
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
}
