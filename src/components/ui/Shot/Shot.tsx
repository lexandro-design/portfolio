import type { CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import type { Shot as ShotType } from '@/content/cases'
import { LoopVideo } from './LoopVideo'

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
 * в полноэкранный просмотр видео не попадает, оно и так крутится в галерее.
 * Кадр со своей версией для телефона (mobile) рендерится дважды, видимый
 * выбирает CSS по ширине экрана (data-screen в styles.css)
 */
export function Shot({ shot, className, eager, zoom }: Props) {
  if (!shot.mobile) return <Single shot={shot} className={className} eager={eager} zoom={zoom} />
  const { mobile, ...wide } = shot
  return (
    <>
      <Single shot={wide} className={className} eager={eager} zoom={zoom} screen="wide" />
      <Single
        shot={{ ...mobile, caption: shot.caption }}
        className={className}
        eager={eager}
        zoom={zoom}
        screen="narrow"
      />
    </>
  )
}

function Single({ shot, className, eager, zoom, screen }: Props & { screen?: 'wide' | 'narrow' }) {
  const style = { '--ratio': shot.w / shot.h } as CSSProperties

  if (shot.video) {
    return (
      <LoopVideo
        className={className}
        src={asset(shot.video)}
        poster={asset(shot.src)}
        width={shot.w}
        height={shot.h}
        style={style}
        label={shot.caption}
        screen={screen}
        eager={eager}
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
      data-screen={screen}
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
