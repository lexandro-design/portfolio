'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useReduced } from '@/components/case/Showcase/hooks'
import { readTheme, subscribeTheme } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import { DEFAULT_THEME } from '@/content/site'
import { asset } from '@/lib/asset'
import styles from './HeroChrome.module.css'

/**
 * Хромовый узел рядом с фото: готовая петля из Blender с прозрачным фоном, флаг features.chrome.
 * Грузится после страницы, чтобы не мешать первому экрану. В спокойном виде и при просьбе системы меньше движения его нет,
 * в Космосе тоже: там вместо фото Луна
 */
export function HeroChrome() {
  const still = useReduced()
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const on = () => setReady(true)
    if (document.readyState === 'complete') on()
    else window.addEventListener('load', on, { once: true })
    return () => window.removeEventListener('load', on)
  }, [])

  if (still || theme === 'space' || !ready) return null
  // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
  return <img className={styles.chrome} src={asset('/hero/chrome.webp')} alt="" width={440} height={440} decoding="async" />
}
