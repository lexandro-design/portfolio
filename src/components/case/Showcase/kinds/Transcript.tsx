'use client'

import type { CSSProperties } from 'react'
import type { Block } from '@/content/showcase'
import { useInView, useScript } from '../hooks'
import kit from './kit.module.css'
import styles from './Transcript.module.css'

type Props = { block: Extract<Block, { kind: 'transcript' }>; labels: { me: string; them: string } }

const BARS = Array.from({ length: 48 }, (_, i) => 20 + ((i * 53) % 75))

/**
 * Созвон: две дорожки — мой микрофон и собеседник, — расшифровка по ролям
 * строка за строкой, после неё разбор карточками: суть, договорённости, задачи
 */
export function Transcript({ block, labels }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const total = block.lines.length + block.summary.length
  const step = useScript(total, 1400, inView, 4)
  const lines = block.lines.slice(0, step + 1)
  const cards = block.summary.slice(0, Math.max(0, step + 1 - block.lines.length))
  // Пока идёт расшифровка, оживает дорожка того, кто говорит
  const who = step < block.lines.length ? lines[lines.length - 1]?.who : undefined

  return (
    <div ref={ref} className={styles.root} data-play={inView || undefined}>
      <div className={`${kit.panel} ${styles.rec}`}>
        {(['me', 'them'] as const).map((w) => (
          <div key={w} className={styles.track} data-who={w} data-on={who === w || undefined}>
            <span className={kit.mono}>{labels[w]}</span>
            <span className={styles.wave} aria-hidden="true">
              {BARS.map((h, i) => (
                <i key={i} style={{ '--h': `${w === 'me' ? h : 100 - h + 10}%`, '--i': i } as CSSProperties} />
              ))}
            </span>
          </div>
        ))}
        <ol className={styles.lines} aria-live="polite">
          {lines.map((l, i) => (
            <li key={i} className={kit.enter} data-who={l.who}>
              <time className={kit.mono}>{l.t}</time>
              <b>{l.name}</b>
              <span>{l.text}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.sum}>
        {block.summary.map((s, i) => (
          <div key={s.title} className={`${kit.panel} ${styles.card}`} data-on={i < cards.length || undefined}>
            <span className={kit.mono}>{s.title}</span>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
