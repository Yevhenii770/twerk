import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
    ],
    sitemap: 'https://bouncelab.nyc/sitemap.xml',
    host: 'https://bouncelab.nyc',
  }
}
