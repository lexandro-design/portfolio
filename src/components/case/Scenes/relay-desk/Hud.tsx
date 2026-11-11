'use client'

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { useInView, useReduced } from '../kit'
import styles from './Extra.module.css'

/**
 * Четыре виджета из набора компонентов макета: 368 × 200 и телефонный вариант 295 × 200, координаты взяты с компонентов.
 * Английские строки с компонентов, русские собраны по словарю русской версии макета.
 * Движение по листу Component Motion: кривая рисуется слева направо за 1200 мс и точка «сейчас» встаёт последней,
 * кольцо заполняется по часовой от нулевой отметки за 480 мс, клетки зажигаются по столбцам с шагом 40 мс,
 * линия маршрута идёт 1200 мс и включает станции, до которых дошла
 */

const SWEEP = 1200
const SLOW = 480
const STEP = 40
const TICK = 80

const clamp = (v: number) => Math.max(0, Math.min(1, v))

/** Кривая ease/move из токенов макета: cubic-bezier(0.2, 0, 0, 1) */
const move = (() => {
  const f = (t: number, a: number, b: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t * t + t ** 3
  return (x: number) => {
    let lo = 0
    let hi = 1
    for (let i = 0; i < 18; i++) {
      const m = (lo + hi) / 2
      if (f(m, 0.2, 0) < x) lo = m
      else hi = m
    }
    return f((lo + hi) / 2, 0, 1)
  }
})()

type Draw = (svg: SVGSVGElement, ms: number) => void
const show = (el: Element | null, on: boolean) => el?.setAttribute('opacity', on ? '1' : '0')

const drawLoad: Draw = (svg, ms) => {
  svg.querySelector('[data-k="clip"]')?.setAttribute('width', String(svg.viewBox.baseVal.width * clamp(ms / SWEEP)))
  show(svg.querySelector('[data-k="now"]'), ms >= SWEEP + TICK)
}

const drawRing: Draw = (svg, ms) => {
  svg.querySelector('[data-k="spent"]')?.setAttribute('stroke-dashoffset', String(1 - move(clamp(ms / SLOW))))
}

const drawHeat: Draw = (svg, ms) => {
  svg.querySelectorAll('[data-col]').forEach((g) => show(g, ms > 0 && ms >= Number(g.getAttribute('data-col')) * STEP))
  show(svg.querySelector('[data-k="now"]'), ms >= 7 * STEP + TICK)
}

/** Линия идёт от первой станции к последней; возврат появляется, когда линия дошла до проверки */
const drawRoute: Draw = (svg, ms) => {
  const at = [...svg.querySelectorAll('[data-at]')]
  const xs = at.map((g) => Number(g.getAttribute('data-at')))
  const x0 = Math.min(...xs)
  const span = Math.max(...xs) - x0
  const p = clamp(ms / SWEEP)
  svg.querySelector('[data-k="clip"]')?.setAttribute('width', String(x0 + span * p))
  at.forEach((g, i) => show(g, ms > 0 && p >= (xs[i] - x0) / span))
  const ret = svg.querySelector('[data-k="ret"]')
  show(ret, ms >= (SWEEP * (Number(ret?.getAttribute('data-from')) - x0)) / span + TICK)
}

/** Телефонный вариант виджетов: тот же порог, что у вёрстки блока */
const NARROW = '(max-width: 767px)'
const watch = (cb: () => void) => {
  const m = window.matchMedia(NARROW)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const useNarrow = () =>
  useSyncExternalStore(
    watch,
    () => window.matchMedia(NARROW).matches,
    () => false,
  )

/** Один виджет: рисуется, когда попал в экран; при «меньше движения» сразу готовый */
function Widget({ name, draw, total, run, w, h = 200, children }: { name: string; draw: Draw; total: number; run: number; w: number; h?: number; children: (id: string) => ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const still = useReduced()
  const done = useRef(-1)
  const id = useId()

  useEffect(() => {
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    if (still || done.current === run) {
      draw(svg, Infinity)
      return
    }
    if (!inView) {
      draw(svg, 0)
      return
    }
    const t0 = performance.now()
    let raf = 0
    const frame = () => {
      const ms = performance.now() - t0
      draw(svg, ms)
      if (ms < total) raf = requestAnimationFrame(frame)
      else done.current = run
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [ref, inView, still, run, draw, total, w, h])

  return (
    <div ref={ref} className={styles.widget}>
      <svg key={`${w}-${h}`} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={name}>
        {children(id)}
      </svg>
    </div>
  )
}

/** Подпись 12/16: левый край или правый, как на макете */
function T({ x, y, end, mid, c = 'muted', children }: { x: number; y: number; end?: boolean; mid?: boolean; c?: 'muted' | 'text' | 'text2' | 'accent' | 'signal'; children: ReactNode }) {
  return (
    <text x={x} y={y + 8} className={`${styles.wl} ${styles[c]}`} textAnchor={end ? 'end' : mid ? 'middle' : undefined}>
      {children}
    </text>
  )
}

/** Загрузка столов по получасам: шесть столов, шестнадцать клеток. g пусто, a мало, d средне, b много, p в плане */
const HEAT = ['dbaddabdpgppgggg', 'gaddbbddppppgggg', 'bddadbbbgppppggg', 'ggaddadappppgggg', 'addbdaadppppppgg', 'gggggggggggpppgg']
const CELL: Record<string, string> = { g: styles.ghost, a: styles.accentGhost, d: styles.accentDim, b: styles.accentFill }

type Lang = 'en' | 'ru'
type One = 'load' | 'peak' | 'of22' | 'time' | 'of40' | 'wait' | 'heat' | 'heatShort' | 'low' | 'high' | 'planned' | 'route' | 'step' | 'lastShort' | 'ret' | 'entered' | 'due'
type Many = 'keys' | 'counts' | 'stations' | 'legend'

const COPY: Record<Lang, Record<One, string> & Record<Many, string[]>> = {
  en: {
    load: 'LOAD / TASKS ON DESKS',
    peak: 'PEAK 03:15',
    of22: 'OF 22',
    time: 'PERSON TIME / THIS SHIFT',
    of40: 'OF 40 MIN',
    keys: ['SIGNED', 'RETURNED', 'WAITING'],
    counts: ['09 TASKS', '02 TASKS', '03 TASKS'],
    wait: 'WAITING 00:04:12',
    heat: 'LOAD BY DESK / HALF HOUR',
    heatShort: 'LOAD / HALF HOUR',
    low: 'LOW',
    high: 'HIGH',
    planned: 'OUTLINE / PLANNED',
    route: 'ROUTE / T-0412',
    step: 'STEP 3 / 5',
    stations: ['BRIEF', 'QUEUE', 'DESK 03', 'REVIEW', 'SIGN-OFF'],
    lastShort: 'SIGN',
    ret: 'RETURN 01',
    legend: ['DONE', 'ON DESK', 'AHEAD', 'RETURN'],
    entered: 'ENTERED 00:10',
    due: 'DUE 05:30',
  },
  ru: {
    load: 'ЗАГРУЗКА / ЗАДАЧ НА СТОЛАХ',
    peak: 'ПИК 03:15',
    of22: 'ИЗ 22',
    time: 'ВРЕМЯ ЧЕЛОВЕКА / ЗА СМЕНУ',
    of40: 'ИЗ 40 МИН',
    keys: ['ПОДПИСАНО', 'ВОЗВРАТЫ', 'ЖДУТ'],
    counts: ['09 ЗАДАЧ', '02 ЗАДАЧИ', '03 ЗАДАЧИ'],
    wait: 'ОЖИДАНИЕ 00:04:12',
    heat: 'ЗАГРУЗКА ПО СТОЛАМ / ПОЛЧАСА',
    heatShort: 'ЗАГРУЗКА / ПОЛЧАСА',
    low: 'МИН',
    high: 'МАКС',
    planned: 'КОНТУР / В ПЛАНЕ',
    route: 'МАРШРУТ / T-0412',
    step: 'ШАГ 3 / 5',
    stations: ['БРИФ', 'ОЧЕРЕДЬ', 'СТОЛ 03', 'ПРОВЕРКА', 'ПОДПИСЬ'],
    lastShort: 'ПОДПИСЬ',
    ret: 'ВОЗВРАТ 01',
    legend: ['ГОТОВО', 'НА СТОЛЕ', 'ВПЕРЕДИ', 'ВОЗВРАТ'],
    entered: 'ПОСТУПИЛА 00:10',
    due: 'СРОК 05:30',
  },
}

/** Координаты двух вариантов компонента: десктоп 368 и телефон 295 */
const GEO = {
  wide: {
    w: 368,
    load: { area: 'M0 64H23V56H46V40H69V32H92V16H115V24H138V0H170', forecast: 'M0 0H37V16H83V32H129V48H175V56H198', now: 170, hours: [0, 84, 176, 268] },
    ring: { size: 124, spent: 'M68 46H130V170H0', cx: 68, cy: 98, rules: [40, 84, 128, 172], rows: [54, 98, 142], side: 168, foot: false },
    heat: { x0: 52, pitch: 20, cell: 16 },
    route: { at: [20, 96, 172, 252, 348], back: 'M80 0 56 24H24L0 0', ret: 176, gap: 8, between: 24 },
  },
  narrow: {
    w: 295,
    load: { area: 'M0 64H18V56H37V40H55V32H74V16H92V24H111V0H136', forecast: 'M0 0H30V16H67V32H104V48H141V56H159', now: 136, hours: [0, 66, 140, 214] },
    ring: { size: 108, spent: 'M60 46H114V154H0', cx: 60, cy: 90, rules: [40, 80, 120, 160], rows: [52, 92, 132], side: 144, foot: true },
    heat: { x0: 41, pitch: 16, cell: 14 },
    route: { at: [12, 80, 148, 216, 283], back: 'M68 0 48 24H20L0 0', ret: 146, gap: 4, between: 16 },
  },
}

/** Ширина подписи 12 px с разрядкой 0.8: восемь пикселей на знак */
const CH = 8
const STATE = ['done', 'done', 'on', 'ahead', 'ahead'] as const
const COUNT = ['signal', 'accent', 'text'] as const

export function Hud({ run, lang }: { run: number; lang: Lang }) {
  const narrow = useNarrow()
  const g = narrow ? GEO.narrow : GEO.wide
  const c = COPY[lang]
  const { w } = g

  // Маршрут: на телефоне имя последней станции короче; если и так не встаёт в ряд, подпись уходит под станцию
  const at = g.route.at
  const names = narrow ? [...c.stations.slice(0, 4), c.lastShort] : c.stations
  const lastBelow = at[3] + (names[3].length * CH) / 2 + CH > at[4] + 6 - names[4].length * CH
  // Легенда маршрута: в ряд, пока помещается, иначе вторая строка
  const legend = c.legend.reduce<{ x: number; y: number; tx: number; name: string }[]>((list, name, i) => {
    const mark = i === 3 ? 16 + 8 : 8 + g.route.gap
    const prev = list[i - 1]
    let x = prev ? prev.tx + prev.name.length * CH + g.route.between : 0
    let y = prev ? prev.y : 152
    if (x + mark + name.length * CH > w + 1) {
      x = 0
      y += 20
    }
    return [...list, { x, y, tx: x + mark, name }]
  }, [])
  const more = legend[3].y - 152

  return (
    <div className={styles.widgets}>
      <Widget name="Load curve" draw={drawLoad} total={SWEEP + TICK * 2} run={run} w={w}>
        {(id) => (
          <>
            <T x={0} y={0}>
              {c.load}
            </T>
            <T x={w} y={0} end>
              {c.peak}
            </T>
            <text x="0" y="44" className={`${styles.value} ${styles.text}`}>
              14
            </text>
            <T x={56} y={44}>
              {c.of22}
            </T>
            {[80, 112, 144].map((y) => (
              <rect key={y} x="0" y={y} width={w} height="1" className={styles.lineSoft} />
            ))}
            <rect x="0" y="176" width={w} height="1" className={styles.line} />
            <clipPath id={id}>
              <rect data-k="clip" x="0" y="76" width={w} height="104" />
            </clipPath>
            <g clipPath={`url(#${id})`}>
              <path className={styles.accentGhost} transform="translate(0 104)" d={`${g.load.area}V72H0Z`} />
              <path className={styles.curve} transform="translate(0 104)" d={g.load.area} />
              <path className={styles.dashed} transform={`translate(${g.load.now} 104)`} d={g.load.forecast} />
            </g>
            <g data-k="now">
              <rect x={g.load.now} y="80" width="1" height="96" className={styles.accentFill} />
              <rect x={g.load.now - 4} y="100" width="8" height="8" className={styles.accentFill} />
            </g>
            {['00', '02', '04', '06'].map((h, i) => (
              <T key={h} x={g.load.hours[i]} y={184}>
                {h}
              </T>
            ))}
            <T x={w} y={184} end>
              08
            </T>
          </>
        )}
      </Widget>

      <Widget name="Budget ring" draw={drawRing} total={SLOW} run={run} w={w}>
        {() => (
          <>
            <T x={0} y={0}>
              {c.time}
            </T>
            <rect x="6" y="46" width={g.ring.size} height={g.ring.size} className={styles.track} />
            <path data-k="spent" className={styles.spent} d={g.ring.spent} pathLength={1} strokeDasharray="1" />
            <rect x={g.ring.cx - 1} y="36" width="2" height="20" className={styles.textFill} />
            <text x={g.ring.cx} y={g.ring.cy} textAnchor="middle" className={`${styles.value} ${styles.text}`}>
              25
            </text>
            <T x={g.ring.cx} y={g.ring.cy + 24} mid>
              {c.of40}
            </T>
            {g.ring.rules.map((y) => (
              <rect key={y} x={g.ring.side} y={y} width={w - g.ring.side} height="1" className={styles.lineSoft} />
            ))}
            {g.ring.rows.map((y, i) => (
              <g key={y}>
                <T x={g.ring.side} y={y}>
                  {c.keys[i]}
                </T>
                <T x={w} y={y} end c={COUNT[i]}>
                  {c.counts[i]}
                </T>
              </g>
            ))}
            {g.ring.foot && (
              <T x={0} y={184}>
                {c.wait}
              </T>
            )}
          </>
        )}
      </Widget>

      <Widget name="Heatmap" draw={drawHeat} total={16 * STEP + TICK} run={run} w={w}>
        {() => (
          <>
            <T x={0} y={0}>
              {narrow ? c.heatShort : c.heat}
            </T>
            <T x={w - 92} y={0} end>
              {c.low}
            </T>
            {['ghost', 'accentGhost', 'accentDim', 'accentFill'].map((cls, i) => (
              <rect key={cls} x={w - 84 + i * 12} y="4" width="8" height="8" className={styles[cls]} />
            ))}
            <T x={w} y={0} end>
              {c.high}
            </T>
            {HEAT.map((_, r) => (
              <T key={r} x={0} y={32 + r * 20}>
                0{r + 1}
              </T>
            ))}
            {Array.from({ length: 16 }, (_, i) => (
              <g key={i} data-col={i}>
                {HEAT.map((row, r) =>
                  row[i] === 'p' ? (
                    <rect key={r} x={g.heat.x0 + 0.5 + i * g.heat.pitch} y={32.5 + r * 20} width={g.heat.cell - 1} height="15" className={styles.planned} />
                  ) : (
                    <rect key={r} x={g.heat.x0 + i * g.heat.pitch} y={32 + r * 20} width={g.heat.cell} height="16" className={CELL[row[i]]} />
                  ),
                )}
              </g>
            ))}
            <rect data-k="now" x={g.heat.x0 + 7 * g.heat.pitch} y="152" width={g.heat.cell} height="2" className={styles.accentFill} />
            <T x={g.heat.x0} y={160}>
              00:00
            </T>
            <T x={g.heat.x0 + 8 * g.heat.pitch} y={160}>
              04:00
            </T>
            <T x={w} y={160} end>
              08:00
            </T>
            <T x={0} y={184}>
              {c.planned}
            </T>
          </>
        )}
      </Widget>

      <Widget name="Route map" draw={drawRoute} total={SWEEP + TICK} run={run} w={w} h={200 + more}>
        {(id) => (
          <>
            <T x={0} y={0}>
              {c.route}
            </T>
            <T x={w} y={0} end>
              {c.step}
            </T>
            <clipPath id={id}>
              <rect data-k="clip" x="0" y="60" width={w} height="24" />
            </clipPath>
            <g clipPath={`url(#${id})`}>
              <path className={styles.ahead} d={`M${at[2]} 72H${at[4]}`} />
              <path className={styles.doneLine} d={`M${at[0]} 72H${at[2]}`} />
            </g>
            <g data-k="ret" data-from={at[3]}>
              <path className={styles.ret} transform={`translate(${at[2]} 72)`} d={g.route.back} />
              <T x={g.route.ret} y={104} c="accent">
                {c.ret}
              </T>
            </g>
            {at.map((x, i) => {
              const state = STATE[i]
              const last = i === 4
              return (
                <g key={x} data-at={x}>
                  {state === 'on' && <rect x={x - 9.5} y="62.5" width="19" height="19" className={styles.ring} />}
                  {state === 'ahead' ? (
                    <rect x={x - 5} y="67" width="10" height="10" className={styles.stationAhead} />
                  ) : (
                    <rect x={x - 6} y="66" width="12" height="12" className={state === 'on' ? styles.accentFill : styles.textFill} />
                  )}
                  <T x={i === 0 ? x - 6 : last ? x + 6 : x} y={last && lastBelow ? 88 : 40} end={last} mid={i > 0 && !last} c={state === 'on' ? 'accent' : state === 'done' ? 'text' : 'text2'}>
                    {names[i]}
                  </T>
                </g>
              )
            })}
            <rect x="0" y="136" width={w} height="1" className={styles.lineSoft} />
            {legend.map((l, i) => (
              <g key={l.name}>
                {i === 0 && <rect x={l.x} y={l.y + 4} width="8" height="8" className={styles.textFill} />}
                {i === 1 && <rect x={l.x} y={l.y + 4} width="8" height="8" className={styles.accentFill} />}
                {i === 2 && <rect x={l.x + 1} y={l.y + 5} width="6" height="6" className={styles.legendAhead} />}
                {i === 3 && <path className={styles.ret} d={`M${l.x} ${l.y + 8}h16`} />}
                <T x={l.tx} y={l.y}>
                  {l.name}
                </T>
              </g>
            ))}
            <T x={0} y={184 + more}>
              {c.entered}
            </T>
            <T x={w} y={184 + more} end>
              {c.due}
            </T>
          </>
        )}
      </Widget>
    </div>
  )
}
