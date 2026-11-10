'use client'

import type { UIEvent } from 'react'
import type { Shot } from '@/content/cases'
import type { Block } from '@/content/showcase'
import { asset } from '@/lib/asset'
import kit from './kit.module.css'
import styles from './Frames.module.css'

type Props = { block: Extract<Block, { kind: 'frames' }>; shots: Shot[] }

/**
 * Статичные кадры без анимации: каждый стоит целиком в своей пропорции, под ним подпись
 * в одну строку. Кадр не растягивается больше родного размера (max-inline-size = ширина файла),
 * поэтому спрайты и скрины остаются чёткими. Варианты: one — один крупный кадр, two — два рядом,
 * sheet — лист спрайтов на плашке, phones — ряд экранов телефона в рамке
 */
export function Frames({ block, shots }: Props) {
  return (
    <ul className={styles.root} data-variant={block.variant}>
      {block.items.map((it, i) => {
        const s = it.src ? { src: it.src, w: it.w ?? 1600, h: it.h ?? 1000, caption: it.title } : shots[it.shot ?? 0]
        return (
          <li key={it.src ?? it.shot} className={styles.item}>
            <figure className={styles.fig}>
              <div
                className={styles.media}
                style={{ maxInlineSize: `${s.w}px` }}
                {...(block.variant === 'one'
                  ? {
                      tabIndex: 0,
                      role: 'group',
                      'aria-label': it.title,
                      // Первая прокрутка пальцем убирает подсказку: человек уже понял
                      onScroll: (e: UIEvent<HTMLDivElement>) => {
                        e.currentTarget.dataset.moved = ''
                      },
                    }
                  : {})}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
                <img
                  src={asset(s.src)}
                  alt={s.caption || it.title}
                  width={s.w}
                  height={s.h}
                  className={styles.img}
                  loading="lazy"
                  decoding="async"
                  data-zoom
                />
              </div>
              {block.variant === 'one' && (
                <span className={styles.pan} aria-hidden="true">
                  <svg viewBox="0 0 24 12" width="24" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 1 1 6l5 5M18 1l5 5-5 5M1 6h22" />
                  </svg>
                </span>
              )}
              <figcaption className={styles.cap}>
                <span className={kit.mono}>{String(i + 1).padStart(2, '0')}</span>
                <span>{it.title}</span>
              </figcaption>
            </figure>
          </li>
        )
      })}
    </ul>
  )
}
