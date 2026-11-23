'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Phones only: a slim "Book" bar pinned to the bottom of every marketing page, so the moment
 * someone decides, the button is under their thumb. Appears after the first screen (the hero
 * already has big buttons), hidden on the booking flow itself and on booking-management pages.
 */
const HIDE_ON = ['/book', '/manage-booking', '/contact']

type NextLink = { href: string; date: string; text: string }

export default function StickyBookBar({ links, price }: { links: Record<string, NextLink>; price: number }) {
  const pathname = usePathname()
  const pageClass = pathname?.startsWith('/classes/high-heels') ? 'highheels' : pathname?.startsWith('/classes/twerk') ? 'twerk' : null
  const soonest = Object.values(links).sort((a, b) => a.date.localeCompare(b.date))[0]
  const pick = (pageClass && links[pageClass]) || soonest
  const href = pick?.href ?? '/book'
  const nextText = pick?.text ?? null
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (HIDE_ON.some(p => pathname?.startsWith(p))) return null

  return (
    <div className={`sbb${shown ? ' is-shown' : ''}`} aria-hidden={!shown}>
      <p className="sbb-text">
        {nextText ? <><span className="sbb-label">Next class ·</span> {nextText}</> : 'Twerk · High Heels'}
      </p>
      <Link href={href} className="sbb-btn" tabIndex={shown ? 0 : -1}>Save my spot · ${price}</Link>
      <style>{`
        .sbb{display:none;}
        @media (max-width:768px){
          .sbb{display:flex;align-items:center;gap:12px;position:fixed;left:0;right:0;bottom:0;z-index:60;
            padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:rgba(253,250,247,.96);
            backdrop-filter:blur(10px);border-top:1px solid var(--border);transform:translateY(110%);transition:transform .3s ease;}
          .sbb.is-shown{transform:none;}
          .sbb-text{flex:1;min-width:0;margin:0;font-size:13px;font-weight:600;color:var(--dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
          .sbb-label{font-weight:400;color:var(--mid);}
          .sbb .sbb-btn{flex-shrink:0;min-height:44px;display:inline-flex;align-items:center;padding:0 16px;background:var(--pink);color:#fff;
            font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;white-space:nowrap;}
          .sbb .sbb-btn:focus-visible{outline:2px solid var(--dark);outline-offset:2px;}
        }
        @media (prefers-reduced-motion: reduce){.sbb{transition:none;}}
      `}</style>
    </div>
  )
}
