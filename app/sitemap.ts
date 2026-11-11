import { MetadataRoute } from 'next'
import { getSchedule } from '@/lib/dal'
import { GUIDES } from '@/lib/guides'

const base = 'https://bounce-lab.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages that show the schedule change whenever the admin edits it — report that to Google.
  const schedule = await getSchedule()
  const scheduleUpdated = schedule
    .map(s => ('updatedAt' in s && s.updatedAt ? new Date(s.updatedAt) : null))
    .filter((d): d is Date => d != null)
    .reduce((max, d) => (d > max ? d : max), new Date('2026-11-11'))

  return [
    { url: base,                                  lastModified: scheduleUpdated, changeFrequency: 'weekly',  priority: 1    },
    { url: `${base}/classes/twerk`,               lastModified: scheduleUpdated, changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${base}/classes/high-heels`,          lastModified: scheduleUpdated, changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${base}/dance-classes-portland`,      lastModified: scheduleUpdated, changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${base}/book`,                        lastModified: scheduleUpdated, changeFrequency: 'daily',   priority: 0.8  },
    { url: `${base}/private-lessons`,             lastModified: '2026-11-11',    changeFrequency: 'monthly', priority: 0.6  },
    ...GUIDES.map(g => ({ url: `${base}/guides/${g.slug}`, lastModified: g.published, changeFrequency: 'monthly' as const, priority: 0.6 })),
    { url: `${base}/contact`,                     lastModified: '2026-11-11',    changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${base}/privacy`,                     lastModified: '2026-06-18',    changeFrequency: 'yearly',  priority: 0.2  },
    { url: `${base}/terms`,                       lastModified: '2026-06-18',    changeFrequency: 'yearly',  priority: 0.2  },
  ]
}
