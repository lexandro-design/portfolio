'use client'

import { useState, type CSSProperties } from 'react'
import type { Shot } from '@/content/cases'
import { asset, srcSet } from '@/lib/asset'
import { useInView } from '../hooks'
import kit from './kit.module.css'
import styles from './Browse.module.css'

type Props = { pages: { shot: number; label: string }[]; shots: Shot[] }

/** Окно 16:10. Страница не выше ~1,4 окна (отношение сторон до 0,9) целиком видна сразу, листать нечего */
const WINDOW = 10 / 16
const STILL = 0.9
/** Сколько страница стоит неподвижной, прежде чем включится следующая вкладка */
const HOLD = 3.5

/**
 * Сайт в окне браузера: вкладки страниц сверху. Низкая страница стоит целиком
 * (вписана в окно), высокая проезжает сверху вниз за 5-11 секунд, как при
 * прокрутке. Потом включается следующая. Наведение ставит на паузу,
 * клик открывает страницу целиком
 */
export function Browse({ pages, shots }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [i, setI] = useState(0)
  const page = pages[i]
  const shot = shots[page.shot]
  const ratio = shot.h / shot.w
  const still = ratio <= STILL
  // Окон в странице: 1,4 окна проезжаются за ~5 с, длинная страница не дольше 11 с
  const dur = still ? HOLD : Math.min(11, Math.max(5, 3 + (ratio / WINDOW) * 1.4))

  const next = () => setI((k) => (k + 1) % pages.length)

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
        <div className={styles.view} data-play={inView || undefined} data-still={still || undefined}>
          {still && (
            // Размытая копия той же страницы закрывает поля вокруг вписанного кадра
            // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка
            <img key={`${shot.src}-fill`} src={asset(shot.src)} alt="" aria-hidden="true" className={styles.fill} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
          <img
            key={shot.src}
            src={asset(shot.src)}
            srcSet={srcSet(shot.src, shot.w)}
            alt={shot.caption}
            width={shot.w}
            height={shot.h}
            className={styles.page}
            style={{ '--dur': `${dur}s` } as CSSProperties}
            loading="lazy"
            decoding="async"
            data-zoom
            onAnimationEnd={still ? undefined : next}
          />
          <span className={styles.progress} aria-hidden="true">
            <i key={shot.src} style={{ '--dur': `${dur}s` } as CSSProperties} onAnimationEnd={still ? next : undefined} />
          </span>
        </div>
      </div>
    </div>
  )
}
