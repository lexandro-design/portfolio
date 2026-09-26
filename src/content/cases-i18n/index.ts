import type { Locale } from '@/i18n/config'
import { cases, type Case } from '../cases'
import { en } from './en'
import { ja } from './ja'
import type { CaseCopy } from './types'
import { zh } from './zh'

const COPY: Partial<Record<Locale, Record<string, CaseCopy>>> = { en, zh, ja }

/** Кейсы на нужном языке. Русский — исходник, остальные накладывают переводы текста */
export function getCases(locale: Locale): Case[] {
  const copy = COPY[locale]
  if (!copy) return cases
  return cases.map((c) => {
    const t = copy[c.slug]
    if (!t) return c
    return {
      ...c,
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
      shots: c.shots.map((s, i) => ({ ...s, caption: t.captions[i] ?? s.caption })),
    }
  })
}

export const getCase = (locale: Locale, slug: string) =>
  getCases(locale).find((c) => c.slug === slug) ?? null
