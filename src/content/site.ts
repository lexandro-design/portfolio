/**
 * Контакты и то, что не зависит от языка. Тексты сайта — в src/i18n/dict.
 */

export const contacts = {
  email: 'alexssveshnikov@gmail.com',
  telegram: 'https://t.me/lexandr0',
  telegramHandle: '@lexandr0',
  github: 'https://github.com/lexandro-design',
} as const

export const COORDS = '59.9311° N · 30.3609° E'

/** Разделы главной по порядку — для меток «02 / 08» */
export const SECTIONS = [
  'intro',
  'services',
  'works',
  'system',
  'process',
  'about',
  'principles',
  'contact',
] as const
export const SECTION_COUNT = SECTIONS.length
export const sectionIndex = (id: (typeof SECTIONS)[number]) => SECTIONS.indexOf(id) + 1

/** Проекты в бегущей строке первого экрана — берутся из кейсов по slug */
export const TICKER = ['parfumeria', 'otrx', 'meeting-rooms', 'ai-translator', 'pix-bi']

/** Фото на первом экране. Файл 460×460 — заменить на крупнее, как будет */
export const PHOTO = { src: '/me.jpg', w: 460, h: 460 }
