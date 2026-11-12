'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * Link to Instagram that actually opens on phones.
 *
 * In in-app browsers (Instagram, Facebook, Telegram, TikTok) a `target="_blank"` link to
 * instagram.com often does nothing, and on iOS a new-tab open can skip the Instagram app.
 * On touch devices / in-app browsers we drop `target` so it's a normal same-tab navigation,
 * which iOS/Android hand to the Instagram app (universal/app link) or load in place.
 * Desktop keeps opening a new tab.
 */
export default function InstagramLink({
  href,
  className,
  style,
  children,
  ariaLabel,
}: {
  href: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  ariaLabel?: string
}) {
  const [newTab, setNewTab] = useState(true)

  useEffect(() => {
    const ua = navigator.userAgent
    const inApp = /Instagram|FBAN|FBAV|Telegram|TikTok|musical_ly|Line\//i.test(ua)
    const touch = window.matchMedia('(pointer: coarse)').matches
    if (inApp || touch) setNewTab(false)
  }, [])

  return (
    <a
      href={href}
      className={className}
      style={style}
      aria-label={ariaLabel}
      {...(newTab ? { target: '_blank', rel: 'noopener' } : {})}
    >
      {children}
    </a>
  )
}
