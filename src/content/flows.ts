import type { Case } from './cases'
import type { Showcase } from './showcase'

/**
 * «Как работает» для автоматизаций в карточке кейса: что пришло на вход,
 * по каким шагам прошёл запрос и что вышло. Ничего не пишется заново —
 * всё берётся из демо раскрытия, превью и схемы кейса, поэтому переводы
 * приходят сами. chain — цепочка шагов, route — запрос уходит по одной
 * из дорожек (маршрутизация FoodMarket, сценарии упаковки)
 */
export type Flow =
  | { variant: 'chain'; input?: string; steps: string[]; output?: string }
  | { variant: 'route'; lanes: { label: string; out: string }[]; items: { text: string; lane: number }[] }

const MAX = 4

const chain = (steps: string[], input?: string, output?: string): Flow => ({
  variant: 'chain',
  input,
  steps: steps.slice(0, MAX),
  output,
})

export function flowOf(item: Case, show: Showcase | null): Flow | null {
  // Только проекты без экранов: у дизайна в карточке остаётся картинка
  if (item.thumb || item.shots.length) return null
  const scheme = item.scheme?.kind === 'pipeline' ? item.scheme.steps.map((s) => s.label) : undefined
  const preview = item.preview?.kind === 'flow' ? item.preview.steps : undefined
  const fallback = scheme ?? preview ?? []
  const b = show?.blocks[0]

  switch (b?.kind) {
    case 'queue':
      return chain(b.stages, b.items[0])
    case 'trace':
      return chain(
        b.steps.map((s) => s.text),
        b.prompt,
        b.out,
      )
    case 'sort':
      return { variant: 'route', lanes: b.lanes, items: b.items }
    case 'voice':
      return chain(
        fallback,
        b.lines.find((l) => l.who === 'me')?.text,
        b.lines.find((l) => l.who === 'it')?.text,
      )
    case 'fusion':
      return chain([b.a.label, b.b.label, b.label], b.query, b.fused[0])
    case 'notify':
      return chain(fallback, b.items[0]?.text, b.items[0]?.actions[0])
    case 'diff':
      return chain(b.passes, b.was, b.now)
    case 'cards':
      return chain(fallback, b.items[0]?.text, b.items[0]?.tip)
    case 'timeline':
      return chain(
        b.events.map((e) => e.time),
        b.tick,
        b.events[0]?.text,
      )
    case 'transcript':
      return chain(fallback, b.lines[0]?.text, b.summary[0]?.text)
    case 'console':
      return chain(
        b.services.map((s) => s.name),
        b.window,
      )
    default:
      return fallback.length ? chain(fallback) : null
  }
}
