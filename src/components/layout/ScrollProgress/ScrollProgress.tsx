'use client'

import { useEffect, useRef } from 'react'
import styles from './ScrollProgress.module.css'

/** Линия прочитанного по нижней кромке шапки. Пишем в стиль напрямую, без ререндеров */
export function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      ref.current?.style.setProperty('--p', String(max > 0 ? window.scrollY / max : 0))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <span ref={ref} className={styles.bar} aria-hidden="true" />
}
