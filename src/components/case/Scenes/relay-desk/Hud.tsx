'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useInView, useReduced } from '../kit'
import styles from './Extra.module.css'

/**
 * Четыре виджета из набора компонентов макета: 368 × 200, координаты и строки взяты с компонентов.
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
  svg.querySelector('[data-k="clip"]')?.setAttribute('width', String(368 * clamp(ms / SWEEP)))
  show(svg.querySelector('[data-k="now"]'), ms >= SWEEP + TICK)
}

const drawRing: Draw = (svg, ms) => {
  svg.querySelector('[data-k="spent"]')?.setAttribute('stroke-dashoffset', String(1 - move(clamp(ms / SLOW))))
}

const drawHeat: Draw = (svg, ms) => {
  svg.querySelectorAll('[data-col]').forEach((g) => show(g, ms > 0 && ms >= Number(g.getAttribute('data-col')) * STEP))
  show(svg.querySelector('[data-k="now"]'), ms >= 7 * STEP + TICK)
}

const drawRoute: Draw = (svg, ms) => {
  const p = clamp(ms / SWEEP)
  svg.querySelector('[data-k="clip"]')?.setAttribute('width', String(20 + 328 * p))
  svg.querySelectorAll('[data-at]').forEach((g) => show(g, ms > 0 && p >= (Number(g.getAttribute('data-at')) - 20) / 328))
  show(svg.querySelector('[data-k="ret"]'), ms >= (SWEEP * (252 - 20)) / 328 + TICK)
}

/** Один виджет: рисуется, когда попал в экран; при «меньше движения» сразу готовый */
function Widget({ name, draw, total, run, children }: { name: string; draw: Draw; total: number; run: number; children: (id: string) => ReactNode }) {
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
  }, [ref, inView, still, run, draw, total])

  return (
    <div ref={ref} className={styles.widget}>
      <svg viewBox="0 0 368 200" role="img" aria-label={name}>
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

const STATIONS: { x: number; name: string; at: number; end?: boolean; state: 'done' | 'on' | 'ahead' }[] = [
  { x: 14, name: 'BRIEF', at: 20, state: 'done' },
  { x: 76, name: 'QUEUE', at: 96, state: 'done' },
  { x: 144, name: 'DESK 03', at: 172, state: 'on' },
  { x: 228, name: 'REVIEW', at: 252, state: 'ahead' },
  { x: 354, name: 'SIGN-OFF', at: 348, end: true, state: 'ahead' },
]

export function Hud({ run }: { run: number }) {
  return (
    <div className={styles.widgets}>
      <Widget name="Load curve" draw={drawLoad} total={SWEEP + TICK * 2} run={run}>
        {(id) => (
          <>
            <T x={0} y={0}>LOAD / TASKS ON DESKS</T>
            <T x={368} y={0} end>
              PEAK 03:15
            </T>
            <text x="0" y="44" className={`${styles.value} ${styles.text}`}>
              14
            </text>
            <T x={56} y={44}>OF 22</T>
            {[80, 112, 144].map((y) => (
              <rect key={y} x="0" y={y} width="368" height="1" className={styles.lineSoft} />
            ))}
            <rect x="0" y="176" width="368" height="1" className={styles.line} />
            <clipPath id={id}>
              <rect data-k="clip" x="0" y="76" width="368" height="104" />
            </clipPath>
            <g clipPath={`url(#${id})`}>
              <path className={styles.accentGhost} transform="translate(0 104)" d="M0 64H23V56H46V40H69V32H92V16H115V24H138V0H170V72H0Z" />
              <path className={styles.curve} transform="translate(0 104)" d="M0 64H23V56H46V40H69V32H92V16H115V24H138V0H170" />
              <path className={styles.dashed} transform="translate(170 104)" d="M0 0H37V16H83V32H129V48H175V56H198" />
            </g>
            <g data-k="now">
              <rect x="170" y="80" width="1" height="96" className={styles.accentFill} />
              <rect x="166" y="100" width="8" height="8" className={styles.accentFill} />
            </g>
            {['00', '02', '04', '06'].map((h, i) => (
              <T key={h} x={[0, 84, 176, 268][i]} y={184}>
                {h}
              </T>
            ))}
            <T x={368} y={184} end>
              08
            </T>
          </>
        )}
      </Widget>

      <Widget name="Budget ring" draw={drawRing} total={SLOW} run={run}>
        {() => (
          <>
            <T x={0} y={0}>PERSON TIME / THIS SHIFT</T>
            <rect x="6" y="46" width="124" height="124" className={styles.track} />
            <path data-k="spent" className={styles.spent} d="M68 46H130V170H0" pathLength={1} strokeDasharray="1" />
            <rect x="67" y="36" width="2" height="20" className={styles.textFill} />
            <text x="68" y="98" textAnchor="middle" className={`${styles.value} ${styles.text}`}>
              25
            </text>
            <T x={68} y={122} mid>
              OF 40 MIN
            </T>
            {[40, 84, 128, 172].map((y) => (
              <rect key={y} x="168" y={y} width="200" height="1" className={styles.lineSoft} />
            ))}
            <T x={168} y={54}>SIGNED</T>
            <T x={368} y={54} end c="signal">
              09 TASKS
            </T>
            <T x={168} y={98}>RETURNED</T>
            <T x={368} y={98} end c="accent">
              02 TASKS
            </T>
            <T x={168} y={142}>WAITING</T>
            <T x={368} y={142} end c="text">
              03 TASKS
            </T>
          </>
        )}
      </Widget>

      <Widget name="Heatmap" draw={drawHeat} total={16 * STEP + TICK} run={run}>
        {() => (
          <>
            <T x={0} y={0}>LOAD BY DESK / HALF HOUR</T>
            <T x={252} y={0}>LOW</T>
            {['ghost', 'accentGhost', 'accentDim', 'accentFill'].map((c, i) => (
              <rect key={c} x={284 + i * 12} y="4" width="8" height="8" className={styles[c]} />
            ))}
            <T x={368} y={0} end>
              HIGH
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
                    <rect key={r} x={52.5 + i * 20} y={32.5 + r * 20} width="15" height="15" className={styles.planned} />
                  ) : (
                    <rect key={r} x={52 + i * 20} y={32 + r * 20} width="16" height="16" className={CELL[row[i]]} />
                  ),
                )}
              </g>
            ))}
            <rect data-k="now" x="192" y="152" width="16" height="2" className={styles.accentFill} />
            <T x={52} y={160}>00:00</T>
            <T x={212} y={160}>04:00</T>
            <T x={368} y={160} end>
              08:00
            </T>
            <T x={0} y={184}>OUTLINE / PLANNED</T>
          </>
        )}
      </Widget>

      <Widget name="Route map" draw={drawRoute} total={SWEEP + TICK} run={run}>
        {(id) => (
          <>
            <T x={0} y={0}>ROUTE / T-0412</T>
            <T x={368} y={0} end>
              STEP 3 / 5
            </T>
            <clipPath id={id}>
              <rect data-k="clip" x="0" y="60" width="368" height="24" />
            </clipPath>
            <g clipPath={`url(#${id})`}>
              <path className={styles.ahead} d="M172 72H348" />
              <path className={styles.doneLine} d="M20 72H172" />
            </g>
            <g data-k="ret">
              <path className={styles.ret} transform="translate(172 72)" d="M80 0 56 24H24L0 0" />
              <T x={176} y={104} c="accent">
                RETURN 01
              </T>
            </g>
            {STATIONS.map((s) => (
              <g key={s.name} data-at={s.at}>
                {s.state === 'on' && <rect x={s.at - 9.5} y="62.5" width="19" height="19" className={styles.ring} />}
                {s.state === 'ahead' ? (
                  <rect x={s.at - 5} y="67" width="10" height="10" className={styles.stationAhead} />
                ) : (
                  <rect x={s.at - 6} y="66" width="12" height="12" className={s.state === 'on' ? styles.accentFill : styles.textFill} />
                )}
                <T x={s.x} y={40} end={s.end} c={s.state === 'on' ? 'accent' : s.state === 'done' ? 'text' : 'text2'}>
                  {s.name}
                </T>
              </g>
            ))}
            <rect x="0" y="136" width="368" height="1" className={styles.lineSoft} />
            <rect x="0" y="156" width="8" height="8" className={styles.textFill} />
            <T x={16} y={152}>DONE</T>
            <rect x="72" y="156" width="8" height="8" className={styles.accentFill} />
            <T x={88} y={152}>ON DESK</T>
            <rect x="169" y="157" width="6" height="6" className={styles.legendAhead} />
            <T x={184} y={152}>AHEAD</T>
            <path className={styles.ret} d="M248 160h16" />
            <T x={272} y={152}>RETURN</T>
            <T x={0} y={184}>ENTERED 00:10</T>
            <T x={368} y={184} end>
              DUE 05:30
            </T>
          </>
        )}
      </Widget>
    </div>
  )
}
