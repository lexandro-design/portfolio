/**
 * Языки сайта. Русский — основной и живёт без префикса (/, /cases/…),
 * остальные под своим: /en/, /zh/, /ja/. Так старые ссылки на кейсы
 * из профиля и мессенджеров продолжают работать.
 */

export const LOCALES = ['ru', 'en', 'zh', 'ja'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ru'

/** Языки с префиксом в адресе — для generateStaticParams */
export const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  zh: '中文',
  ja: '日本語',
}

/** Значение для <html lang> и og:locale */
export const HTML_LANG: Record<Locale, string> = { ru: 'ru', en: 'en', zh: 'zh-CN', ja: 'ja' }
export const OG_LOCALE: Record<Locale, string> = {
  ru: 'ru_RU',
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
}

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v)

/** Путь внутри сайта с префиксом языка: localePath('en', '/cases/otrx/') → /en/cases/otrx/ */
export const localePath = (locale: Locale, path = '/') =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path}`

/** Язык и путь без префикса из адреса страницы (без basePath) */
export function splitPath(pathname: string): { locale: Locale; rest: string } {
  const [, first, ...tail] = pathname.split('/')
  if (first && isLocale(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, rest: `/${tail.join('/')}` }
  }
  return { locale: DEFAULT_LOCALE, rest: pathname || '/' }
}
