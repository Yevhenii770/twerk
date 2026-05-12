'use client'

import { useEffect, useRef, useState } from 'react'

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    video.src = isMobile ? '/hero-video-mobile.mp4' : '/hero-video.mp4'
    video.muted = true
    video.load()

    video.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Telegram / restricted browser — wait for user tap
        const unlock = () => {
          video.play().then(() => {
            setPlaying(true)
            document.removeEventListener('touchstart', unlock)
            document.removeEventListener('click', unlock)
          }).catch(() => {})
        }
        document.addEventListener('touchstart', unlock, { once: true })
        document.addEventListener('click', unlock, { once: true })
      })
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
        poster="/studio.jpg"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* Показываем poster пока видео не играет */}
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
