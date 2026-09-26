'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styles from './Logo.module.css'

const WORD = 'LEXANDRO'
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*/<>'
// Буква «встаёт на место» с шагом 45 мс слева направо, всё вместе — около 0,4 с
const STEP = 45

type Props = { href: string }

/**
 * Логотип-вордмарк. Шрифт Unbounded — широкий гротеск, который сразу
 * отличает бренд от Inter в интерфейсе. На наведении буквы коротко
 * перебирают случайные знаки и собираются обратно слева направо —
 * тот же мотив «пересборки», что у фото на первом экране.
 */
export function Logo({ href }: Props) {
  const [text, setText] = useState(WORD)
  const frame = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const scramble = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (frame.current) cancelAnimationFrame(frame.current)
    const start = performance.now()

    const tick = (now: number) => {
      const settled = Math.floor((now - start) / STEP)
      const next = [...WORD]
        .map((letter, i) =>
          i < settled ? letter : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        )
        .join('')
      setText(next)
      frame.current = settled < WORD.length ? requestAnimationFrame(tick) : null
    }

    frame.current = requestAnimationFrame(tick)
  }

  return (
    <Link href={href} className={styles.logo} aria-label={WORD} onPointerEnter={scramble}>
      {/* Каждая буква в своей ячейке: знаки разной ширины не дёргают строку */}
      {[...text].map((letter, i) => (
        <span key={i} className={styles.cell} aria-hidden="true">
          {letter}
        </span>
      ))}
    </Link>
  )
}
