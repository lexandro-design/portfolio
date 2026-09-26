import data from './data/site.json'

/**
 * Контакты и то, что не зависит от языка. Контакты и координаты — в
 * data/site.json (их правит админка), тексты сайта — в data/dict.
 */

export const contacts = data.contacts

export const COORDS = data.coords

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
