'use client'

import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Trace.module.css'

type Props = { block: Extract<Block, { kind: 'trace' }> }

/**
 * «Под капотом»: сообщение пользователя, под ним по строке каждый шаг бота
 * с отметкой — как в логе, — в конце ответ. Шаг в работе крутится, сделанный
 * получает галочку
 */
export function Trace({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const n = block.steps.length
  const step = useScript(n + 2, 1000, inView, 4)

  return (
    <div ref={ref} className={styles.root}>
      <div className={styles.term}>
        <div className={styles.prompt}>
          <span className={styles.caret}>›</span> {block.prompt}
        </div>
        <ol className={styles.steps}>
          {block.steps.map((s, k) => {
            const state = step > k + 1 ? 'done' : step === k + 1 ? 'run' : 'wait'
            return (
              <li key={k} className={styles.step} data-s={state}>
                <span className={styles.mark} aria-hidden="true" />
                <span className={styles.text}>{s.text}</span>
                <span className={styles.note}>{state === 'wait' ? '' : s.note}</span>
              </li>
            )
          })}
        </ol>
        <div className={styles.out} data-on={step >= n + 1 || undefined}>
          {block.out}
        </div>
      </div>
      {block.miss && (
        <div className={`${kit.panel} ${styles.miss}`}>
          <span className={kit.mono}>{block.miss.text}</span>
          <ol>
            {block.miss.steps.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
