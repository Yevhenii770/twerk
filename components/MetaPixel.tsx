'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

type Fbq = (...args: unknown[]) => void

/** Loads the Meta Pixel and fires PageView on every client-side route change.
 * Renders nothing when NEXT_PUBLIC_META_PIXEL_ID is unset (local dev, previews). */
export default function MetaPixel() {
  const pathname = usePathname()
  const firstRender = useRef(true)

  useEffect(() => {
    if (!META_PIXEL_ID) return
    // The base snippet already fires the initial PageView; only track subsequent navigations.
    if (firstRender.current) { firstRender.current = false; return }
    ;(window as Window & { fbq?: Fbq }).fbq?.('track', 'PageView')
  }, [pathname])

  if (!META_PIXEL_ID) return null

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  )
}
