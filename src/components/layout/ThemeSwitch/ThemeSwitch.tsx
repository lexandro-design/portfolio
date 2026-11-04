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

type Props = { label: string; labels: Record<Theme, string> }

/** Переключатель трёх тем: тёмная, неон, светлая. Выбор помнится */
export function ThemeSwitch({ label, labels }: Props) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME)

  return (
    <div className={styles.switch} role="radiogroup" aria-label={label}>
      {THEMES.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={theme === id}
          aria-label={labels[id]}
          title={labels[id]}
          className={styles.option}
          onClick={() => applyTheme(id)}
        >
          <Icon id={id} />
        </button>
      ))}
    </div>
  )
}

export function ThemeIcon({ id }: { id: Theme }) {
  return <Icon id={id} />
}

function Icon({ id }: { id: Theme }) {
  if (id === 'dark')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="4" fill="currentColor" />
      </svg>
    )
  if (id === 'neon')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M8.2 1.2 3.2 8h3.3l-.9 4.8 5.2-7H7.4z" fill="currentColor" />
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
