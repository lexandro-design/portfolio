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
        const s = shots[it.shot]
        return (
          <li key={it.shot} className={styles.item}>
            <figure className={styles.fig}>
              <div className={styles.media} style={{ maxInlineSize: `${s.w}px` }}>
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
