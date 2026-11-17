/**
 * Studio location — the ONE place the address lives. Site copy, structured data, booking
 * summary, emails and calendar invites all read it from here.
 * The Google Maps listing itself is a service-area profile (address hidden there for now), so
 * directions links search for this address instead of pointing at the Maps place.
 */
export const STUDIO_STREET = '232 SE Oak St'
export const STUDIO_CITY = 'Portland'
export const STUDIO_REGION = 'OR'
export const STUDIO_POSTAL = '97214'
export const STUDIO_ADDRESS = `${STUDIO_STREET}, ${STUDIO_CITY}, ${STUDIO_REGION} ${STUDIO_POSTAL}`
/** Short area name for copy ("studio in …"). */
export const STUDIO_AREA = "Portland's Central Eastside"
export const STUDIO_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO_ADDRESS)}`

export const STUDIO_POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: STUDIO_STREET,
  addressLocality: STUDIO_CITY,
  addressRegion: STUDIO_REGION,
  postalCode: STUDIO_POSTAL,
  addressCountry: 'US',
} as const
