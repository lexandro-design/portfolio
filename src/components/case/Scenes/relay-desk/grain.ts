import type { Theme } from './tokens'

/**
 * Кольцо зерна под стопкой: холст, сетка 8 px, порог по матрице Байера 8 × 8 плюс шум,
 * точки трёх размеров 2 / 4 / 6 px. Числа взяты из листов движения макета
 */

/** Такт сцены: кадр зерна и шаг метки по орбите, около 12 кадров в секунду */
export const TICK = 80

export type Region = { x: number; y: number; w: number; h: number }
/** Вся сцена макета: кольцо выступает за кадр стопки слева и снизу */
export const R_WIDE: Region = { x: -16, y: 0, w: 768, h: 496 }
/** Узкий экран: только стопка и кольцо, без выносок и подписей */
export const R_SLIM: Region = { x: 32, y: 0, w: 608, h: 480 }

type Cell = { x: number; y: number; r: number; a: number; b: number }

const GRID = 8
/** Центр кольца под нижним уровнем и его радиусы: эллипс 2:1 в плоскости изометрии */
const CX = 336
const CY = 316
const RX = 288
const RY = 144
/** Орбита метки задачи: чуть шире кольца, оборот за 6 секунд */
const ORBIT = { rx: 296, ry: 148, turn: 6000 }

const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

/** Силуэт стопки с запасом: под ней зерна нет */
const STACK = [
  [336, -4],
  [540, 98],
  [540, 342],
  [336, 444],
  [132, 342],
  [132, 98],
]

function inStack(x: number, y: number) {
  for (let i = 0; i < STACK.length; i++) {
    const [ax, ay] = STACK[i]
    const [bx, by] = STACK[(i + 1) % STACK.length]
    if ((bx - ax) * (y - ay) - (by - ay) * (x - ax) < 0) return false
  }
  return true
}

/** Клетки кольца: всё, что не зависит от времени, считается один раз */
export function cellsOf(region: Region, slim: boolean): Cell[] {
  const cells: Cell[] = []
  const x0 = Math.floor(region.x / GRID) * GRID
  for (let gy = 0; gy < region.y + region.h; gy += GRID) {
    for (let gx = x0; gx < region.x + region.w; gx += GRID) {
      const x = gx + GRID / 2
      const y = gy + GRID / 2
      if (inStack(x, y)) continue
      // Вырезы под подписи уровней и каналы выносок
      if (!slim && x > 608 && y < 356) continue
      if (!slim && x > 528 && [216, 272, 328].some((ly) => Math.abs(y - ly) < 10)) continue
      const dx = (x - CX) / RX
      const dy = (y - CY) / RY
      const r = Math.hypot(dx, dy)
      if (r < 0.35 || r > 1.3) continue
      cells.push({ x, y, r, a: Math.atan2(dy, dx), b: BAYER[(gy / GRID) & 7][((gx - x0) / GRID) & 7] / 64 })
    }
  }
  return cells
}

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const noise = (x: number, y: number, f: number) => {
  const v = Math.sin(x * 12.9898 + y * 78.233 + f * 37.719) * 43758.5453
  return v - Math.floor(v)
}

/** Кадр зерна на момент ms. frozen: готовое кольцо без входа и шума по времени */
export function paint(cv: HTMLCanvasElement, cells: Cell[], region: Region, theme: Theme, ms: number, frozen: boolean) {
  const ctx = cv.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, cv.width, cv.height)
  // Вход: кольцо появляется первым, 0.1–1.3 с, масштаб 0.6 → 1
  const p = frozen ? 1 : clamp((ms - 100) / 1200)
  if (p <= 0) return
  const enter = 1 - (1 - p) ** 4
  const scale = 0.6 + 0.4 * enter
  const turn = frozen ? 0 : (ms / 16000) * Math.PI * 2
  const f = frozen ? 0 : Math.floor(ms / (TICK * 2))
  const k = cv.width / region.w
  const layers: [string, number, number[]][] = [
    [theme.accentDim, 2, []],
    [theme.accent, 4, []],
    [theme.text, 6, []],
  ]
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]
    const rr = c.r / scale
    const band = Math.exp(-(((rr - 0.84) / 0.15) ** 2))
    if (band < 0.02) continue
    // Три рукава медленно идут по кругу; передняя дуга ярче задней, левая сторона ярче правой
    const arms = 0.7 + 0.3 * Math.cos(3 * (c.a - turn) + rr * 5)
    const front = 0.3 + 0.7 * clamp((Math.sin(c.a) + 0.35) / 0.9)
    const side = 1 - 0.12 * Math.cos(c.a)
    const v = band * arms * front * side * enter + (noise(c.x, c.y, f) - 0.5) * 0.22 * Math.sqrt(band) - (c.b - 0.5) * 0.3
    if (v > 0.74) layers[2][2].push(i)
    else if (v > 0.3) layers[1][2].push(i)
    else if (v > 0.1) layers[0][2].push(i)
  }
  for (const [color, dot, list] of layers) {
    ctx.fillStyle = color
    const w = Math.max(1, Math.round(dot * k))
    for (const i of list) {
      const c = cells[i]
      ctx.fillRect(Math.round((c.x - region.x) * k - w / 2), Math.round((c.y - region.y) * k - w / 2), w, w)
    }
  }
}

/** Место метки задачи на орбите: старт внизу, шаг на каждый такт */
export function taskAt(ms: number): [number, number] {
  const a = Math.PI / 2 + (Math.floor(ms / TICK) * TICK * Math.PI * 2) / ORBIT.turn
  return [Math.round(CX + ORBIT.rx * Math.cos(a)), Math.round(CY + ORBIT.ry * Math.sin(a))]
}
