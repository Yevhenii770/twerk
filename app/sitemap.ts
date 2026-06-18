import { MetadataRoute } from 'next'

const base = 'https://bounce-lab.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base,                           lastModified: '2026-06-18', changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/book`,                 lastModified: '2026-06-18', changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/classes/twerk`,        lastModified: '2026-06-18', changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/classes/high-heels`,   lastModified: '2026-06-18', changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/classes/stretching`,   lastModified: '2026-06-18', changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/privacy`,              lastModified: '2026-06-18', changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${base}/terms`,                lastModified: '2026-06-18', changeFrequency: 'yearly',  priority: 0.3  },
  ]
}
