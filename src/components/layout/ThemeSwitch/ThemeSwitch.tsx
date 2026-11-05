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

/** Переключатель тем из THEMES. Выбор помнится */
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
  if (id === 'moon')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M11.6 8.7A5 5 0 0 1 5.3 2.4a5 5 0 1 0 6.3 6.3z" fill="currentColor" />
      </svg>
    )
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1.2c.5 3.5 2.3 5.3 5.8 5.8-3.5.5-5.3 2.3-5.8 5.8-.5-3.5-2.3-5.3-5.8-5.8C4.7 6.500 6.500 4.700 7 1.200z" fill="currentColor" />
    </svg>
  )
}
