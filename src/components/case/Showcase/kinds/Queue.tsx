'use client'

import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Queue.module.css'

type Props = { block: Extract<Block, { kind: 'queue' }> }

/**
 * Конвейер: этапы колонками, задания идут по ним друг за другом с шагом
 * в один этап. Колонка, где сейчас есть задание, подсвечена, внизу счётчик
 * готового
 */
export function Queue({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const s = block.stages.length
  const n = block.items.length
  // Последнее задание выходит из последнего этапа на шаге n + s - 1
  const step = useScript(n + s, 1000, inView, 3)
  const at = (k: number) => step - k // этап задания k: <0 ещё не пришло, >=s уже готово
  const ready = block.items.filter((_, k) => at(k) >= s).length

  return (
    <div ref={ref} className={styles.root}>
      <ol className={styles.stages} style={{ gridTemplateColumns: `repeat(${s}, minmax(0, 1fr))` }}>
        {block.stages.map((st, j) => {
          const here = block.items.map((it, k) => ({ it, k })).filter(({ k }) => at(k) === j)
          return (
            <li key={st} className={styles.stage} data-on={here.length > 0 || undefined}>
              <span className={styles.head}>
                <span className={kit.mono}>{String(j + 1).padStart(2, '0')}</span>
                <b>{st}</b>
              </span>
              <span className={styles.slot}>
                {here.map(({ it, k }) => (
                  <span key={k} className={`${styles.job} ${kit.enter}`}>
                    {it}
                  </span>
                ))}
              </span>
            </li>
          )
        })}
      </ol>
      <div className={styles.done}>
        {block.items.map((it, k) => (
          <span key={k} className={styles.tick} data-on={at(k) >= s || undefined} title={it} />
        ))}
        <span className={kit.mono}>
          {ready} / {n}
        </span>
      </div>
    </div>
  )
}
