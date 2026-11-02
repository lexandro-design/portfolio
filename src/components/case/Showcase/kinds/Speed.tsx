'use client'

import type { CSSProperties } from 'react'
import { useInView } from '../hooks'
import styles from './Speed.module.css'

type Props = { rows: { label: string; ms: number; value: string }[] }

/**
 * Сравнение скорости: полоски заполняются за реальное время своей операции,
 * длинная тянется две секунды, короткая вспыхивает сразу. Длина — доля от
 * самой медленной
 */
export function Speed({ rows }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const max = Math.max(...rows.map((r) => r.ms))

  return (
    <div ref={ref} className={styles.root} data-play={inView || undefined}>
      {rows.map((r) => (
        <div key={r.label} className={styles.row}>
          <span className={styles.label}>{r.label}</span>
          <span className={styles.track}>
            <i style={{ '--w': `${Math.max(1.5, (r.ms / max) * 100)}%`, '--t': `${r.ms}ms` } as CSSProperties} />
          </span>
          <b className={styles.value}>{r.value}</b>
        </div>
      ))}
    </div>
  )
}
