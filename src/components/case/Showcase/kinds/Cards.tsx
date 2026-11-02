'use client'

import type { CSSProperties } from 'react'
import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Cards.module.css'

type Props = { block: Extract<Block, { kind: 'cards' }> }

/**
 * Лента заказов: агент читает заказ, шкала совпадения наполняется, заказ
 * проходит или отсекается. Для подходящего появляется черновик отклика —
 * отправит его человек. Внизу правила, которые агент не нарушает
 */
export function Cards({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const n = block.items.length
  const step = useScript(n + 1, 1800, inView, 3)

  return (
    <div ref={ref} className={styles.root}>
      <div className={styles.feed}>
        {block.items.map((it, k) => (
          <article key={k} className={`${kit.panel} ${styles.card}`} data-on={k <= step || undefined} data-ok={it.ok}>
            <span className={styles.top}>
              <span className={kit.mono}>{it.src}</span>
              <span className={styles.verdict}>{it.ok ? '✓' : '✕'}</span>
            </span>
            <p>{it.text}</p>
            <span className={styles.score}>
              <span className={styles.meter}>
                <i style={{ '--w': `${it.score}%` } as CSSProperties} />
              </span>
              <b>{it.score}%</b>
            </span>
            <span className={kit.mono}>{it.tip}</span>
          </article>
        ))}
      </div>
      <div className={`${kit.panel} ${styles.draft}`} data-on={step >= n || undefined}>
        <span className={kit.mono}>{block.note}</span>
        <p className={styles.bubble}>{block.draft}</p>
        <span className={styles.actions}>
          {block.actions.map((a, j) => (
            <span key={a} className={styles.action} data-main={j === 0 || undefined}>
              {a}
            </span>
          ))}
        </span>
        <ul className={styles.rules}>
          {block.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
