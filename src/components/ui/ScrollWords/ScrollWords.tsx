'use client'

import { useEffect, useRef } from 'react'
import styles from './ScrollWords.module.css'

type Props = { text: string; className?: string }

/** Слова; в китайском и японском пробелов нет, там идём по знакам */
const split = (text: string) => (/\s/.test(text.trim()) ? text.split(/(?<=\s)/) : [...text])

/**
 * Абзац проявляется по прокрутке слово за словом: прочитанное светлое,
 * дальше приглушённое. Без JS и при prefers-reduced-motion текст сразу целиком
 */
export function ScrollWords({ text, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const words = [...el.children] as HTMLElement[]
    el.dataset.armed = ''
    let raf = 0
    let lit = -1

    const paint = () => {
      raf = 0
      const { top, height } = el.getBoundingClientRect()
      const vh = innerHeight
      // Начинаем, когда абзац вошёл на 85% экрана, заканчиваем к 45%
      const p = (vh * 0.85 - top) / (height + vh * 0.4)
      const n = Math.round(Math.min(1, Math.max(0, p)) * words.length)
      if (n === lit) return
      words.forEach((w, i) => {
        if (i < n) w.dataset.lit = ''
        else delete w.dataset.lit
      })
      lit = n
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        addEventListener('scroll', queue, { passive: true })
        queue()
      } else removeEventListener('scroll', queue)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      removeEventListener('scroll', queue)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <p ref={ref} className={[styles.text, className].filter(Boolean).join(' ')}>
      {split(text).map((w, i) => (
        <span key={i}>{w}</span>
      ))}
    </p>
  )
}
