'use client'

import { useEffect, useRef } from 'react'

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const src = isMobile ? '/hero-video-mobile.mp4' : '/hero-video.mp4'

    video.src = src
    video.muted = true
    video.load()
    video.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/studio.jpg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
