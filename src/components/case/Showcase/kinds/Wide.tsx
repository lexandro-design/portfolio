import type { Shot } from '@/content/cases'
import { asset } from '@/lib/asset'
import styles from './Wide.module.css'

/**
 * Ультраширокий экран: скрин в рамке монитора с подставкой. На телефоне
 * таблица не сжимается в полоску — она крупнее экрана и медленно едет вбок
 */
export function Wide({ shot }: { shot: Shot }) {
  return (
    <figure className={styles.root}>
      <div className={styles.monitor}>
        <div className={styles.screen}>
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
          <img
            src={asset(shot.src)}
            alt={shot.caption}
            width={shot.w}
            height={shot.h}
            className={styles.img}
            loading="lazy"
            decoding="async"
            data-zoom
          />
        </div>
      </div>
      <span className={styles.stand} aria-hidden="true" />
      <figcaption className={styles.caption}>{shot.caption}</figcaption>
    </figure>
  )
}
