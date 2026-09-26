import data from './data/cases.json'

/**
 * Кейсы — единственный источник: главная, страницы кейсов и навигация
 * «следующий кейс» читают отсюда. Сами данные — в data/cases.json, его же
 * правит админка (admin/). Тексты — только факты о проектах,
 * без придуманных цифр. Порядок массива — порядок на сайте: сильные
 * кейсы разных направлений вперемешку, мелкие автоматизации в конце.
 * В автоматизациях заказчики не называются — только суть задачи.
 */

export type Direction = 'design' | 'web' | 'ai'

export type Shot = {
  src: string
  caption: string
  /** Размер файла — чтобы место под картинку резервировалось до загрузки */
  w: number
  h: number
  /** Тот же экран в тёмной теме — на странице появляется переключатель */
  dark?: string
}

export type CaseSection = {
  title: string
  body: string[]
}

/**
 * Превью кейса без скриншотов. Автоматизации нечего показать картинкой,
 * поэтому рисуем, как она работает: цепочку шагов или кусок переписки
 */
/** Реплика в превью-переписке. media — вложение, по которому видна суть бота */
export type ChatLine = {
  from: 'user' | 'bot'
  text: string
  media?: 'photo' | 'products' | 'booking' | 'drawing'
  /** Подписи вложения: названия товаров, статус брони */
  items?: string[]
}

export type Preview =
  | { kind: 'flow'; steps: string[] }
  /** bot — имя бота в шапке переписки, как в Telegram: «Mimimi_bot». Нет — просто «bot» */
  | { kind: 'chat'; bot?: string; lines: ChatLine[] }
  | { kind: 'inbox'; columns: string[]; mails: { text: string; to: number }[] }
  | { kind: 'search'; query: string; results: string[] }

export type Case = {
  slug: string
  title: string
  /** Продолжение заголовка в списке: «Parfumeria.by · дизайн-система» */
  tagline: string
  /** Коротко для карточки и шапки кейса */
  lead: string
  directions: Direction[]
  /** Подпись направлений в метке: «design · web» */
  label: string
  group: 'titan' | 'entersales' | 'freelance' | 'own'
  client: string
  year: string
  stack: string[]
  sections: CaseSection[]
  /** Скриншоты для галереи и полноэкранного просмотра */
  shots: Shot[]
  /**
   * Собранные обложки (tools/cards/covers.mjs): thumb — строка на главной,
   * cover — шапка кейса. Нет обложки и скринов — превью (preview или номер)
   */
  thumb?: Shot
  cover?: Shot
  preview?: Preview
  /** Небольшой проект: на главной идёт строкой списка, а не крупной карточкой */
  minor?: boolean
  /** Пометка к галерее, например про демо-данные */
  note?: string
  link?: { href: string; label: string }
  /** Соавтор: кнопка на его GitHub под лидом кейса. Роль подписывается из словаря */
  credit?: { href: string; handle: string }
}

/**
 * Скрины кейса лежат в public/cases/<slug>/01.jpg, 02.jpg… в порядке
 * массива, w и h — размеры файла из tools/cards/shots.py. Обложки
 * (thumb, cover) собирает tools/cards/covers.mjs
 */
export const cases = data as Case[]
