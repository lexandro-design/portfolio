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

/**
 * Фото на первом экране в шести форматах — нарезаны из одного снимка,
 * кроп 4:5 с Лахтой за плечом. mask — монохромный формат: файл хранит
 * только рисунок, цвет даёт тема сайта (см. HeroPhoto). id — подпись
 * формата под фото, на всех языках одинаковая
 */
export const PHOTO = {
  w: 720,
  h: 900,
  formats: [
    { id: 'photo', src: '/me/photo.jpg', mask: false },
    { id: 'engraving', src: '/me/lines.png', mask: true },
    { id: 'dither', src: '/me/dots.png', mask: true },
    { id: 'ascii', src: '/me/ascii.png', mask: true },
    { id: 'halftone', src: '/me/halftone.png', mask: true },
    { id: 'pixels', src: '/me/pixels.jpg', mask: false },
  ],
}
