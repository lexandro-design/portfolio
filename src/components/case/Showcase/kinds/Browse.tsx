'use client'

import { useState, type CSSProperties } from 'react'
import type { Shot } from '@/content/cases'
import { asset } from '@/lib/asset'
import { useInView } from '../hooks'
import kit from './kit.module.css'
import styles from './Browse.module.css'

type Props = { pages: { shot: number; label: string }[]; shots: Shot[] }

/**
 * Сайт в окне браузера: вкладки страниц сверху, страница целиком медленно
 * проезжает в окне сверху вниз, как при прокрутке, потом включается
 * следующая. Наведение ставит на паузу, клик открывает страницу целиком
 */
export function Browse({ pages, shots }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [i, setI] = useState(0)
  const page = pages[i]
  const shot = shots[page.shot]
  // Чем длиннее страница, тем дольше проезд: 6–22 секунды
  const dur = Math.min(22, Math.max(6, (shot.h / shot.w) * 4.2))

  return (
    <div ref={ref} className={styles.root}>
      <div className={kit.tabs} role="tablist">
        {pages.map((p, k) => (
          <button
            key={p.shot}
            type="button"
            role="tab"
            aria-selected={k === i}
            className={kit.tab}
            onClick={() => setI(k)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className={kit.win}>
        <div className={kit.bar}>
          <span className={kit.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={kit.addr}>{page.label}</span>
          <span className={styles.count}>
            {String(i + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
          </span>
        </div>
        <div className={styles.view} data-play={inView || undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
          <img
            key={shot.src}
            src={asset(shot.src)}
            alt={shot.caption}
            width={shot.w}
            height={shot.h}
            className={styles.page}
            style={{ '--dur': `${dur}s` } as CSSProperties}
            loading="lazy"
            decoding="async"
            data-zoom
            onAnimationEnd={() => setI((k) => (k + 1) % pages.length)}
          />
          <span className={styles.progress} aria-hidden="true">
            <i key={shot.src} style={{ '--dur': `${dur}s` } as CSSProperties} />
          </span>
        </div>
      </div>
    </div>
  )
}
