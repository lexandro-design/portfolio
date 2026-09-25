import type { MetadataRoute } from 'next'
import { LOCALES, localePath } from '@/i18n/config'
import { caseSlugs } from '@/lib/routes'
import { absolute } from '@/lib/meta'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', ...caseSlugs().map(({ slug }) => `/cases/${slug}/`)]
  return paths.map((path) => ({
    url: absolute(path),
    priority: path === '/' ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, absolute(localePath(l, path))])),
    },
  }))
}
