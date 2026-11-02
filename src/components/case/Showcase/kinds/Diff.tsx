'use client'

import type { CSSProperties } from 'react'
import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Diff.module.css'

type Props = { block: Extract<Block, { kind: 'diff' }> }

/**
 * Конвейер постов: черновик проходит круги один за другим, потом правка
 * «было → стало», которая учит следующие черновики. Внизу три слота дня
 */
export function Diff({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const n = block.passes.length
  const step = useScript(n + 2, 1200, inView, 4)

  return (
    <div ref={ref} className={styles.root}>
      <ol className={styles.passes} style={{ '--n': n } as CSSProperties}>
        {block.passes.map((p, k) => (
          <li key={p} data-s={k < step ? 'done' : k === step ? 'run' : undefined}>
            <span className={kit.mono}>{String(k + 1).padStart(2, '0')}</span>
            {p}
          </li>
        ))}
      </ol>
      <div className={styles.diff}>
        <div className={styles.was} data-on={step >= n || undefined}>
          <span className={kit.mono}>{block.labels[0]}</span>
          <p>{block.was}</p>
        </div>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
        <div className={styles.now} data-on={step >= n + 1 || undefined}>
          <span className={kit.mono}>{block.labels[1]}</span>
          <p>{block.now}</p>
        </div>
      </div>
      <div className={styles.slots}>
        {block.slots.map((s) => (
          <span key={s} className={styles.slot}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
