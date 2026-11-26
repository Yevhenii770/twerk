// Text of the "thanks for your first class" email. Pure (no DB, no env) so every wording case is
// unit-tested: same slot next week, schedule changed, no open class, or the cron ran late.

export type FollowupInput = {
  firstName: string
  classType: string
  /** The class they just attended. */
  attended: { date: string; startTime: string }
  /** Next bookable class of the same type, read from the live schedule at send time. */
  next: { id: number; date: string; startTime: string; endTime: string; price: number } | null
  address: string
  /** Portland "today", YYYY-MM-DD (the day the email goes out). */
  today: string
  siteUrl: string
}

const LABELS: Record<string, string> = { twerk: 'Twerk', highheels: 'High Heels' }

function weekday(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
}
function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
}
function clock(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
function dayBefore(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}
function esc(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

/** "last night" / "yesterday" / "on Thursday" — correct even if the cron ran a day late. */
export function whenAttended(attended: { date: string; startTime: string }, today: string) {
  if (attended.date === dayBefore(today)) return Number(attended.startTime.split(':')[0]) >= 17 ? 'last night' : 'yesterday'
  return `on ${weekday(attended.date)}`
}

export function buildFollowup(d: FollowupInput): { subject: string; html: string } {
  const label = LABELS[d.classType] ?? d.classType
  const name = esc(d.firstName.trim() || 'there')
  const sameSlot = d.next && weekday(d.next.date) === weekday(d.attended.date) && d.next.startTime === d.attended.startTime

  const subject = !d.next
    ? `Thanks for coming to ${label}, ${d.firstName.trim() || 'friend'}!`
    : sameSlot
      ? `Thanks for coming, ${d.firstName.trim()}! Same time next ${weekday(d.next.date)}?`
      : `Thanks for coming, ${d.firstName.trim()}! Your next ${label} class is ${weekday(d.next.date)}`

  const bookUrl = d.next ? `${d.siteUrl}/book?session=${d.next.id}` : `${d.siteUrl}/book?class=${d.classType}`
  const nextBlock = d.next
    ? `<p style="font-size:16px"><b>Next class:</b> ${label} — ${shortDate(d.next.date)}, ${clock(d.next.startTime)} – ${clock(d.next.endTime)}</p>
        <p><b>Where:</b> ${esc(d.address)}</p>
        <p style="margin-top:20px"><a href="${bookUrl}" style="display:inline-block;background:#E8167A;color:#fff;text-decoration:none;padding:12px 22px;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Save my spot · $${d.next.price}</a></p>
        <p style="color:#666;font-size:13px">Free cancellation up to 24h before class.</p>`
    : `<p style="margin-top:20px"><a href="${bookUrl}" style="display:inline-block;background:#E8167A;color:#fff;text-decoration:none;padding:12px 22px;font-size:12px;letter-spacing:.12em;text-transform:uppercase">See upcoming classes</a></p>`

  const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
        <h2>Thanks for dancing with us, ${name}!</h2>
        <p>Hope you had fun at ${label} ${whenAttended(d.attended, d.today)}. The best way to get better fast is to come every week.</p>
        ${nextBlock}
        <p style="color:#666;font-size:13px">Planning to come every week? Check out the <a href="${d.siteUrl}/book?class=${d.classType}" style="color:#C9A96E">Monthly Pass</a>.</p>
        <p style="color:#666;font-size:13px;margin-top:24px">See you on the floor,<br>Bounce Lab</p>
      </div>`
  return { subject, html }
}
