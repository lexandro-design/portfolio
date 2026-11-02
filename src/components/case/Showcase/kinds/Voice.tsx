'use client'

import type { CSSProperties } from 'react'
import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Voice.module.css'

type Line = Extract<Block, { kind: 'voice' }>['lines'][number]

// Высоты столбиков волны — постоянные, чтобы сервер и браузер рисовали одно и то же
const BARS = Array.from({ length: 36 }, (_, i) => 30 + ((i * 37) % 64))

/**
 * Голосовой помощник: сфера дышит, волна показывает, кто сейчас говорит
 * (я или помощник), реплики разговора появляются по очереди
 */
export function Voice({ lines }: { lines: Line[] }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const step = useScript(lines.length, 1700, inView, 3)
  const shown = lines.slice(0, step + 1)
  const speaker = [...shown].reverse().find((l) => l.who !== 'sys')?.who ?? 'me'

  return (
    <div ref={ref} className={styles.root} data-play={inView || undefined}>
      <div className={`${kit.panel} ${styles.mic}`} data-who={speaker}>
        <div className={styles.orb} aria-hidden="true" />
        <div className={styles.wave} aria-hidden="true">
          {BARS.map((h, i) => (
            <i key={i} style={{ '--i': i, '--h': `${h}%` } as CSSProperties} />
          ))}
        </div>
      </div>
      <div className={`${kit.panel} ${styles.chat}`} aria-live="polite">
        {shown.map((l, i) =>
          l.who === 'sys' ? (
            <span key={i} className={`${styles.sys} ${kit.enter}`}>
              {l.text}
            </span>
          ) : (
            <p key={i} className={`${styles.msg} ${kit.enter}`} data-who={l.who}>
              <span className={styles.who}>{l.name}</span>
              {l.text}
            </p>
          ),
        )}
      </div>
    </div>
  )
}
