'use client'

import { useEffect, useRef, useState } from 'react'
import type { Block } from '@/content/showcase'
import { useInView } from '../hooks'
import kit from './kit.module.css'
import styles from './Console.module.css'
import { stillMotion } from '@/lib/still'

type Props = { block: Extract<Block, { kind: 'console' }> }

/**
 * Окно пульта: вкладки слева, сервисы с тумблерами. Когда окно появляется,
 * сервисы включаются по очереди, дальше тумблеры можно щёлкать самому
 */
export function Console({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [on, setOn] = useState<boolean[]>(() => block.services.map(() => false))
  const booted = useRef(false)

  useEffect(() => {
    if (!inView || booted.current) return
    booted.current = true
    // Без движения — все сразу. Таймеры не снимаются при перерисовке: включение идёт один раз до конца
    const gap = stillMotion() ? 0 : 450
    block.services.forEach((_, i) =>
      window.setTimeout(() => setOn((v) => v.map((x, k) => (k === i ? true : x))), gap && 500 + i * gap),
    )
  }, [inView, block.services])

  const count = on.filter(Boolean).length

  return (
    <div ref={ref} className={`${kit.win} ${styles.root}`}>
      <div className={kit.bar}>
        <span className={kit.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.name}>{block.window}</span>
        <span className={kit.live}>
          {count} / {block.services.length}
        </span>
      </div>
      <div className={styles.body}>
        <nav className={styles.side} aria-hidden="true">
          {block.tabs.map((t, i) => (
            <span key={t} data-on={i === 0 || undefined}>
              {t}
            </span>
          ))}
        </nav>
        <ul className={styles.list}>
          {block.services.map((s, i) => (
            <li key={s.name} className={styles.row}>
              <span className={styles.dot} data-on={on[i] || undefined} aria-hidden="true" />
              <span className={styles.nm}>
                {s.name}
                <small>{s.note}</small>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={on[i]}
                aria-label={s.name}
                className={styles.toggle}
                onClick={() => setOn((v) => v.map((x, k) => (k === i ? !x : x)))}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.foot}>{block.foot}</div>
    </div>
  )
}
