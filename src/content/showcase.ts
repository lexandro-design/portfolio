import type { Locale } from '@/i18n/config'
import data from './data/showcase.json'
import en from './data/showcase-i18n/en.json'
import ja from './data/showcase-i18n/ja.json'
import zh from './data/showcase-i18n/zh.json'

/**
 * Раскрытие кейса: «коротко» (задача, что сделал, результат, цифры) и
 * интерактивные блоки под суть проекта. Сайт показывают в окне браузера,
 * редизайн — шторкой «было / стало», сервис — сценарием по шагам, бота —
 * тем, что он делает. shot — номер скрина в cases.json, поэтому кадры и
 * подписи не дублируются. Цифры и тексты — только из материалов кейса.
 * Переводы лежат рядом с той же структурой и накладываются на русский
 */

export type Brief = {
  task: string
  did: string[]
  result: string
  /** Крупные цифры результата: «450+ экранов». Только из текста кейса */
  nums: { v: string; l: string }[]
}

/** section — номер раздела текста кейса, который идёт рядом с блоком как пояснение */
type Titled = { title: string; section?: number }

export type Block = Titled &
  (
    | { kind: 'browse'; pages: { shot: number; label: string }[] }
    | {
        kind: 'compare'
        a: string
        b: string
        /** dark — справа тёмная версия того же скрина */
        pairs: { a: number; b: number; label: string; dark?: boolean }[]
      }
    | { kind: 'steps'; steps: { shot: number; title: string; text: string }[] }
    | { kind: 'deck'; cards: { shot: number; title: string }[] }
    | { kind: 'reel'; items: { shot: number; title: string }[] }
    | { kind: 'wide'; shot: number }
    | { kind: 'voice'; lines: { who: 'me' | 'it' | 'sys'; name?: string; text: string }[] }
    | {
        kind: 'board'
        me: { label: string; note: string }
        hub: { label: string; note: string }
        desks: { name: string; group: string }[]
        /** работает, ждёт ответа, готово, свободен */
        states: string[]
        feed: { who: string; text: string }[]
      }
    | {
        kind: 'console'
        window: string
        tabs: string[]
        services: { name: string; note: string }[]
        foot: string
      }
    | {
        kind: 'transcript'
        lines: { t: string; who: 'me' | 'them'; name: string; text: string }[]
        summary: { title: string; text: string }[]
      }
    | {
        kind: 'sort'
        lanes: { label: string; out: string }[]
        items: { text: string; lane: number }[]
      }
    | { kind: 'queue'; stages: string[]; items: string[] }
    | {
        kind: 'trace'
        prompt: string
        steps: { text: string; note: string }[]
        out: string
        /** Ветка «в базе нет ответа» */
        miss?: { text: string; steps: string[] }
      }
    | {
        kind: 'fusion'
        query: string
        a: { label: string; items: string[] }
        b: { label: string; items: string[] }
        fused: string[]
        label: string
      }
    | {
        kind: 'notify'
        app: string
        items: { text: string; actions: string[] }[]
        replies: string[]
        rule: string
      }
    | { kind: 'timeline'; events: { time: string; text: string }[]; tick: string }
    | {
        kind: 'cards'
        note: string
        items: { src: string; text: string; score: number; ok: boolean; tip: string }[]
        draft: string
        actions: string[]
        rules: string[]
      }
    | {
        kind: 'diff'
        passes: string[]
        was: string
        now: string
        labels: [string, string]
        slots: string[]
      }
    | { kind: 'speed'; rows: { label: string; ms: number; value: string }[] }
    /** Статичные кадры в своей пропорции, без анимации: one, two, sheet (лист спрайтов), phones, phones-3 */
    | { kind: 'frames'; variant: string; items: { shot: number; title: string }[] }
  )

export type Showcase = { brief: Brief; blocks: Block[] }

const RU = data as unknown as Record<string, Showcase>
const COPY: Partial<Record<Locale, unknown>> = { en, zh, ja }

/** Поля, которые не переводятся: тип блока и имя бота */
const KEEP = new Set(['kind', 'app', 'variant'])

/** Накладывает перевод на русский: строки по тем же ключам и индексам, всё прочее из исходника */
export function overlay<T>(base: T, tr: unknown): T {
  if (typeof base === 'string') return (typeof tr === 'string' && tr ? tr : base) as T
  if (Array.isArray(base)) {
    const list = Array.isArray(tr) ? tr : []
    return base.map((v, i) => overlay(v, list[i])) as T
  }
  if (base && typeof base === 'object') {
    const src = (tr && typeof tr === 'object' ? tr : {}) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(base).map(([k, v]) => [k, KEEP.has(k) ? v : overlay(v, src[k])]),
    ) as T
  }
  return base
}

export function getShowcase(locale: Locale, slug: string): Showcase | null {
  const base = RU[slug]
  if (!base) return null
  const copy = COPY[locale] as Record<string, unknown> | undefined
  return copy ? overlay(base, copy[slug]) : base
}
