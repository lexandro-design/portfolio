'use client'

import { useEffect, useState } from 'react'
import styles from './InboxPreview.module.css'

type Props = {
  /** Воронки, по которым раскладывается почта */
  columns: string[]
  /** Темы писем и номер воронки, куда письмо уходит */
  mails: { text: string; to: number }[]
}

const STEP = 1000
const HOLD = 3

/**
 * Разбор почты: письма по одному появляются во «входящих» и уезжают
 * в свою воронку. Когда все разложены, доска очищается и круг начинается
 * заново — так видна сама логика автоматизации, без лишних слов.
 */
export function InboxPreview({ columns, mails }: Props) {
  const total = mails.length + HOLD + 1
  const [step, setStep] = useState(total - 1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setStep((s) => (s + 1) % total), STEP)
    return () => window.clearInterval(timer)
  }, [total])

  const sorted = Math.min(step, mails.length)
  const incoming = step < mails.length ? mails[step] : null

  return (
    <span className={styles.board}>
      <span className={styles.inbox}>
        <span className={styles.label}>inbox</span>
        {incoming && (
          <span key={incoming.text} className={styles.mail} data-incoming>
            {incoming.text}
          </span>
        )}
      </span>
      <span className={styles.columns}>
        {columns.map((column, c) => (
          <span key={column} className={styles.column}>
            <span className={styles.label}>{column}</span>
            {mails.slice(0, sorted).map((mail) =>
              mail.to === c ? (
                <span key={mail.text} className={styles.mail}>
                  {mail.text}
                </span>
              ) : null,
            )}
          </span>
        ))}
      </span>
    </span>
  )
}
