'use client'

import { useRef, type CSSProperties } from 'react'
import type { Shot } from '@/content/cases'
import { asset, srcSet } from '@/lib/asset'
import { useAuto, useInView, useReserve } from '../hooks'
import kit from './kit.module.css'
import styles from './Steps.module.css'

type Props = { steps: { shot: number; title: string; text: string }[]; shots: Shot[] }

const MS = 4800

/** Потолок пояснения: max-block-size 6em в Steps.module.css */
const sixEm = (el: HTMLElement) => parseFloat(getComputedStyle(el).fontSize) * 6

/**
 * Сценарий по шагам: слева шаги с номерами, справа экран шага. Шаги идут
 * сами, пока блок виден, у активного полоска времени; клик выбирает шаг.
 * Экраны лежат стопкой и сменяются проявлением
 */
export function Steps({ steps, shots }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [i, set] = useAuto(steps.length, MS, inView)
  const list = useRef<HTMLOListElement>(null)
  // Пояснение раскрывается только у активного шага: высоту списка держим под самое длинное
  useReserve(list, sixEm)
  const first = shots[steps[0].shot]
  const ratio = Math.max(16 / 11, first.w / first.h)

  return (
    <div ref={ref} className={styles.root} data-play={inView || undefined}>
      <ol ref={list} className={styles.list}>
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
                <span data-more>{s.text}</span>
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
              srcSet={srcSet(shot.src, shot.w)}
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
