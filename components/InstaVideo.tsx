'use client'

import { useEffect, useRef } from 'react'

/**
 * Instagram-grid video tile. Always shows a poster frame, so the tile is never a black box when
 * the browser refuses autoplay (iOS Low Power Mode, data saver). Only downloads/plays while the
 * tile is on screen, and pauses when it scrolls away — four autoplaying videos at once were
 * heavy on phones.
 */
export default function InstaVideo({ src, poster, objectPosition }: { src: string; poster?: string; objectPosition: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    if (!('IntersectionObserver' in window)) {
      video.play().catch(() => {})
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {}) // blocked autoplay → poster stays visible
        else video.pause()
      },
      { threshold: 0.25 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition, transition: 'transform 0.55s ease', background: '#1A1414' }}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
