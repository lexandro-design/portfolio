'use client'

import { useEffect, useRef, useState } from 'react'

// Первое число в строке: «450+», «~17 000», «60 мс». Годы и составные значения («15 с → 1 с») не считаем
const NUM = /^([^\d]*)(\d[\d\s]*)(.*)$/

/**
 * Цифра результата набегает от нуля, когда появляется на экране. Без JS
 * и при prefers-reduced-motion сразу видно итоговое значение
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const m = value.match(NUM)
    const el = ref.current
    if (!m || !el || value.includes('→') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const target = Number(m[2].replace(/\s/g, ''))
    // Год и маленькие числа не анимируем: «2025» не должен набегать от нуля
    if (target < 5 || (target >= 1990 && target <= 2100) || m[2].startsWith('0')) return
    const sep = /\s/.test(m[2])
    const fmt = (n: number) => (sep ? n.toLocaleString('ru-RU').replace(/ /g, ' ') : String(n))
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 1400)
        const eased = 1 - Math.pow(1 - k, 4)
        setShown(`${m[1]}${fmt(Math.round(target * eased))}${m[3]}`)
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      setShown(`${m[1]}${fmt(0)}${m[3]}`)
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <span ref={ref} className={className} aria-label={value}>
      {shown}
    </span>
  )
}
