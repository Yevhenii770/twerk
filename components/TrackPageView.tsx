'use client'

import { useEffect, useRef } from 'react'
import { track, type AnalyticsParams } from '@/lib/analytics'

export default function TrackPageView({ event, params }: { event: string; params?: AnalyticsParams }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    track(event, params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
