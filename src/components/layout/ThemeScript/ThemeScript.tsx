/**
 * Ставит тему до первой отрисовки, иначе светлая тема моргает тёмной.
 * Заодно помечает <html> классом js: без него Reveal ничего не прячет.
 */
const script = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='warm'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}document.documentElement.classList.add('js')`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
