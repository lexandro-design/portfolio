import type { Metadata } from 'next'
import { DEFAULT_LOCALE, LOCALES, localePath, OG_LOCALE, type Locale } from '@/i18n/config'
import { asset } from './asset'

const ORIGIN = 'https://lexandro-design.github.io'
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Абсолютный адрес страницы сайта */
export const absolute = (path: string) => `${ORIGIN}${BASE}${path}`

type Input = { locale: Locale; path: string; title: string; description: string; image: string }

/**
 * Метаданные страницы на языке: canonical, ссылки на ту же страницу
 * на других языках (hreflang) и превью для мессенджеров.
 */
export function pageMeta({ locale, path, title, description, image }: Input): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: absolute(localePath(locale, path)),
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, absolute(localePath(l, path))])),
        'x-default': absolute(localePath(DEFAULT_LOCALE, path)),
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      locale: OG_LOCALE[locale],
      siteName: 'LEXANDRO',
      images: [{ url: asset(image), width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  }
}
