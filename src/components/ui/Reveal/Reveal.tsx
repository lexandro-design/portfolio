'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import styles from './Reveal.module.css'

type Props = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Задержка в мс — для лесенки из соседних блоков */
  delay?: number
}

/**
 * Появление блока при прокрутке: сдвиг снизу на 40px и проявление
 * (Motion Lab: reveal 900ms, out-expo). Без JS блок просто виден:
 * прячем только когда на <html> стоит класс js (его ставит ThemeScript).
 */
export function Reveal({ children, as: Tag = 'div', className, delay }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.dataset.visible = ''
        io.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={[styles.reveal, className].filter(Boolean).join(' ')}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
