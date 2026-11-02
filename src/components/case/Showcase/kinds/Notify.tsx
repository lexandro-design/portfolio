'use client'

import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Notify.module.css'

type Props = { block: Extract<Block, { kind: 'notify' }> }

/**
 * Телефон с вопросами от агентов: уведомление приезжает сверху, через шаг
 * нажимается первая кнопка — ответ ушёл агенту. Рядом — чем ещё можно
 * ответить и правило «без шума»
 */
export function Notify({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const n = block.items.length
  const step = useScript(n * 2, 1500, inView, 3)

  return (
    <div ref={ref} className={styles.root}>
      <div className={styles.phone}>
        <span className={styles.notch} aria-hidden="true" />
        <span className={styles.clock}>09:41</span>
        <ul className={styles.list}>
          {block.items.map((it, k) => {
            if (step < k * 2) return null
            const answered = step >= k * 2 + 1
            return (
              <li key={k} className={`${styles.card} ${kit.enter}`}>
                <span className={styles.app}>
                  <span className={styles.ava} aria-hidden="true">
                    L
                  </span>
                  {block.app}
                </span>
                <p>{it.text}</p>
                <span className={styles.actions}>
                  {it.actions.map((a, j) => (
                    <span key={a} className={styles.action} data-on={(answered && j === 0) || undefined}>
                      {a}
                    </span>
                  ))}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className={styles.side}>
        <div className={kit.panel}>
          <div className={styles.replies}>
            {block.replies.map((r) => (
              <span key={r} className={styles.reply}>
                {r}
              </span>
            ))}
          </div>
        </div>
        <p className={styles.rule}>
          <span className={kit.live}>{block.rule}</span>
        </p>
      </div>
    </div>
  )
}
