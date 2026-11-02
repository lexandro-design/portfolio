'use client'

import type { CSSProperties } from 'react'
import type { Shot } from '@/content/cases'
import { asset } from '@/lib/asset'
import { useAuto, useInView } from '../hooks'
import kit from './kit.module.css'
import styles from './Steps.module.css'

type Props = { steps: { shot: number; title: string; text: string }[]; shots: Shot[] }

const MS = 4800

/**
 * Сценарий по шагам: слева шаги с номерами, справа экран шага. Шаги идут
 * сами, пока блок виден, у активного полоска времени; клик выбирает шаг.
 * Экраны лежат стопкой и сменяются проявлением
 */
export function Steps({ steps, shots }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [i, set] = useAuto(steps.length, MS, inView)
  const first = shots[steps[0].shot]
  const ratio = Math.max(16 / 11, first.w / first.h)

  return (
    <div ref={ref} className={styles.root} data-play={inView || undefined}>
      <ol className={styles.list}>
        {steps.map((s, k) => (
          <li key={s.shot}>
            <button
              type="button"
              className={styles.step}
              aria-pressed={k === i}
              onClick={() => set(k)}
              style={{ '--ms': `${MS}ms` } as CSSProperties}
            >
              <span className={styles.num}>{String(k + 1).padStart(2, '0')}</span>
              <span className={styles.text}>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </span>
              {k === i && <i key={`${i}-${inView}`} className={styles.bar} aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ol>
      <div className={`${kit.win} ${styles.screen}`} style={{ aspectRatio: ratio }}>
        {steps.map((s, k) => {
          const shot = shots[s.shot]
          return (
            // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка
            <img
              key={s.shot}
              src={asset(shot.src)}
              alt={shot.caption}
              width={shot.w}
              height={shot.h}
              className={`${kit.img} ${styles.img}`}
              data-on={k === i || undefined}
              loading="lazy"
              decoding="async"
              data-zoom
            />
          )
        })}
      </div>
    </div>
  )
}
