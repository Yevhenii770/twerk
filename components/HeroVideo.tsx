'use client'

import { useEffect, useRef } from 'react'

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    video.play().catch(() => {
      // autoplay blocked — видео останется на poster
    })
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
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>
  )
}
