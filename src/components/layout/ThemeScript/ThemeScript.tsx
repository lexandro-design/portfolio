import { DEFAULT_LOCALE, HTML_LANG, LOCALES } from '@/i18n/config'

/**
 * Тема у страницы одна, светлая и неоновая остались демо в блоке «Система».
 * Язык ставит до первой отрисовки: иначе японская страница первые кадры
 * рисуется с русской типографикой.
 * Заодно помечает <html> классом js: без него Reveal ничего не прячет.
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const langs = Object.fromEntries(
  LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => [l, HTML_LANG[l]]),
)

const script = `(function(){var d=document.documentElement;d.dataset.theme='dark';var l=${JSON.stringify(langs)},p=location.pathname.slice(${base.length}).split('/')[1];if(l[p])d.lang=l[p];d.classList.add('js')})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
