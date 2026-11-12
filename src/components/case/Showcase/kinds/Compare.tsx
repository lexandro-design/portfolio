'use client'

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { Shot } from '@/content/cases'
import type { Block } from '@/content/showcase'
import { asset, srcSet } from '@/lib/asset'
import { useInView } from '../hooks'
import kit from './kit.module.css'
import styles from './Compare.module.css'
import { stillMotion } from '@/lib/still'

type Props = { block: Extract<Block, { kind: 'compare' }>; shots: Shot[]; drag: string }

/**
 * Шторка «было / стало»: слева старая версия, справа новая (или тёмная тема
 * того же экрана). Тянется мышью и пальцем по горизонтали, вертикальный
 * свайп листает страницу как обычно. С клавиатуры — стрелками по ручке.
 * Когда блок впервые виден, шторка сама качается: видно, что её можно тянуть
 */
export function Compare({ block, shots, drag }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [pair, setPair] = useState(0)
  const [x, setX] = useState(50)
  const [dragging, setDragging] = useState(false)
  const hinted = useRef(false)
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inView || hinted.current || stillMotion()) return
    hinted.current = true
    const t = [
      window.setTimeout(() => setX(72), 300),
      window.setTimeout(() => setX(30), 1300),
      window.setTimeout(() => setX(50), 2300),
    ]
    return () => t.forEach(window.clearTimeout)
  }, [inView])

  const p = block.pairs[pair]
  const a = shots[p.a]
  const bShot = shots[p.b]
  const bSrc = p.dark && bShot.dark ? bShot.dark : bShot.src
  // Длинная страница вписанной стала бы полоской: обе версии едут сверху вниз вместе, как в Browse
  const tall = Math.max(a.h / a.w, bShot.h / bShot.w)
  const long = tall > 1

  const move = (e: PointerEvent) => {
    const r = frame.current?.getBoundingClientRect()
    if (!r) return
    setX(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4
    if (e.key === 'ArrowLeft') setX((v) => Math.max(0, v - step))
    else if (e.key === 'ArrowRight') setX((v) => Math.min(100, v + step))
    else return
    e.preventDefault()
  }

  return (
    <div ref={ref} className={styles.root}>
      {block.pairs.length > 1 && (
        <div className={kit.tabs} role="tablist">
          {block.pairs.map((q, k) => (
            <button
              key={q.label}
              type="button"
              role="tab"
              aria-selected={k === pair}
              className={kit.tab}
              onClick={() => setPair(k)}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
      <div
        ref={frame}
        className={styles.frame}
        data-long={long || undefined}
        data-play={inView || undefined}
        style={{ '--x': `${x}%`, '--pan': `${Math.min(24, 6 + tall * 3)}s` } as CSSProperties}
        data-drag={dragging || undefined}
        onPointerDown={(e) => {
          setDragging(true)
          e.currentTarget.setPointerCapture(e.pointerId)
          move(e)
        }}
        onPointerMove={(e) => dragging && move(e)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
        <img src={asset(a.src)} srcSet={srcSet(a.src, a.w)} alt={a.caption} width={a.w} height={a.h} className={kit.img} draggable={false} />
        <div className={styles.after}>
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
          <img src={asset(bSrc)} srcSet={srcSet(bSrc, bShot.w)} alt={bShot.caption} width={bShot.w} height={bShot.h} className={kit.img} draggable={false} />
        </div>
        <span className={`${styles.tag} ${styles.tagA}`}>{block.a}</span>
        <span className={`${styles.tag} ${styles.tagB}`}>{block.b}</span>
        <div
          className={styles.handle}
          role="slider"
          tabIndex={0}
          aria-label={drag}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(x)}
          onKeyDown={onKey}
        >
          <span className={styles.knob} aria-hidden="true">
            ‹ ›
          </span>
        </div>
      </div>
    </div>
  )
}
