'use client'

import { useRef, type CSSProperties } from 'react'
import type { Shot } from '@/content/cases'
import { asset, srcSet } from '@/lib/asset'
import { useAuto, useInView } from '../hooks'
import kit from './kit.module.css'
import styles from './Deck.module.css'

type Props = {
  cards: { shot: number; title: string }[]
  shots: Shot[]
  labels: { prev: string; next: string }
}

/**
 * Колода экранов: верхняя карта во весь кадр, следующие выглядывают из-под
 * неё веером. Листается сама, кнопками, свайпом и кликом по карте сзади
 */
export function Deck({ cards, shots, labels }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [i, set] = useAuto(cards.length, 4200, inView)
  const start = useRef<number | null>(null)
  const swiped = useRef(false)
  const n = cards.length

  return (
    <div ref={ref} className={styles.root}>
      <div
        className={styles.stack}
        onPointerDown={(e) => {
          start.current = e.clientX
          swiped.current = false
        }}
        onPointerUp={(e) => {
          if (start.current === null) return
          const dx = e.clientX - start.current
          start.current = null
          if (Math.abs(dx) < 40) return
          swiped.current = true
          set(i + (dx < 0 ? 1 : -1))
        }}
        // Свайп мышью не должен открывать просмотр кадра
        onClickCapture={(e) => swiped.current && e.stopPropagation()}
      >
        {cards.map((c, k) => {
          // Место карты в колоде: 0 — сверху, дальше вглубь
          const depth = (k - i + n) % n
          const shot = shots[c.shot]
          return (
            <figure
              key={c.shot}
              className={styles.card}
              style={{ '--d': depth, zIndex: n - depth } as CSSProperties}
              data-top={depth === 0 || undefined}
              aria-hidden={depth !== 0}
              onClick={() => depth !== 0 && set(k)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
              <img
                src={asset(shot.src)}
                srcSet={srcSet(shot.src, shot.w)}
                alt={shot.caption}
                width={shot.w}
                height={shot.h}
                className={kit.img}
                loading="lazy"
                decoding="async"
                draggable={false}
                data-zoom={depth === 0 || undefined}
              />
            </figure>
          )
        })}
      </div>
      <div className={styles.foot}>
        {/* Подписи лежат стопкой в одной ячейке: подпись в две строки не двигает кнопки и текст ниже */}
        <span className={styles.captions}>
          {cards.map((c, k) => (
            <span key={c.shot} className={styles.caption} data-on={k === i || undefined} aria-hidden={k !== i}>
              <span className={kit.mono}>
                {String(k + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
              {c.title}
            </span>
          ))}
        </span>
        {n > 1 && (
          <span className={styles.nav}>
            <button type="button" className={kit.btn} aria-label={labels.prev} onClick={() => set(i - 1)}>
              ←
            </button>
            <button type="button" className={kit.btn} aria-label={labels.next} onClick={() => set(i + 1)}>
              →
            </button>
          </span>
        )}
      </div>
    </div>
  )
}
