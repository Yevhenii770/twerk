/** Client-safe formatting + copy for booking shortcuts (no DB imports here). */

export function fmtShortDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function fmtClock(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

/** "Tonight", "Tomorrow", or "Thu, Nov 26" — relative to Portland's today. */
export function whenLabel(iso: string, now = new Date()): string {
  const fmt = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  if (iso === fmt(now)) return 'Tonight'
  if (iso === fmt(new Date(now.getTime() + 86400000))) return 'Tomorrow'
  return fmtShortDate(iso)
}

export const TRUST_LINE = 'No experience needed · Free cancellation up to 24h before · Small groups'
