import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'bounce lab Dance Studio',
    short_name: 'bounce lab',
    description: 'Twerk, High Heels & Stretching classes in Portland, OR',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5EDE0',
    theme_color: '#E8167A',
    icons: [
      { src: '/favicon.png', sizes: '87x82', type: 'image/png' },
    ],
  }
}
