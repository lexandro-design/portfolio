'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Список шагов: шаг на середине экрана получает data-active, остальные гаснут */
export function Steps({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const step = e.target as HTMLElement
          if (e.isIntersecting) step.dataset.active = ''
          else delete step.dataset.active
        }
      },
      { rootMargin: '-42% 0px -42% 0px' },
    )
    for (const step of el.children) io.observe(step)
    return () => io.disconnect()
  }, [])

  return (
    <ol ref={ref} className={className}>
      {children}
    </ol>
  )
}
