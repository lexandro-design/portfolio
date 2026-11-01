import type { CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import type { Shot as ShotType } from '@/content/cases'

type Props = {
  shot: ShotType
  className?: string
  eager?: boolean
  /** Открывается на весь экран по клику (Lightbox на странице кейса) */
  zoom?: boolean
}

/**
 * Скриншот кейса: путь с basePath, размеры из данных, чтобы вёрстка не прыгала.
 * У скрина с тёмной парой рендерятся обе картинки, видимую выбирает
 * переключатель темы на странице кейса (ShotTheme) через CSS.
 * Анимированный кадр — беззвучная петля, первый кадр служит постером;
 * в полноэкранный просмотр видео не попадает, оно и так крутится в галерее
 */
export function Shot({ shot, className, eager, zoom }: Props) {
  const style = { '--ratio': shot.w / shot.h } as CSSProperties

  if (shot.video) {
    return (
      <video
        className={className}
        src={asset(shot.video)}
        poster={asset(shot.src)}
        width={shot.w}
        height={shot.h}
        style={style}
        aria-label={shot.caption}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
      />
    )
  }

  const image = (src: string, variant?: 'light' | 'dark') => (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img
      key={src}
      className={className}
      src={asset(src)}
      alt={shot.caption}
      width={shot.w}
      height={shot.h}
      style={style}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      data-zoom={zoom || undefined}
      data-variant={variant}
    />
  )

  if (!shot.dark) return image(shot.src)
  return (
    <>
      {image(shot.src, 'light')}
      {image(shot.dark, 'dark')}
    </>
  )
}
