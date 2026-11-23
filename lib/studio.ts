/**
 * Studio locations. bounce lab rents two halls: Twerk and Heels run at different addresses.
 *
 * - Each class's hall address is editable in admin (class_settings.address). These defaults are
 *   only the fallback when the admin hasn't set one. Every place that tells a customer WHERE to go
 *   (booking summary, emails, calendar invites, directions links, class pages, FAQ) must use
 *   classAddress(classType, settings) — never a hardcoded street.
 * - MAIN_ADDRESS is the business's single public address (LocalBusiness schema). It must match
 *   the Google Business Profile pin, which is 2648 E Burnside St (checked 2026-11-22).
 */
import type { ClassId } from '@/lib/classes'

export const STUDIO_CITY = 'Portland'
export const STUDIO_REGION = 'OR'
export const STUDIO_POSTAL = '97214'

export const DEFAULT_CLASS_ADDRESS: Record<ClassId, string> = {
  twerk: '232 SE Oak St, Portland, OR 97214',
  highheels: '2648 E Burnside St, Portland, OR 97214',
}

/** Same address as the Google Maps pin — keep these identical. */
export const MAIN_ADDRESS = DEFAULT_CLASS_ADDRESS.highheels

/** Short area name for copy ("studio in …"). Both halls are in 97214. */
export const STUDIO_AREA = "Portland's inner east side"

export type AddressSettings = Record<string, { address?: string | null } | undefined> | undefined

/** The hall address for a class — admin value if set, else the default. */
export function classAddress(classType: string, settings?: AddressSettings): string {
  const fromAdmin = settings?.[classType]?.address?.trim()
  return fromAdmin || DEFAULT_CLASS_ADDRESS[classType as ClassId] || MAIN_ADDRESS
}

export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/** "2648 E Burnside St, Portland, OR 97214" → schema.org PostalAddress (best effort). */
export function postalAddress(address: string) {
  const m = address.match(/^(.+?),\s*([^,]+?),\s*([A-Z]{2})\s+(\d{5})(?:,.*)?$/)
  return {
    '@type': 'PostalAddress',
    streetAddress: m ? m[1] : address,
    addressLocality: m ? m[2] : STUDIO_CITY,
    addressRegion: m ? m[3] : STUDIO_REGION,
    postalCode: m ? m[4] : STUDIO_POSTAL,
    addressCountry: 'US',
  } as const
}

export const MAIN_POSTAL_ADDRESS = postalAddress(MAIN_ADDRESS)

/** Street part only, for compact copy: "232 SE Oak St". */
export function street(address: string): string {
  return address.split(',')[0].trim()
}
