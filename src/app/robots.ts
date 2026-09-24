import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `https://lexandro-design.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/sitemap.xml`,
  }
}
