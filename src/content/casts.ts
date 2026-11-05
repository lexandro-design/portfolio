import type { Locale } from '@/i18n/config'
import data from './data/casts.json'
import en from './data/casts-i18n/en.json'
import ja from './data/casts-i18n/ja.json'
import zh from './data/casts-i18n/zh.json'
import { overlay } from './showcase'

/**
 * Запись экрана без видео: сценарий по шагам. Слева то, что видит человек,
 * справа то, что в этот момент происходит внутри. Тексты и цифры только из
 * материалов кейса, примеры переписки условные
 */

/** Настоящий кадр вместо условного: src картинка или постер, video беззвучная петля */
export type CastMedia = { src: string; video?: string; ratio?: '16:10' | '1:1' | '3:4'; alt?: string }

export type CastMsg =
  | { k: 'in'; text: string; btns?: string[]; stack?: boolean }
  | { k: 'out'; text: string }
  | { k: 'tap'; btn: number }
  /** Сообщение с кадром: slides листаются в том же сообщении, text подпись, stack кнопки столбиком */
  | { k: 'shot'; label: string; btns?: string[]; media?: CastMedia; slides?: CastMedia[]; text?: string; stack?: boolean }
  /** Перелистывание последней карусели: сообщение то же, меняется кадр */
  | { k: 'swipe'; to: number }
  | { k: 'photos'; n: number; label: string; media?: CastMedia[] }
  | { k: 'voice'; text: string }
  | { k: 'bar'; label: string }
  | { k: 'line'; text: string; tone?: 'ok' | 'dim' }
  | { k: 'diff'; was: string; now: string }

/** Что происходит внутри: у каждого кейса свой вид, шаги меняют его строки */
export type CastView = {
  kind: 'stages' | 'sheet' | 'card' | 'board' | 'slots' | 'rank' | 'desks' | 'chips' | 'lanes' | 'ticks' | 'sketch' | 'doc' | 'die' | 'pins'
  title: string
  cols?: string[]
  rows: { c: string[]; s?: string; at?: number }[]
  /** Рисунок: настоящие кадры вместо условных, первый работа, второй эталон. Подборка: at у строки номер кадра */
  media?: CastMedia[]
}

export type CastBeat = {
  /** Подпись под экраном: что сейчас произошло */
  cap: string
  /** Строка «внутри» */
  log?: string
  msg?: CastMsg
  /** Экран со строками: какая строка меняет состояние */
  set?: { row: number; state: string; note?: string }
  /** Какие строки вида меняет этот шаг */
  v?: { r: number; s?: string; c?: string[]; at?: number }[]
  /** Крупная цифра итога */
  big?: { v: string; l: string }
  ms?: number
}

export type Cast = {
  app: string
  sub: string
  screen: 'chat' | 'rows' | 'term' | 'voice' | 'view'
  /** Экран выше обычного: в чате вертикальные кадры */
  tall?: boolean
  /** Своя подпись под записью, например что кадры иллюстративные */
  note?: string
  rows?: { name: string; note: string; state?: string }[]
  view?: CastView
  beats: CastBeat[]
}

const RU = data as unknown as Record<string, Cast>
export const CAST_COUNT = Object.keys(RU).length
const COPY: Partial<Record<Locale, Record<string, { app?: string }>>> = { en, zh, ja }

export function getCast(locale: Locale, slug: string): Cast | null {
  const base = RU[slug]
  if (!base) return null
  const tr = COPY[locale]?.[slug]
  // Название приложения overlay не трогает: у кейсов это имя продукта, здесь подпись окна
  return tr ? { ...overlay(base, tr), app: tr.app ?? base.app } : base
}
