import { getSchedule, getClassSettings } from '@/lib/dal'
import { CLASS_IDS, CLASS_STATIC, MONTHLY_PASS_SESSION_COUNT, classPrices, formatSlot } from '@/lib/classes'
import { classAddress } from '@/lib/studio'
import { getUpcomingClosures, formatRange } from '@/lib/closures'
import { GUIDES } from '@/lib/guides'

// /llms.txt — a plain-text fact sheet for AI assistants (ChatGPT, Perplexity, Claude, Gemini).
// Built from the same live data as the site (admin schedule, prices, addresses, closures), so it can
// never drift out of date the way a hand-written file would.
export const revalidate = 3600

const SITE = 'https://bounce-lab.com'
const PAGE: Record<string, string> = { twerk: '/classes/twerk', highheels: '/classes/high-heels' }

export async function GET() {
  const [schedule, settings, closures] = await Promise.all([getSchedule(), getClassSettings(), getUpcomingClosures()])

  const classes = CLASS_IDS.map(id => {
    const s = schedule.find(x => x.classType === id)
    const p = classPrices(id, settings)
    const label = CLASS_STATIC[id].label
    return [
      `### ${label}`,
      s ? `- When: every ${formatSlot(s)}` : '- When: see the booking page',
      `- Where: ${classAddress(id, settings)}`,
      `- Drop-in: $${p.dropin}` + (p.monthly != null ? ` · Monthly Pass: $${p.monthly} for ${MONTHLY_PASS_SESSION_COUNT} classes` : ''),
      `- Class page: ${SITE}${PAGE[id]}`,
      `- Book online: ${SITE}${CLASS_STATIC[id].bookUrl}`,
    ].join('\n')
  }).join('\n\n')

  const closed = closures.length
    ? `\n## Upcoming closures\n${closures.map(c => `- ${formatRange(c)}: no ${c.classType ? CLASS_STATIC[c.classType as keyof typeof CLASS_STATIC]?.label ?? '' : 'classes'}`).join('\n')}\n`
    : ''

  const body = `# bounce lab

> Beginner-friendly twerk and high heels dance classes for women in Portland, Oregon. No dance experience needed, small groups, book and pay online.

bounce lab is a dance studio in Portland, OR, founded by instructor Iryna Pytska. Classes are held in two studios on Portland's inner east side — Twerk and High Heels are in different locations, so check the address for your class.

## Classes

${classes}
${closed}
## Good to know
- No experience needed; every move is broken down step by step.
- Free cancellation up to 24 hours before class (manage the booking from the confirmation email).
- Pay online by card, Apple Pay or Google Pay. You can also pay on the booking page at the studio until 30 minutes after class ends.
- Private lessons and bachelorette / girls' night dance parties: ${SITE}/private-lessons and ${SITE}/bachelorette-dance-class-portland
- Instructor: ${SITE}/instructor
- Contact: ${SITE}/contact · phone (503) 422-0858 · Instagram @iryna.pytska

## Beginner guides
${GUIDES.map(g => `- [${g.title}](${SITE}/guides/${g.slug}): ${g.description}`).join('\n')}

## Main pages
- [Home](${SITE}/)
- [Dance classes in Portland](${SITE}/dance-classes-portland)
- [Book a class](${SITE}/book)
`

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
