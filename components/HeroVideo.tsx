'use client'

import { useEffect, useRef, useState } from 'react'

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) {
      video.src = '/hero-video-mobile.mp4'
    }

    video.muted = true
    video.play()
      .then(() => setPlaying(true))
      .catch(() => {
        const unlock = () => {
          video.play().then(() => setPlaying(true)).catch(() => {})
        }
        document.addEventListener('touchstart', unlock, { once: true })
        document.addEventListener('click', unlock, { once: true })
      })
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <video
        ref={ref}
        src="/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/studio.jpg"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {!playing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/studio.jpg"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}
