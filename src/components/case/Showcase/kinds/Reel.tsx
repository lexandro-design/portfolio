'use client'

import { useState } from 'react'
import type { Shot } from '@/content/cases'
import { asset, srcSet, video2x } from '@/lib/asset'
import { LoopVideo } from '@/components/ui/Shot/LoopVideo'
import styles from './Reel.module.css'

type Props = { items: { shot: number; title: string }[]; shots: Shot[] }

/**
 * 3D-петли: большая сцена и ряд остальных под ней. Клик по миниатюре
 * ставит её в большой кадр. Видео грузится и играет, только пока видно
 */
export function Reel({ items, shots }: Props) {
  const [i, setI] = useState(0)
  const shot = shots[items[i].shot]

  return (
    <div className={styles.root} data-single={items.length === 1 || undefined}>
      <figure className={styles.stage}>
        {shot.video ? (
          <LoopVideo
            key={shot.src}
            className={styles.video}
            src={asset(shot.video)}
            src2x={video2x(shot.video)}
            poster={asset(shot.src)}
            width={shot.w}
            height={shot.h}
            label={shot.caption}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка
          <img src={asset(shot.src)} srcSet={srcSet(shot.src, shot.w)} alt={shot.caption} width={shot.w} height={shot.h} className={styles.video} />
        )}
        <figcaption className={styles.caption} key={i}>
          {shot.caption}
        </figcaption>
      </figure>
      {items.length > 1 && (
        <div className={styles.thumbs} role="tablist">
          {items.map((it, k) => {
            const s = shots[it.shot]
            return (
              <button
                key={it.shot}
                type="button"
                role="tab"
                aria-selected={k === i}
                className={styles.thumb}
                onClick={() => setI(k)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
                <img src={asset(s.src)} alt="" width={s.w} height={s.h} loading="lazy" decoding="async" />
                <span>{it.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
