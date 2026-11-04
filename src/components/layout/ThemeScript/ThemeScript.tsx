import { DEFAULT_THEME, THEMES } from '@/content/site'
import { DEFAULT_LOCALE, HTML_LANG, LOCALES } from '@/i18n/config'

/**
 * Тёплой темы больше нет (2026-09-27): кто её выбирал, получает неон.
 * Ставит тему и язык до первой отрисовки: иначе светлая тема моргает
 * тёмной, а японская страница первые кадры рисуется с русской типографикой.
 * Заодно помечает <html> классом js: без него Reveal ничего не прячет.
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const langs = Object.fromEntries(
  LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => [l, HTML_LANG[l]]),
)

const script = `(function(){var d=document.documentElement;var t=${JSON.stringify(DEFAULT_THEME)};try{var s=localStorage.getItem('theme');if(s==='warm')s='neon';if(${JSON.stringify(THEMES)}.indexOf(s)>-1)t=s}catch(e){}d.dataset.theme=t;var l=${JSON.stringify(langs)},p=location.pathname.slice(${base.length}).split('/')[1];if(l[p])d.lang=l[p];d.classList.add('js')})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
