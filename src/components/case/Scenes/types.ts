import type { Case } from '@/content/cases'
import type { Brief } from '@/content/showcase'
import type { Dict } from '@/i18n/dict'

/**
 * Сцена кейса: своя страница-история вместо общей шапки и плеера.
 * Общее у всех сцен только система: шрифты, сетка, токены тем, детали
 * шапки из kit/Head и панель kit/Controls. Композиция, ритм, анимация
 * работы и интерактив у каждой сцены свои
 */
export type SceneProps = {
  item: Case
  /** Номер кейса и подписи шапки на языке страницы */
  meta: { index: number; total: number; back: { href: string; label: string } }
  /** Факты шапки: клиент, год, направление, стек (и сайт, если есть) */
  facts: { label: string; value: string; href?: string }[]
  brief: Brief
  t: Dict['case']
  /** Данные сцены из content/data/scenes/<slug>.json на языке страницы */
  data: Record<string, unknown>
}
