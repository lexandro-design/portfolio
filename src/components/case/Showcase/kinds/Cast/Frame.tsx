import type { CSSProperties } from 'react'
import { LoopVideo } from '@/components/ui/Shot/LoopVideo'
import type { CastMedia } from '@/content/casts'
import { asset } from '@/lib/asset'
import styles from './Cast.module.css'

const SIZE = { '16:10': [800, 500], '1:1': [640, 640], '3:4': [600, 800] } as const

/** Настоящий кадр или петля в записи экрана: место держит пропорция, видео грузится только на экране */
export function Frame({ media, alt = '' }: { media: CastMedia; alt?: string }) {
  const [width, height] = SIZE[media.ratio ?? '16:10']
  const style = { aspectRatio: `${width} / ${height}` } as CSSProperties
  if (media.video) {
    return (
      <LoopVideo
        className={styles.frame}
        src={asset(media.video)}
        poster={asset(media.src)}
        width={width}
        height={height}
        style={style}
        label={media.alt ?? alt}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img
      className={styles.frame}
      data-tall={media.ratio === '3:4' || undefined}
      src={asset(media.src)}
      alt={media.alt ?? alt}
      width={width}
      height={height}
      style={style}
      loading="lazy"
      decoding="async"
    />
  )
}
