'use client'

import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Board.module.css'

type Props = { block: Extract<Block, { kind: 'board' }> }

// Кто в каком состоянии на каждом шаге ленты: 0 работает, 1 ждёт ответа, 2 готово, 3 свободен
const PLAN = [
  [3, 0, 0, 0, 3, 2],
  [3, 0, 0, 0, 3, 2],
  [3, 0, 1, 0, 3, 2],
  [3, 0, 1, 0, 3, 2],
  [3, 2, 0, 0, 3, 2],
  [3, 2, 0, 0, 3, 1],
]

/**
 * Табло офиса: я и диспетчер сверху, столы по отделам со статусами, справа
 * лента событий — задача, вопрос мне на телефон, итог, напоминание надзора.
 * Статусы столов меняются вместе с лентой
 */
export function Board({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const step = useScript(block.feed.length, 1900, inView, 3)
  const plan = PLAN[Math.min(step, PLAN.length - 1)]
  const working = plan.filter((s) => s === 0).length

  return (
    <div ref={ref} className={styles.root}>
      <div className={styles.board}>
        <div className={styles.top}>
          <div className={styles.boss}>
            <b>{block.me.label}</b>
            <span>{block.me.note}</span>
          </div>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
          <div className={styles.boss}>
            <b>{block.hub.label}</b>
            <span>{block.hub.note}</span>
          </div>
        </div>
        <div className={styles.desks}>
          {block.desks.map((d, i) => {
            const s = plan[i] ?? 3
            return (
              <div key={d.name} className={styles.desk} data-s={s}>
                <small className={kit.mono}>{d.group}</small>
                <b>{d.name}</b>
                <span className={styles.state} key={s}>
                  {block.states[s]}
                </span>
              </div>
            )
          })}
        </div>
        <div className={styles.sum}>
          <span className={kit.live}>
            {block.states[0]} · {working}
          </span>
        </div>
      </div>
      <ol className={`${kit.panel} ${styles.feed}`} aria-live="polite">
        {block.feed.slice(0, step + 1).map((f, i) => (
          <li key={i} className={kit.enter}>
            <span className={kit.mono}>{f.who}</span>
            <p>{f.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
