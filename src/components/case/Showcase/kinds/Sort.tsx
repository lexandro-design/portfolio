'use client'

import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Sort.module.css'

type Props = { block: Extract<Block, { kind: 'sort' }>; incoming: string }

/**
 * Маршрут запросов: сообщение появляется во входящих, потом уезжает в свою
 * дорожку — и дорожка подсвечивает, чем закончилось. Каждое сообщение — два
 * шага: «пришло» и «разобрано»
 */
export function Sort({ block, incoming }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const n = block.items.length
  const step = useScript(n * 2, 1100, inView, 4)
  // Сколько сообщений уже разложено и есть ли новое во входящих
  const done = Math.min(n, Math.floor((step + 1) / 2))
  const pending = step % 2 === 0 && step < n * 2 ? block.items[done] : undefined
  const last = done > 0 && !pending ? block.items[done - 1].lane : -1

  return (
    <div ref={ref} className={styles.root}>
      <div className={`${kit.panel} ${styles.inbox}`}>
        <span className={kit.mono}>{incoming}</span>
        <div className={styles.slot}>
          {pending && (
            <span key={done} className={`${styles.msg} ${kit.enter}`}>
              {pending.text}
            </span>
          )}
        </div>
      </div>
      <div className={styles.lanes} style={{ gridTemplateColumns: `repeat(${block.lanes.length}, minmax(0, 1fr))` }}>
        {block.lanes.map((l, k) => {
          const got = block.items.slice(0, done).filter((it) => it.lane === k)
          return (
            <div key={l.label} className={styles.lane} data-hot={k === last || undefined}>
              <b className={styles.label}>{l.label}</b>
              <ul className={styles.list}>
                {got.map((it, j) => (
                  <li key={j} className={`${styles.msg} ${kit.enter}`}>
                    {it.text}
                  </li>
                ))}
              </ul>
              <span className={styles.out} data-on={got.length > 0 || undefined}>
                → {l.out}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
