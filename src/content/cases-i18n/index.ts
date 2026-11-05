import type { Locale } from '@/i18n/config'
import { cases, type Case } from '../cases'
import stack from '../data/cases-i18n/stack.json'
import { en } from './en'
import { ja } from './ja'
import type { CaseCopy } from './types'
import { zh } from './zh'

const COPY: Partial<Record<Locale, Record<string, CaseCopy>>> = { en, zh, ja }
/** Русские слова в стеке («Дизайн-система», «Прототип»); названия технологий не переводятся */
const STACK = stack as Record<string, Partial<Record<Locale, string>>>

/** Кейсы на нужном языке. Русский — исходник, остальные накладывают переводы текста */
export function getCases(locale: Locale): Case[] {
  const copy = COPY[locale]
  if (!copy) return cases
  return cases.map((c) => {
    const t = copy[c.slug]
    const tech = c.stack.map((s) => STACK[s]?.[locale] ?? s)
    if (!t) return { ...c, stack: tech }
    return {
      ...c,
      stack: tech,
      title: t.title ?? c.title,
      tagline: t.tagline,
      lead: t.lead,
      client: t.client,
      sections: t.sections,
      note: t.note,
      // Перевод превью — только тексты: имя бота и прочее берутся из русской версии
      preview:
        t.preview && c.preview?.kind === t.preview.kind
          ? ({ ...c.preview, ...t.preview } as Case['preview'])
          : (t.preview ?? c.preview),
      scheme: t.scheme ?? c.scheme,
      card: c.card?.perLocale ? { ...c.card, src: c.card.src.replace('.jpg', `-${locale}.jpg`) } : c.card,
      shots: c.shots.map((s, i) => ({ ...s, caption: t.captions[i] ?? s.caption })),
    }
  })
}

export const getCase = (locale: Locale, slug: string) =>
  getCases(locale).find((c) => c.slug === slug) ?? null
