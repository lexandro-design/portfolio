import type { Locale } from '@/i18n/config'
import data from './data/casts.json'
import { overlay } from './showcase'

/**
 * Запись экрана без видео: сценарий по шагам. Слева то, что видит человек,
 * справа то, что в этот момент происходит внутри. Тексты и цифры только из
 * материалов кейса, примеры переписки условные
 */

export type CastMsg =
  | { k: 'in'; text: string; btns?: string[] }
  | { k: 'out'; text: string }
  | { k: 'tap'; btn: number }
  | { k: 'shot'; label: string; btns?: string[] }
  | { k: 'photos'; n: number; label: string }
  | { k: 'voice'; text: string }
  | { k: 'bar'; label: string }
  | { k: 'line'; text: string; tone?: 'ok' | 'dim' }

export type CastBeat = {
  /** Подпись под экраном: что сейчас произошло */
  cap: string
  /** Строка «внутри» */
  log?: string
  msg?: CastMsg
  /** Экран со строками: какая строка меняет состояние */
  set?: { row: number; state: string; note?: string }
  /** Крупная цифра итога */
  big?: { v: string; l: string }
  ms?: number
}

export type Cast = {
  app: string
  sub: string
  screen: 'chat' | 'rows' | 'term'
  rows?: { name: string; note: string; state?: string }[]
  beats: CastBeat[]
}

const RU = data as unknown as Record<string, Cast>
const COPY: Partial<Record<Locale, Record<string, unknown>>> = {}

export function getCast(locale: Locale, slug: string): Cast | null {
  const base = RU[slug]
  if (!base) return null
  const tr = COPY[locale]?.[slug]
  return tr ? overlay(base, tr) : base
}
