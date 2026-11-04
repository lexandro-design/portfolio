import { asset } from '@/lib/asset'

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const CYRILLIC = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'

const face = (family: string, weight: string, file: string, range: string) =>
  `@font-face{font-family:'${family}';font-style:normal;font-display:swap;font-weight:${weight};src:url(${asset(`/fonts/${file}.woff2`)}) format('woff2');unicode-range:${range}}`

const css = [
  face('Inter Variable', '100 900', 'inter-latin', LATIN),
  face('Inter Variable', '100 900', 'inter-cyrillic', CYRILLIC),
  face('Inter Variable', '100 900', 'inter-rub', 'U+20BD'),
  face('Cormorant Variable', '300 700', 'cormorant-latin', LATIN),
  face('Cormorant Variable', '300 700', 'cormorant-cyrillic', CYRILLIC),
  face('Cormorant Variable', '300 700', 'cormorant-rub', 'U+20BD'),
  face('JetBrains Mono Variable', '100 800', 'jetbrains-latin', LATIN),
].join('')

/** Шрифты объявлены прямо в HTML: браузер находит их раньше, чем дочитает файлы стилей */
export function Fonts() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
