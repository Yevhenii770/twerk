import Link from 'next/link'
import type { ClassSession } from '@/db/schema'
import { CLASS_STATIC, type ClassId } from '@/lib/classes'
import { fmtClock, whenLabel } from '@/lib/nextFormat'

/**
 * "Next class → Book" shortcuts. Each link opens /book with that exact session already chosen,
 * so the visitor lands straight on name / email / phone — no class or date step.
 * tone="dark" sits on the hero video, tone="light" on cream sections.
 */
export default function NextClasses({ next, only, tone = 'light' }: {
  next: Partial<Record<ClassId, ClassSession>>
  only?: ClassId
  tone?: 'dark' | 'light'
}) {
  const items = (Object.entries(next) as [ClassId, ClassSession | undefined][])
    .filter(([id, s]) => s && (!only || id === only))
    .sort((a, b) => a[1]!.date.localeCompare(b[1]!.date)) as [ClassId, ClassSession][]
  if (items.length === 0) return null

  return (
    <div className={`nxc nxc--${tone}`}>
      <p className="nxc-label">{only ? 'Next class' : 'Next classes'}</p>
      <div className="nxc-list">
        {items.map(([id, s]) => {
          const left = Math.max(0, s.capacity - s.booked)
          return (
            <Link key={id} href={`/book?session=${s.id}`} className="nxc-item"
              aria-label={`Book ${CLASS_STATIC[id].label}, ${whenLabel(s.date)} at ${fmtClock(s.startTime)}`}>
              <span className="nxc-when">{whenLabel(s.date)} · {fmtClock(s.startTime)}</span>
              <span className="nxc-cls">{CLASS_STATIC[id].label}</span>
              {left <= 5 && <span className="nxc-left">{left} spot{left === 1 ? '' : 's'} left</span>}
              <span className="nxc-go" aria-hidden="true">Book →</span>
            </Link>
          )
        })}
      </div>
      <style>{`
        .nxc{margin-top:28px;}
        .nxc-label{font-size:10px;letter-spacing:.35em;text-transform:uppercase;margin-bottom:10px;}
        .nxc-list{display:flex;gap:10px;flex-wrap:wrap;}
        .nxc-item{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;min-height:48px;padding:12px 18px;text-decoration:none;border:1px solid;transition:background .25s,border-color .25s;}
        .nxc-when{font-size:12px;letter-spacing:.06em;}
        .nxc-cls{font-family:var(--font-cormorant);font-style:italic;font-size:20px;line-height:1;}
        .nxc-left{font-size:11px;font-weight:600;color:var(--pink);}
        .nxc-go{font-size:11px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;margin-left:auto;}
        .nxc--dark .nxc-label{color:rgba(255,255,255,.55);}
        .nxc--dark .nxc-item{color:#fff;border-color:rgba(255,255,255,.28);background:rgba(0,0,0,.18);}
        .nxc--dark .nxc-item:hover{border-color:#fff;background:rgba(255,255,255,.08);}
        .nxc--dark .nxc-left{color:#ff7fb6;}
        .nxc--light .nxc-label{color:var(--mid);}
        .nxc--light .nxc-item{color:var(--dark);border-color:var(--border);background:#fff;}
        .nxc--light .nxc-item:hover{border-color:var(--dark);}
        .nxc--light .nxc-go{color:var(--pink);}
        .nxc-item:focus-visible{outline:2px solid var(--pink);outline-offset:3px;}
        .nxc--dark{display:flex;flex-direction:column;align-items:center;}
        .nxc--dark .nxc-list{justify-content:center;}
        @media (max-width:640px){.nxc-list{flex-direction:column;align-items:stretch;}.nxc-item{width:100%;}}
      `}</style>
    </div>
  )
}
