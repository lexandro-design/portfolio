import type { CSSProperties } from 'react'
import styles from './Stickers.module.css'

type Vars = CSSProperties & Record<`--${string}`, string | number>

const SYM = ['BAR', '🍋', '7️⃣', '🍇']
const LEN = 10

/** Лента барабана: итоговый символ первым, дальше «прокрутка» без повторов подряд */
const strip = (final: string, seed: number) => {
  const at = Math.max(0, SYM.indexOf(final))
  const step = seed === 1 ? 1 : 3
  return Array.from({ length: LEN }, (_, k) => (k === 0 ? final : SYM[(at + step * k) % SYM.length]))
}

/** Слот: три барабана крутятся и встают по очереди */
export function Slot({ reels, hit, settled }: { reels: string[]; hit: boolean; settled: boolean }) {
  return (
    <div className={styles.slot} data-settled={settled || undefined} data-win={hit || undefined} aria-hidden="true">
      {reels.map((r, i) => (
        <div key={i} className={styles.reel} style={{ '--i': i, '--n': LEN - 1 } as Vars}>
          <div className={styles.strip}>
            {strip(r, i).map((s, k) => (
              <span key={k} className={s === 'BAR' ? styles.bar : styles.sym}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Точки на гранях: какие из девяти клеток сетки заняты */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

/** Поворот куба, при котором к зрителю смотрит нужная грань */
const SHOW: Record<number, string> = {
  1: 'rotateX(0deg)',
  2: 'rotateY(-90deg)',
  3: 'rotateX(-90deg)',
  4: 'rotateX(90deg)',
  5: 'rotateY(90deg)',
  6: 'rotateY(180deg)',
}

/** Кубик: настоящий куб на CSS 3D, кувыркается и ложится нужной гранью */
export function Die({ value, settled }: { value: number; settled: boolean }) {
  return (
    <div className={styles.die} data-settled={settled || undefined} aria-hidden="true">
      <div className={styles.hop}>
        <div className={styles.cube} style={{ '--show': SHOW[value] } as Vars}>
          {[1, 2, 3, 4, 5, 6].map((f) => (
            <div key={f} className={styles.face} data-f={f}>
              {Array.from({ length: 9 }, (_, c) => (
                <i key={c} data-on={PIPS[f].includes(c) || undefined} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <i className={styles.floor} />
    </div>
  )
}

const RINGS = [56, 44, 32, 20]

/** Мишень: дротик прилетает и втыкается в яблочко или рядом */
export function Dart({ hit, settled }: { hit: boolean; settled: boolean }) {
  const [x, y] = hit ? [60, 60] : [86, 38]
  return (
    <svg className={styles.dart} viewBox="0 0 120 120" data-settled={settled || undefined} aria-hidden="true">
      {RINGS.map((r, i) => (
        <circle key={r} cx="60" cy="60" r={r} className={i % 2 ? styles.ringB : styles.ringA} />
      ))}
      <circle cx="60" cy="60" r="8" className={styles.bull} />
      <g transform={`translate(${x} ${y})`}>
        <g className={styles.shot}>
          <line x1="0" y1="0" x2="12" y2="-27" className={styles.shaft} />
          <polygon points="12,-27 25,-31 19,-42" className={styles.flight} />
          <polygon points="12,-27 3,-35 19,-42" className={styles.flightB} />
        </g>
      </g>
    </svg>
  )
}
