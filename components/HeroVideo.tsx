'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hero background video. The poster image covers it until frames are actually playing.
 *
 * play() is called right away instead of waiting for `canplay`: iOS in Low Power Mode / Low Data
 * Mode and in-app browsers (Telegram, Instagram) don't preload media, so `canplay` never fired and
 * the old code never tried to play — or even armed the tap-to-play fallback. Now a blocked
 * autoplay arms a one-time touch/click/scroll unlock, and the poster is hidden only on `playing`.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.src = isMobile ? '/hero-video-mobile.mp4' : '/hero-video.mp4'

    const onPlaying = () => setPlaying(true)
    video.addEventListener('playing', onPlaying)

    // iOS counts touchend/click as user activation (touchstart alone may not be enough).
    const events = ['touchstart', 'touchend', 'click', 'scroll'] as const
    const unlock = () => {
      video.play().catch(() => {})
      events.forEach(e => document.removeEventListener(e, unlock))
    }

    video.play().catch(() => {
      // Autoplay blocked — start on the first interaction instead.
      events.forEach(e => document.addEventListener(e, unlock, { once: true, passive: true }))
    })

    return () => {
      video.removeEventListener('playing', onPlaying)
      events.forEach(e => document.removeEventListener(e, unlock))
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        aria-hidden="true"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {!playing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/hero-poster.jpg"
          alt="bounce lab dance studio Portland Oregon"
          fetchPriority="high"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}
