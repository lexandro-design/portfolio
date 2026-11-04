import { DEFAULT_THEME } from '@/content/site'
import { DEFAULT_LOCALE, HTML_LANG, LOCALES } from '@/i18n/config'

/**
 * Ставит тему и язык до первой отрисовки: иначе светлая тема моргает
 * тёмной, а японская страница первые кадры рисуется с русской типографикой.
 * Неон и тёплой больше нет: кто их выбирал, получает тёмную.
 * Заодно помечает <html> классом js: без него Reveal ничего не прячет.
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const langs = Object.fromEntries(
  LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => [l, HTML_LANG[l]]),
)

const script = `(function(){var d=document.documentElement;var t=${JSON.stringify(DEFAULT_THEME)};try{var s=localStorage.getItem('theme');if(s==='dark'||s==='light')t=s}catch(e){}d.dataset.theme=t;var l=${JSON.stringify(langs)},p=location.pathname.slice(${base.length}).split('/')[1];if(l[p])d.lang=l[p];d.classList.add('js')})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
