import { unstable_cache } from 'next/cache'

const PLACE_ID = 'ChIJJWT7J-jSlA8R6qvGWWmiMxc'
const API_KEY = process.env.GOOGLE_PLACES_API_KEY

export type GoogleReview = {
  authorName: string
  authorPhoto: string
  rating: number
  text: string
  relativeTime: string
  googleMapsUri: string
  datePublished: string
}

export type GoogleReviewsData = {
  reviews: GoogleReview[]
  rating: number
  totalCount: number
}

async function fetchGoogleReviews(): Promise<GoogleReviewsData> {
  const empty = { reviews: [], rating: 0, totalCount: 0 }
  if (!API_KEY) return empty

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount&languageCode=en`,
      {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!res.ok) return empty

    const data = await res.json()

    const reviews = (data.reviews ?? [])
      .filter((r: any) => r.text?.text)
      .map((r: any) => ({
        authorName: r.authorAttribution?.displayName ?? 'Anonymous',
        authorPhoto: r.authorAttribution?.photoUri ?? '',
        rating: r.rating ?? 5,
        text: r.text.text,
        relativeTime: r.relativePublishTimeDescription ?? '',
        googleMapsUri: r.googleMapsUri ?? '',
        datePublished: r.publishTime ? r.publishTime.split('T')[0] : '',
      }))

    return {
      reviews,
      rating: data.rating ?? 0,
      totalCount: data.userRatingCount ?? reviews.length,
    }
  } catch {
    return empty
  }
}

export const getGoogleReviews = unstable_cache(fetchGoogleReviews, ['google-reviews'], {
  revalidate: 86400,
})
