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

/** Описание для выдачи: до 165 знаков, по границе предложения или слова */
function clip(text: string, max = 165) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('。'))
  if (end > max * 0.6) return cut.slice(0, end + 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : max).replace(/[,;:]$/, '')}…`
}

export function caseMeta(locale: Locale, slug: string): Metadata {
  const item = getCase(locale, slug)
  if (!item) return {}
  // Выдача режет заголовок около 60 знаков: длинному оставляем название и суть, имя есть в og:site_name
  const full = `${item.title} · ${item.tagline} · ${getDict(locale).meta.caseTitle}`
  const title = full.length > 65 ? `${item.title} · ${item.tagline}` : full
  return {
    ...pageMeta({
      locale,
      path: `/cases/${slug}/`,
      title,
      description: clip(item.lead),
      image: `/og/${slug}.jpg`,
    }),
    title: { absolute: title },
  }
}

export const caseSlugs = () => getCases('ru').map((c) => ({ slug: c.slug }))
