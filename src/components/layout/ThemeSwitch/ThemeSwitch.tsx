'use client'

import { useSyncExternalStore } from 'react'
import { DEFAULT_THEME, THEMES, type Theme } from '@/content/site'
import styles from './ThemeSwitch.module.css'

/* Тема живёт в data-theme на <html> (его же ставит ThemeScript до
   отрисовки), компонент на него только подписан. Событие themechange
   слушает и блок «система», чтобы показать новые значения токенов */
export const THEME_EVENT = 'themechange'
export const subscribeTheme = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb)
  return () => window.removeEventListener(THEME_EVENT, cb)
}
export const readTheme = () =>
  (document.documentElement.dataset.theme as Theme | undefined) ?? DEFAULT_THEME

/** Сменить тему сайта: шапка, блок «Система» и палитра команд подписаны на событие */
export function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {}
  window.dispatchEvent(new Event(THEME_EVENT))
}

type Props = { labels: Record<Theme, string> }

/** Ночь и день: кнопка показывает, куда переключит. Выбор помнится */
export function ThemeSwitch({ labels }: Props) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={labels[next]}
      title={labels[next]}
      onClick={() => applyTheme(next)}
    >
      <Icon id={next} />
    </button>
  )
}

export function ThemeIcon({ id }: { id: Theme }) {
  return <Icon id={id} />
}

function Icon({ id }: { id: Theme }) {
  if (id === 'dark')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M11.8 8.9A5.2 5.2 0 0 1 5.1 2.2a5.2 5.2 0 1 0 6.7 6.7Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    )
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M7 1v1.6M7 11.4V13M1 7h1.6M11.4 7H13M2.8 2.8l1.1 1.1M10.1 10.1l1.1 1.1M2.8 11.2l1.1-1.1M10.1 3.9l1.1-1.1"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  )
}
