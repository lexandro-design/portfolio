import data from './data/site.json'

/**
 * Контакты и то, что не зависит от языка. Контакты и координаты — в
 * data/site.json (их правит админка), тексты сайта — в data/dict.
 */

export const contacts = data.contacts

export const COORDS = data.coords

export type Theme = 'dark' | 'light' | 'steel' | 'space' | 'calm'

/** Что включено на сайте — переключается во вкладке «Настройки» админки */
export const features = data.features as { brief: boolean; palette: boolean; sandbox: boolean; steel: boolean; calm: boolean }

/** Стандартные темы. Остальные дополнительные, в переключателе стоят за чертой */
export const BASE_THEMES: Theme[] = ['dark', 'light']

/** Порядок кнопок в переключателе. Сталь и спокойный вид отключаются своими флагами */
export const THEMES: Theme[] = [
  ...BASE_THEMES,
  ...(features.steel ? (['steel'] as const) : []),
  'space',
  ...(features.calm ? (['calm'] as const) : []),
]

/** Темы, у которых фон рисует сцена Sky: её код и текстуры грузятся только при выборе такой темы */
export const SKY_THEMES: Theme[] = ['space']

/** Тема для тех, кто ещё не выбирал сам */
export const DEFAULT_THEME = (THEMES as string[]).includes(data.defaultTheme)
  ? (data.defaultTheme as Theme)
  : 'dark'

/** Цвета акцента, которые можно выбрать в песочнице блока «Система» */
export const SANDBOX_ACCENTS: string[] = data.sandbox.accents

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
  /* Снимки идут по очереди, каждый проходит все форматы. Новый снимок нарезает tools/me/photo-formats.py */
  formats: data.heroPhotos.flatMap((dir) => [
    { id: 'photo', src: `${dir}/photo.jpg`, mask: false },
    { id: 'engraving', src: `${dir}/lines.png`, mask: true },
    { id: 'dither', src: `${dir}/dots.png`, mask: true },
    { id: 'ascii', src: `${dir}/ascii.png`, mask: true },
    { id: 'halftone', src: `${dir}/halftone.png`, mask: true },
    { id: 'pixels', src: `${dir}/pixels.jpg`, mask: false },
  ]),
}
