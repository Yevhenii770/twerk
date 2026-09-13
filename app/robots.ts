import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/', '/book-live-test'],
      },
    ],
    sitemap: 'https://bounce-lab.com/sitemap.xml',
    host: 'https://bounce-lab.com',
  }
}
