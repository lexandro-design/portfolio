'use client'

import { useSyncExternalStore } from 'react'
import styles from './ThemeSwitch.module.css'

const THEMES = [
  { id: 'dark', label: 'Тёмная тема' },
  { id: 'warm', label: 'Тёплая тема' },
  { id: 'light', label: 'Светлая тема' },
] as const

type Theme = (typeof THEMES)[number]['id']

/* Тема живёт в data-theme на <html> (его же ставит ThemeScript до
   отрисовки), компонент на него только подписан */
const EVENT = 'themechange'
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
const read = () => (document.documentElement.dataset.theme as Theme | undefined) ?? 'dark'

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}

/** Переключатель трёх тем из макета: тёмная, тёплая, светлая. Выбор помнится */
export function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribe, read, () => 'dark' as Theme)

  return (
    <div className={styles.switch} role="radiogroup" aria-label="Тема">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={theme === t.id}
          aria-label={t.label}
          title={t.label}
          className={styles.option}
          onClick={() => applyTheme(t.id)}
        >
          <Icon id={t.id} />
        </button>
      ))}
    </div>
  )
}

function Icon({ id }: { id: Theme }) {
  if (id === 'dark')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="4" fill="currentColor" />
      </svg>
    )
  if (id === 'warm')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 2.75a4.25 4.25 0 0 1 0 8.5z" fill="currentColor" />
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
