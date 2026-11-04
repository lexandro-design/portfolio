'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Пишет позицию курсора в --mx и --my на плитке под ним: свет плывёт за мышью */
export function Spotlight({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

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
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
