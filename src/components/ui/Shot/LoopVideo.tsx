'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { stillMotion } from '@/lib/still'

type Props = {
  src: string
  poster: string
  width: number
  height: number
  className?: string
  style?: CSSProperties
  label: string
  screen?: 'wide' | 'narrow'
  /** Шапка кейса: грузится сразу, а не по прокрутке */
  eager?: boolean
}

/**
 * Беззвучная петля, которая грузится и играет, только пока видна на экране.
 * На главной таких дюжина: без этого телефон качал бы все сразу. Пока видео
 * не началось и при prefers-reduced-motion виден постер — первый кадр
 */
export function LoopVideo({ src, poster, width, height, className, style, label, screen, eager }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video || stillMotion()) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src
          video.play().catch(() => {})
        } else video.pause()
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [src])

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      width={width}
      height={height}
      style={style}
      aria-label={label}
      data-screen={screen}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'none'}
    />
  )
}
