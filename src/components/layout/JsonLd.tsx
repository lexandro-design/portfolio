/** Запись знака «меньше» кодом: текст кейса внутри JSON не сможет закрыть тег script */
const LT = '\\' + 'u003c'

/** Структурированные данные страницы для поисковиков */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, LT) }} />
}
