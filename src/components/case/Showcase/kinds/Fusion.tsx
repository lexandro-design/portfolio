'use client'

import { useEffect, useState } from 'react'
import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Fusion.module.css'

type Props = { block: Extract<Block, { kind: 'fusion' }> }

/**
 * Гибридный поиск: запрос набирается, два поиска — по смыслу и по словам —
 * выдают свои списки, потом списки сливаются в один. У каждой строки итога
 * видны её места в обоих поисках
 */
export function Fusion({ block }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  // 0 — набор запроса, 1 — оба списка, 2 — слияние
  const phase = useScript(3, 2200, inView, 3)
  const [typed, setTyped] = useState(block.query.length)

  useEffect(() => {
    if (phase !== 0 || !inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Набор по буквам: сколько букв видно — от времени с начала фазы
    const t0 = performance.now()
    const id = window.setInterval(
      () => setTyped(Math.min(block.query.length, Math.floor((performance.now() - t0) / 60))),
      30,
    )
    return () => window.clearInterval(id)
  }, [phase, inView, block.query])

  const rank = (list: string[], it: string) => list.indexOf(it) + 1

  return (
    <div ref={ref} className={styles.root}>
      <div className={`${kit.panel} ${styles.query}`}>
        <span className={styles.icon} aria-hidden="true">
          ⌕
        </span>
        <span>
          {block.query.slice(0, typed)}
          <i className={styles.cursor} aria-hidden="true" />
        </span>
      </div>
      <div className={styles.cols} data-phase={phase}>
        {[block.a, block.b].map((col) => (
          <div key={col.label} className={`${kit.panel} ${styles.col}`}>
            <span className={kit.mono}>{col.label}</span>
            <ol>
              {col.items.map((it, k) => (
                <li key={it} style={{ transitionDelay: `${k * 120}ms` }}>
                  <span className={styles.n}>{k + 1}</span>
                  {it}
                </li>
              ))}
            </ol>
          </div>
        ))}
        <div className={`${kit.panel} ${styles.col} ${styles.fused}`}>
          <span className={kit.mono}>{block.label}</span>
          <ol>
            {block.fused.map((it, k) => (
              <li key={it} style={{ transitionDelay: `${k * 160}ms` }}>
                <span className={styles.n}>{k + 1}</span>
                <span className={styles.item}>{it}</span>
                <span className={styles.ranks}>
                  {rank(block.a.items, it)} + {rank(block.b.items, it)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
