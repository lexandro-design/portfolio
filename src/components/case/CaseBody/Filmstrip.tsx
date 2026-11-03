'use client'

import { useRef, type CSSProperties } from 'react'
import type { Case } from '@/content/cases'
import { Arrow } from '@/components/ui/Arrow'
import { Shot } from '@/components/ui/Shot'
import styles from './CaseBody.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Все экраны кейса одной лентой вбок: кадры одной высоты, ширина по
 * пропорции, прокрутка колесом, свайпом и стрелками. Полный кадр — по клику (Lightbox)
 */
export function Filmstrip({
  shots,
  labels,
}: {
  shots: Case['shots']
  labels: { prev: string; next: string }
}) {
  const strip = useRef<HTMLDivElement>(null)
  const go = (dir: 1 | -1) => {
    const el = strip.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className={styles.film}>
      <div ref={strip} className={styles.strip}>
        {shots.map((shot, i) => (
          <figure
            key={shot.src}
            className={styles.figure}
            style={{ '--ratio': `${shot.w} / ${shot.h}` } as CSSProperties}
          >
            <Shot shot={shot} className={styles.image} zoom />
            <figcaption className={styles.caption}>
              {pad(i + 1)} · {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="container">
        <div className={styles.filmNav}>
          <button type="button" className={styles.filmBtn} onClick={() => go(-1)} aria-label={labels.prev}>
            <Arrow dir="left" />
          </button>
          <button type="button" className={styles.filmBtn} onClick={() => go(1)} aria-label={labels.next}>
            <Arrow />
          </button>
        </div>
      </div>
    </div>
  )
}
