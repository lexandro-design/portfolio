import data from './data/cases.json'
import accents from './data/accents.json'

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
  /** Кадр со сцены с текстом: у каждого языка свой файл, tile-en.jpg рядом с tile.jpg */
  perLocale?: boolean
  /** Постановочная иллюстрация: в карточке стоит подпись об этом */
  illustration?: boolean
  /** Тот же экран в тёмной теме — на странице появляется переключатель */
  dark?: string
  /**
   * Анимация вместо статичного кадра: беззвучная петля MP4. src остаётся
   * первым кадром — он виден до загрузки видео
   */
  video?: string
  /**
   * Свой кадр для телефона (до 767px), например вертикальный рендер
   * в шапке кейса. Подпись берётся у основного кадра
   */
  mobile?: Omit<Shot, 'caption' | 'mobile' | 'dark'>
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

/**
 * Схема «как работает» на странице кейса — для AI-продуктов, у которых
 * нет экранов. Только то, что есть в тексте кейса, без устройства до
 * деталей. pipeline — цепочка шагов, по которой бежит запрос, и обратная
 * дорожка (loop); board — табло: задача → распределитель → столы по группам
 */
export type SchemeStep = { label: string; note?: string }

export type Scheme =
  | {
      kind: 'pipeline'
      title: string
      steps: SchemeStep[]
      loop?: { title: string; steps: SchemeStep[] }
    }
  | {
      kind: 'board'
      title: string
      input: SchemeStep
      hub: SchemeStep
      groups: { label: string; items: string[] }[]
      /** Чем стол сдаёт работу: «готово», «вопрос»… */
      results: string[]
      rules: string[]
    }

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
  /** Настоящий кадр или петля в карточке автоматизации вместо живого превью, 16:10 или 1:1. Страница кейса не меняется */
  card?: Shot
  /** Иллюстрации настроения на странице кейса, 1:1. Подпись про иллюстрацию ставит сам блок */
  preview?: Preview
  scheme?: Scheme
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

/**
 * Свой цвет кейса — взят с его же экранов (фирменный цвет продукта или
 * дизайн-системы). Им подсвечены номера глав, рельс и свечение в шапке;
 * у автоматизаций без экранов — общий «живой» зелёный
 */
export const caseColor = (slug: string): string | undefined =>
  (accents as Record<string, string>)[slug]
