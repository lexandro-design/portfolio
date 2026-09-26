'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import styles from './SearchPreview.module.css'

type Props = { query: string; results: string[] }

// Такт анимации: буква запроса за такт, результат — раз в пять тактов
const TICK = 90
const PER_RESULT = 5
const HOLD = 30

/**
 * Поиск по базе знаний: запрос набирается по буквам, потом выстраиваются
 * найденные фрагменты с полосой релевантности (длина условная, для
 * наглядности ранжирования, это не метрика).
 */
export function SearchPreview({ query, results }: Props) {
  const total = query.length + 4 + results.length * PER_RESULT + HOLD
  const [t, setT] = useState(total - 1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setT((x) => (x + 1) % total), TICK)
    return () => window.clearInterval(timer)
  }, [total])

  const typed = query.slice(0, t)
  const shown = Math.max(0, Math.floor((t - query.length - 4) / PER_RESULT) + 1)

  return (
    <span className={styles.search}>
      <span className={styles.field}>
        <span className={styles.prompt}>›</span>
        <span className={styles.query}>{typed}</span>
        <span className={styles.caret} />
      </span>
      <span className={styles.results}>
        {results.slice(0, shown).map((result, i) => (
          <span
            key={result}
            className={styles.result}
            style={{ '--w': `${92 - i * 18}%` } as CSSProperties}
          >
            <span className={styles.rank}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.text}>{result}</span>
            <span className={styles.bar} />
          </span>
        ))}
      </span>
    </span>
  )
}
