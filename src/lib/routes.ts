import type { Metadata } from 'next'
import { getCase, getCases } from '@/content/cases-i18n'
import type { Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'
import { pageMeta } from './meta'

/** Метаданные главной и кейса — общие для русских страниц и страниц под /en, /zh, /ja */
export function homeMeta(locale: Locale): Metadata {
  const t = getDict(locale)
  return {
    ...pageMeta({
      locale,
      path: '/',
      title: t.meta.title,
      description: t.meta.description,
      image: `/og/home${locale === 'ru' ? '' : `-${locale}`}.png`,
    }),
    title: { absolute: t.meta.title },
  }
}

export function caseMeta(locale: Locale, slug: string): Metadata {
  const item = getCase(locale, slug)
  if (!item) return {}
  const title = `${item.title} · ${item.tagline} · ${getDict(locale).meta.caseTitle}`
  return {
    ...pageMeta({
      locale,
      path: `/cases/${slug}/`,
      title,
      description: item.lead,
      image: `/og/${slug}.png`,
    }),
    title: { absolute: title },
  }
}

export const caseSlugs = () => getCases('ru').map((c) => ({ slug: c.slug }))
