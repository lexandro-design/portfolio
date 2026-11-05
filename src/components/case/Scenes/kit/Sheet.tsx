'use client'

import type { ReactNode } from 'react'
import styles from './Sheet.module.css'

export type SheetRow = {
  c: ReactNode[]
  /** on — строка появилась, edit — изменилась, dim — удалена, hot — на неё смотрят */
  s?: 'on' | 'edit' | 'dim' | 'hot'
  /** Ключ строки для анимации появления; по умолчанию номер */
  key?: string
}

/**
 * Таблица как в Google Sheets или CRM: шапка колонок, строки с состояниями.
 * Новая строка въезжает, изменённая вспыхивает, удалённая гаснет.
 * Пустые строки держат место, чтобы таблица не прыгала
 */
export function Sheet({
  cols,
  rows,
  title,
  blank = 0,
  className,
}: {
  cols: string[]
  rows: SheetRow[]
  title?: string
  /** Сколько пустых строк держать под данными */
  blank?: number
  className?: string
}) {
  const n = Math.max(0, blank - rows.length)
  return (
    <div className={[styles.sheet, className].filter(Boolean).join(' ')} style={{ '--cols': cols.length } as React.CSSProperties}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.head} role="row">
        {cols.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <ol className={styles.body}>
        {rows.map((r, i) => (
          <li key={r.key ?? i} className={styles.row} data-s={r.s}>
            {r.c.map((v, j) => (
              <span key={j}>{v}</span>
            ))}
          </li>
        ))}
        {Array.from({ length: n }, (_, i) => (
          <li key={`b${i}`} className={styles.row} aria-hidden="true">
            {cols.map((c) => (
              <span key={c} />
            ))}
          </li>
        ))}
      </ol>
    </div>
  )
}
