import type { Case } from './cases'
import type { Cast, CastBeat, CastView } from './casts'
import type { Showcase } from './showcase'

/**
 * «Как работает» для автоматизаций в карточке кейса: что пришло на вход,
 * по каким шагам прошёл запрос и что вышло. Ничего не пишется заново —
 * всё берётся из демо раскрытия, превью и схемы кейса, поэтому переводы
 * приходят сами. chain — цепочка шагов, route — запрос уходит по одной
 * из дорожек (маршрутизация FoodMarket, сценарии упаковки)
 */
type Metric = { v: string; l: string }

export type Flow =
  | { variant: 'chain'; input?: string; steps: string[]; output?: string }
  | { variant: 'route'; lanes: { label: string; out: string }[]; items: { text: string; lane: number }[] }
  | { variant: 'voice'; me: string; reply: string; metric?: Metric }
  | { variant: 'queue'; stages: string[]; items: string[]; metric?: Metric }
  | { variant: 'board'; hub: string; desks: { name: string; group: string }[]; feed: { who: string; text: string }[] }
  | { variant: 'trace'; prompt: string; steps: string[]; out: string }
  | { variant: 'compare'; a: { src: string; label: string }; b: { src: string; label: string } }
  | { variant: 'view'; view: CastView; steps: NonNullable<CastBeat['v']>[] }
  | { variant: 'notify'; app: string; items: { text: string; actions: string[] }[] }
  | { variant: 'console'; window: string; services: { name: string; note: string }[] }
  | { variant: 'tracks'; lines: { t?: string; who: string; name?: string; text: string }[] }
  | { variant: 'diff'; was: string; now: string; labels: string[] }
  | { variant: 'frames'; metric?: Metric }

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
      return { variant: 'queue', stages: b.stages, items: b.items, metric: show?.brief.nums[0] }
    case 'board':
      return { variant: 'board', hub: b.hub.label, desks: b.desks, feed: b.feed }
    case 'trace':
      return { variant: 'trace', prompt: b.prompt, steps: b.steps.map((s) => s.text), out: b.out }
    case 'sort':
      return { variant: 'route', lanes: b.lanes, items: b.items }
    case 'voice':
      return {
        variant: 'voice',
        me: b.lines.find((l) => l.who === 'me')?.text ?? '',
        reply: b.lines.find((l) => l.who === 'it')?.text ?? '',
        metric: show?.brief.nums[0],
      }
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

/** Своя картинка кейса: что нельзя спутать с соседним. У остальных остаётся схема из раскрытия */
export function liveOf(item: Case, show: Showcase | null, cast: Cast | null): Flow | null {
  if (item.thumb || item.shots.length) return null
  const b = show?.blocks[0]
  switch (b?.kind) {
    case 'notify':
      return { variant: 'notify', app: b.app, items: b.items }
    case 'console':
      return { variant: 'console', window: b.window, services: b.services }
    case 'transcript':
      return { variant: 'tracks', lines: b.lines }
    case 'diff':
      return { variant: 'diff', was: b.was, now: b.now, labels: b.labels }
  }
  const view = cast?.view
  if (view?.kind === 'stages' && b?.kind === 'queue') {
    return { variant: 'frames', metric: show?.brief.nums[0] }
  }
  // Табло, маршрут, голос и очередь файлов в схеме читаются лучше, чем вид из плеера
  if (view && !['desks', 'lanes'].includes(view.kind) && cast?.screen !== 'voice' && cast?.screen !== 'view') {
    return { variant: 'view', view, steps: cast?.beats.flatMap((x) => (x.v ? [x.v] : [])) ?? [] }
  }
  return flowOf(item, show)
}

/** Превью в карточке: у проекта со сравнением два экрана под шторкой, остальное как в шапке кейса */
export function previewOf(item: Case, show: Showcase | null, cast: Cast | null): Flow | null {
  if (item.card) return null
  const b = show?.blocks.find((x) => x.kind === 'compare')
  const pair = b?.kind === 'compare' ? b.pairs[0] : undefined
  const [left, right] = pair ? [item.shots[pair.a], item.shots[pair.b]] : []
  if (b?.kind === 'compare' && left && right) {
    return { variant: 'compare', a: { src: left.src, label: b.a }, b: { src: right.src, label: b.b } }
  }
  return liveOf(item, show, cast)
}
