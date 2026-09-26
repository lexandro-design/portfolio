// Кейсы для картинок — из того же источника, что сайт. Номер — место в общем списке.
// Профиль GitHub на английском: названия, подзаголовки и лиды берём из перевода сайта
import { cases as all } from '../../src/content/cases.ts'
import { en } from '../../src/content/cases-i18n/en.ts'

// Стек в кейсах записан по-русски там, где это не название технологии
const STACK_EN = {
  'Дизайн-система': 'Design system',
  'Дизайн-система AIPlan-R': 'AIPlan-R design system',
  Прототип: 'Prototype',
  Адаптив: 'Responsive',
  'UI-кит': 'UI kit',
  'Анимация по скроллу': 'Scroll animation',
  'Светлая и тёмная тема': 'Light and dark themes',
  Дашборды: 'Dashboards',
  'Vision-модель': 'Vision model',
  Эмбеддинги: 'Embeddings',
  '152-ФЗ': '152-FZ',
}

export const cases = all.map((c, i) => ({ ...c, index: i + 1 }))

export const casesEn = cases.map((c) => {
  const t = en[c.slug]
  return {
    ...c,
    title: t?.title ?? c.title,
    tagline: t?.tagline ?? c.tagline,
    lead: t?.lead ?? c.lead,
    stack: c.stack.filter((s) => s !== 'Taiga UI').map((s) => STACK_EN[s] ?? s),
  }
})
