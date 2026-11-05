'use client'

import { useSyncExternalStore } from 'react'
import { BASE_THEMES, DEFAULT_THEME, SKY_THEMES, THEMES, type Theme } from '@/content/site'
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

/* Космос тяжёлый: перед включением SkyGuard показывает окно. Выбор «не спрашивать» и тема, куда
   вернуться, живут в localStorage */
export const SKY_ASK = 'skyask'
export type SkyAskDetail = { next: Theme; stay?: Theme }
const ASK_KEY = 'sky-ask'
const BACK_KEY = 'sky-back'

const skyAsks = () => {
  try {
    return localStorage.getItem(ASK_KEY) !== 'no'
  } catch {
    return true
  }
}

export const neverAskSky = () => {
  try {
    localStorage.setItem(ASK_KEY, 'no')
  } catch {}
}

/** Выбор темы человеком. stay: куда перейти, если он откажется от Космоса (перебор тем по кругу иначе упрётся в окно) */
export function pickTheme(next: Theme, stay?: Theme) {
  if (SKY_THEMES.includes(next) && !SKY_THEMES.includes(readTheme()) && skyAsks()) {
    window.dispatchEvent(new CustomEvent<SkyAskDetail>(SKY_ASK, { detail: { next, stay } }))
    return
  }
  applyTheme(next)
}

/** Откат из Космоса одним нажатием: на тему, с которой включили, иначе на первую обычную */
export function leaveSky() {
  let back: string | null = null
  try {
    back = localStorage.getItem(BACK_KEY)
  } catch {}
  const usable = THEMES.filter((t) => !SKY_THEMES.includes(t))
  applyTheme(usable.find((t) => t === back) ?? usable.find((t) => t === DEFAULT_THEME) ?? usable[0])
}

/** Спокойный вид включается и выключается одной кнопкой: выключение возвращает тему, с которой включили */
const CALM_BACK = 'calm-back'

export function toggleCalm() {
  if (readTheme() !== 'calm') {
    try {
      localStorage.setItem(CALM_BACK, readTheme())
    } catch {}
    applyTheme('calm')
    return
  }
  let back: string | null = null
  try {
    back = localStorage.getItem(CALM_BACK)
  } catch {}
  const usable = THEMES.filter((t) => t !== 'calm' && !SKY_THEMES.includes(t))
  applyTheme(usable.find((t) => t === back) ?? usable.find((t) => t === DEFAULT_THEME) ?? usable[0])
}

/** Сменить тему сайта: шапка, блок «Система» и палитра команд подписаны на событие */
export function applyTheme(next: Theme) {
  const root = document.documentElement
  const was = readTheme()
  const commit = () => {
    if (SKY_THEMES.includes(next) && !SKY_THEMES.includes(was)) {
      try {
        localStorage.setItem(BACK_KEY, was)
      } catch {}
    }
    root.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT))
  }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
  if (!doc.startViewTransition || next === readTheme() || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    commit()
    return
  }
  /* Плавность даёт браузер: он делает снимок старой страницы и растворяет его в новую на видеокарте.
     Покрасочные transition у всех элементов на это время выключены (data-swap), иначе тысяча узлов
     пересчитывает цвет на каждом кадре и телефон теряет половину кадров */
  root.dataset.swap = ''
  const done = () => delete root.dataset.swap
  try {
    doc.startViewTransition(commit).finished.then(done, done)
  } catch {
    commit()
    done()
  }
}

type Props = {
  label: string
  labels: Record<Theme, string>
  /** Все кнопки и на узком телефоне: в блоке «Система» места хватает, это не шапка */
  full?: boolean
}

/** Переключатель тем из THEMES. Выбор помнится */
export function ThemeSwitch({ label, labels, full }: Props) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME)

  /* У спокойного вида своя кнопка с подписью (CalmToggle), здесь только в полном списке */
  const list = full ? THEMES : THEMES.filter((t) => t !== 'calm')
  const next = list[(list.indexOf(theme) + 1) % list.length]
  const afterNext = list[(list.indexOf(next) + 1) % list.length]

  return (
    <>
      <div className={styles.switch} data-full={full || undefined} role="radiogroup" aria-label={label}>
        {list.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={theme === id}
            aria-label={labels[id]}
            title={labels[id]}
            className={styles.option}
            data-extra={BASE_THEMES.includes(id) ? undefined : ''}
            onClick={() => pickTheme(id)}
          >
            <Icon id={id} />
          </button>
        ))}
      </div>
      {/* Узкая шапка: четыре кнопки в шапку не влезают пальцу, одна нормального размера листает темы по кругу */}
      <button
        type="button"
        className={styles.cycle}
        data-full={full || undefined}
        aria-label={`${label}: ${labels[theme]}`}
        title={labels[next]}
        onClick={() => pickTheme(next, afterNext)}
      >
        <Icon id={theme} />
      </button>
    </>
  )
}

export function ThemeIcon({ id }: { id: Theme }) {
  return <Icon id={id} />
}

function Icon({ id }: { id: Theme }) {
  if (id === 'calm')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M2 4.500h10M2 7h10M2 9.500h6" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    )
  if (id === 'dark')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="4" fill="currentColor" />
      </svg>
    )
  if (id === 'space')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1.2c.5 3.5 2.3 5.3 5.8 5.8-3.5.5-5.3 2.3-5.8 5.8-.5-3.5-2.3-5.3-5.8-5.8C4.700 6.500 6.500 4.700 7 1.200z" fill="currentColor" />
      </svg>
    )
  if (id === 'steel')
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1.2 12 4.1v5.8L7 12.8 2 9.9V4.1z" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="7" cy="7" r="1.8" fill="currentColor" />
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
