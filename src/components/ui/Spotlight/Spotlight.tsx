'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

type Props = { as?: ElementType; className?: string; children: ReactNode }

/** Сетка плиток: пишет позицию курсора в --mx и --my плитки под ним, свет плывёт за мышью */
export function Spotlight({ as: Tag = 'div', className, children }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !matchMedia('(hover: hover)').matches) return
    let raf = 0
    let last: PointerEvent
    const paint = () => {
      raf = 0
      const tile = [...el.children].find((c) => c.contains(last.target as Node)) as HTMLElement | undefined
      if (!tile) return
      const r = tile.getBoundingClientRect()
      tile.style.setProperty('--mx', `${last.clientX - r.left}px`)
      tile.style.setProperty('--my', `${last.clientY - r.top}px`)
    }
    const move = (e: PointerEvent) => {
      last = e
      if (!raf) raf = requestAnimationFrame(paint)
    }
    el.addEventListener('pointermove', move, { passive: true })
    return () => {
      el.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
