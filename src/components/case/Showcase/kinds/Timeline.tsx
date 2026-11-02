'use client'

import type { CSSProperties } from 'react'
import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Timeline.module.css'

type Props = { block: Extract<Block, { kind: 'timeline' }> }

/**
 * Лента времени бота: бегунок идёт по шкале с засечками проверок, на каждом
 * событии всплывает сообщение. Между событиями бот молчит — в этом и смысл
 */
export function Timeline({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const n = block.events.length
  const step = useScript(n, 1900, inView, 2)

  return (
    <div ref={ref} className={styles.root} style={{ '--n': n, '--k': step } as CSSProperties}>
      <div className={styles.scale} aria-hidden="true">
        <span className={styles.fill} />
        <span className={styles.runner} />
      </div>
      <ol className={styles.events}>
        {block.events.map((e, k) => (
          <li key={k} className={styles.event} data-on={k <= step || undefined} data-now={k === step || undefined}>
            <span className={kit.mono}>{e.time}</span>
            <span className={styles.msg}>{e.text}</span>
          </li>
        ))}
      </ol>
      <span className={kit.live}>{block.tick}</span>
    </div>
  )
}
