export type InstaPost = {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  objectPosition?: string
}

const FALLBACK: InstaPost[] = [
  { id: '4', media_type: 'VIDEO', media_url: '/insta/4.mp4', permalink: 'https://www.instagram.com/iryna.pytska' },
  { id: '2', media_type: 'IMAGE', media_url: '/insta/2.jpg', permalink: 'https://www.instagram.com/iryna.pytska', objectPosition: 'center top' },
  { id: '5', media_type: 'VIDEO', media_url: '/insta/5.mp4', permalink: 'https://www.instagram.com/iryna.pytska' },
  { id: '1', media_type: 'IMAGE', media_url: '/insta/1.jpg', permalink: 'https://www.instagram.com/iryna.pytska' },
  { id: '6', media_type: 'VIDEO', media_url: '/insta/6.mp4', permalink: 'https://www.instagram.com/iryna.pytska' },
  { id: '3', media_type: 'IMAGE', media_url: '/insta/3.jpg', permalink: 'https://www.instagram.com/iryna.pytska' },
]

export async function fetchInstagramPosts(): Promise<InstaPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return FALLBACK

  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink&limit=6&access_token=${token}`,
      { next: { revalidate: 43200 } } // revalidate every 12 hours
    )
    if (!res.ok) return FALLBACK
    const json = await res.json()
    if (!Array.isArray(json.data) || json.data.length === 0) return FALLBACK
    return json.data.slice(0, 6)
  } catch {
    return FALLBACK
  }
}
