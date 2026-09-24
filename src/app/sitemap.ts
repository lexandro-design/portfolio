import type { MetadataRoute } from 'next'
import { cases } from '@/content/cases'

export const dynamic = 'force-static'

const SITE = `https://lexandro-design.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}`

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, priority: 1 },
    ...cases.map((c) => ({ url: `${SITE}/cases/${c.slug}/`, priority: 0.8 })),
  ]
}
