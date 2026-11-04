import data from './data/site.json'

/**
 * Контакты и то, что не зависит от языка. Контакты и координаты — в
 * data/site.json (их правит админка), тексты сайта — в data/dict.
 */

export const contacts = data.contacts

export const COORDS = data.coords

export type Theme = 'dark' | 'neon' | 'light'
export const THEMES: Theme[] = ['dark', 'neon', 'light']

/** Что включено на сайте — переключается во вкладке «Настройки» админки */
export const features = data.features as { brief: boolean; palette: boolean; sandbox: boolean }

/** Тема для тех, кто ещё не выбирал сам */
export const DEFAULT_THEME = (THEMES as string[]).includes(data.defaultTheme)
  ? (data.defaultTheme as Theme)
  : 'dark'

/** Цвета акцента, которые можно выбрать в песочнице блока «Система» */
export const SANDBOX_ACCENTS: string[] = data.sandbox.accents
