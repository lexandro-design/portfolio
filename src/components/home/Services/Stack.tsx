import type { ReactNode } from 'react'
import styles from './Stack.module.css'

const SIDE = 200
const COS = 0.866
const GAP = 132
const WIDTH = 400
const HALF = WIDTH / 2
const DEPTH = 10
/** Полуширина ромба плиты: сторона, повёрнутая на 30 градусов */
const REACH = SIDE * COS
const FIT = SIDE / 220

/** Что нарисовано на плите: плоский рисунок в квадрате 220, матрица кладёт его в изометрию */
const FACES: Record<string, ReactNode> = {
  design: (
    <>
      <rect x="18" y="18" width="184" height="20" />
      <rect x="18" y="46" width="184" height="66" data-fill />
      <rect x="18" y="120" width="56" height="46" />
      <rect x="82" y="120" width="56" height="46" />
      <rect x="146" y="120" width="56" height="46" />
      <circle cx="30" cy="188" r="11" data-fill />
      <circle cx="60" cy="188" r="11" />
      <rect x="146" y="176" width="56" height="24" data-fill />
    </>
  ),
  web: (
    <>
      <rect x="18" y="18" width="184" height="184" />
      <path d="M40 18v184" />
      {[
        [52, 74],
        [66, 104],
        [66, 56],
        [80, 92],
        [52, 40],
      ].map(([x, w], i) => (
        <rect key={x + w} x={x} y={36 + i * 20} width={w} height="7" data-fill={i % 2 === 0 || undefined} />
      ))}
      <rect x="52" y="146" width="136" height="16" />
      <rect x="52" y="168" width="136" height="16" data-fill />
    </>
  ),
  automation: (
    <>
      <path d="M46 46h40v64h48V46h40M46 174h40v-64M134 110v64h40" />
      <circle cx="46" cy="46" r="13" />
      <circle cx="46" cy="174" r="13" />
      <rect x="92" y="88" width="36" height="44" data-fill />
      <circle cx="174" cy="46" r="13" data-fill />
      <circle cx="174" cy="174" r="13" />
    </>
  ),
}

type Props = {
  /** Сверху вниз: как услуги в списке рядом */
  codes: string[]
  on: string[]
  hot: string | null
}

/** Продукт в разрезе: верхний слой видит посетитель, под ним код, в основании автоматизация. Отмеченная услуга занимает свою плиту */
export function Stack({ codes, on, hot }: Props) {
  const top = (i: number) => 14 + i * GAP
  const height = top(codes.length - 1) + SIDE + DEPTH + 26

  return (
    <svg className={styles.stack} viewBox={`0 0 ${WIDTH} ${height}`} aria-hidden="true">
      {[HALF - REACH, HALF + REACH].map((x) => (
        <path key={x} className={styles.guide} d={`M${x} ${top(0) + SIDE / 2}V${top(codes.length - 1) + SIDE / 2}`} />
      ))}
      {codes
        .map((code, i) => {
          const y = top(i)
          const mid = y + SIDE / 2
          const low = y + SIDE
          return (
            <g key={code} className={styles.plate} data-on={on.includes(code) || undefined} data-hot={hot === code || undefined}>
              <path
                className={styles.edge}
                d={`M${HALF - REACH} ${mid}L${HALF} ${low}L${HALF + REACH} ${mid}v${DEPTH}L${HALF} ${low + DEPTH}L${HALF - REACH} ${mid + DEPTH}Z`}
              />
              <path className={styles.top} d={`M${HALF} ${y}L${HALF + REACH} ${mid}L${HALF} ${low}L${HALF - REACH} ${mid}Z`} />
              <g className={styles.face} transform={`matrix(${COS * FIT} ${0.5 * FIT} ${-COS * FIT} ${0.5 * FIT} ${HALF} ${y})`}>
                {FACES[code]}
              </g>
            </g>
          )
        })
        .reverse()}
    </svg>
  )
}
