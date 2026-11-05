'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useReduced } from '@/components/case/Showcase/hooks'
import { readTheme, subscribeTheme } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import { DEFAULT_THEME } from '@/content/site'
import { asset } from '@/lib/asset'
import styles from './HeroChrome.module.css'

/** Отступ от заголовка, доля узла за фото и размер, меньше которого узел не показываем */
const GAP = 24
const TUCK = 0.23
const SMALLEST = 120

/**
 * Хромовый узел за фото: готовая петля из Blender с прозрачным фоном, флаг features.chrome.
 * Стоит в свободном месте рядом со снимком и уходит за его край, поэтому читается частью композиции.
 * Грузится после страницы, чтобы не мешать первому экрану. В спокойном виде и при просьбе системы меньше движения его нет,
 * в Космосе тоже: там вместо фото Луна
 */
export function HeroChrome() {
  const still = useReduced()
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME)
  const [ready, setReady] = useState(false)
  const box = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const on = () => setReady(true)
    if (document.readyState === 'complete') on()
    else window.addEventListener('load', on, { once: true })
    return () => window.removeEventListener('load', on)
  }, [])

  const shown = ready && !still && theme !== 'space'

  /* Длина заголовка зависит от языка и ширины: узел берёт только свободное место до самой длинной строки */
  useEffect(() => {
    const el = box.current
    if (!shown || !el) return
    const fit = () => {
      const title = document.getElementById('hero-title')
      const photo = el.parentElement
      if (!title || !photo || window.innerWidth < 768) return
      const range = document.createRange()
      const end = Math.max(
        ...[...title.children].map((line) => {
          range.selectNodeContents(line.firstChild as Node)
          return range.getBoundingClientRect().right
        }),
      )
      const room = (photo.getBoundingClientRect().left - end - GAP) / (1 - TUCK)
      el.style.setProperty('--room', `${Math.round(room)}px`)
      el.toggleAttribute('data-tight', room < SMALLEST)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [shown])

  if (!shown) return null
  return (
    <span ref={box} className={styles.chrome} aria-hidden="true">
      <picture>
        <source media="(min-width: 768px)" srcSet={asset('/hero/chrome-640.webp')} />
        <img src={asset('/hero/chrome.webp')} alt="" width={440} height={440} decoding="async" />
      </picture>
    </span>
  )
}
