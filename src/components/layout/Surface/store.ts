/** Выбор в примерочной: материал и оттенок. Нет материала — фон такой, каким его задаёт тема */
export type Choice = { material: string | null; tint: string }

const KEY = 'surface'
const EVENT = 'surfacechange'
export const EMPTY: Choice = { material: null, tint: 'natural' }

let current: Choice | null = null

export function readChoice(): Choice {
  if (current) return current
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Choice | null
    current = saved?.tint ? saved : EMPTY
  } catch {
    current = EMPTY
  }
  return current
}

export function saveChoice(next: Choice) {
  current = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}

export const subscribeChoice = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
