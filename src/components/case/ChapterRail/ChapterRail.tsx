'use client'

import { useEffect, useState } from 'react'
import styles from './ChapterRail.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Рельс глав у правого края: номер главы, где сейчас читатель, и полоса
 * прогресса внутри неё. Название главы проявляется по наведению. Виден, только пока на экране главы раскрытия; на телефоне скрыт
 */
export function ChapterRail({ chapters, label }: { chapters: { id: string; title: string }[]; label: string }) {
  const [active, setActive] = useState(-1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter((el) => el !== null)
    if (!els.length) return
    let raf = 0
    const update = () => {
      raf = 0
      // Текущая глава — та, чей верх прошёл линию на трети экрана
      const line = innerHeight / 3
      let cur = -1
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) cur = i
      })
      const last = els[els.length - 1].getBoundingClientRect()
      if (last.bottom < line) cur = -1
      setActive(cur)
      if (cur >= 0) {
        const r = els[cur].getBoundingClientRect()
        setProgress(Math.min(1, Math.max(0, (line - r.top) / r.height)))
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [chapters])

  return (
    <nav className={styles.rail} aria-label={label} data-on={active >= 0 || undefined}>
      <ol>
        {chapters.map((c, i) => (
          <li key={c.id} data-active={i === active || undefined} data-done={i < active || undefined}>
            <a href={`#${c.id}`}>
              <span className={styles.title}>{c.title}</span>
              <span className={styles.n}>{pad(i + 1)}</span>
              <span className={styles.bar}>
                <i style={{ transform: `scaleY(${i < active ? 1 : i === active ? progress : 0})` }} />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
