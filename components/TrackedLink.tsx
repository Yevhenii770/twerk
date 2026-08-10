'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'
import { track, type AnalyticsParams } from '@/lib/analytics'

type Props = ComponentProps<typeof Link> & { event: string; params?: AnalyticsParams }

export default function TrackedLink({ event, params, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        track(event, params)
        onClick?.(e)
      }}
    />
  )
}
