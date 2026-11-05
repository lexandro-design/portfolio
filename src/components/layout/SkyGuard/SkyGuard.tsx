'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { SKY_HEAVY, SKY_READY } from '@/components/layout/Sky/events'
import { SKY_ASK, applyTheme, leaveSky, neverAskSky, readTheme, subscribeTheme, type SkyAskDetail } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import { SKY_THEMES, type Theme } from '@/content/site'
import { useLocale } from '../useLocale'
import styles from './SkyGuard.module.css'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
/** Сколько ждём первую картинку, прежде чем сказать про долгую загрузку */
const LOAD_LIMIT = 7000
/** Ниже этого кадров в секунду три секунды подряд сайт ощущается подвисшим */
const FPS_LIMIT = 24
const BAD_SECONDS = 3
/** Кадры считаем только первые секунды и при скролле: постоянный цикл сам по себе кушает батарею */
const WATCH_START = 15000
const WATCH_SCROLL = 3000
const HIDDEN_KEY = 'sky-warn-off'

type Warn = 'lag' | 'slow'

const warnHidden = () => {
  try {
    return sessionStorage.getItem(HIDDEN_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Страховка темы Космос. Перед включением окно с предупреждением, в теме постоянная кнопка
 * возврата в углу, а при просадке кадров или долгой загрузке кнопка разворачивается в подсказку.
 * Сама ничего не переключает: решает человек.
 */
export function SkyGuard() {
  const { t } = useLocale()
  const s = t.sky
  const on = useSyncExternalStore(subscribeTheme, () => SKY_THEMES.includes(readTheme()), () => false)
  const dialog = useRef<HTMLDialogElement>(null)
  const [asked, setAsked] = useState<SkyAskDetail | null>(null)
  const [never, setNever] = useState(false)
  const [warn, setWarn] = useState<Warn | null>(null)

  useEffect(() => {
    const open = (e: Event) => setAsked((e as CustomEvent<SkyAskDetail>).detail)
    addEventListener(SKY_ASK, open)
    return () => removeEventListener(SKY_ASK, open)
  }, [])

  useEffect(() => {
    if (asked && !dialog.current?.open) dialog.current?.showModal()
  }, [asked])

  const close = useCallback(() => {
    dialog.current?.close()
    setAsked(null)
  }, [])

  const enable = () => {
    if (never) neverAskSky()
    const next = asked?.next
    close()
    if (next) applyTheme(next)
  }
  const stay = () => {
    const other: Theme | undefined = asked?.stay
    close()
    if (other) applyTheme(other)
  }

  useEffect(() => {
    if (!on) return
    let ready = false
    let stop = 0
    let frame = 0
    let frames = 0
    let from = 0
    let bad = 0
    const raise = (w: Warn) => {
      if (!warnHidden()) setWarn((old) => old ?? w)
    }
    const count = (now: number) => {
      frame = 0
      frames += 1
      if (!from) from = now
      const span = now - from
      if (span >= 1000) {
        /* Вкладка спала: секунда не считается */
        if (span < 1500 && ready) {
          bad = (frames * 1000) / span < FPS_LIMIT ? bad + 1 : 0
          if (bad >= BAD_SECONDS) raise('lag')
        }
        frames = 0
        from = now
      }
      if (performance.now() < stop) frame = requestAnimationFrame(count)
      else from = 0
    }
    const watch = (ms: number) => {
      stop = Math.max(stop, performance.now() + ms)
      if (!frame) frame = requestAnimationFrame(count)
    }
    const onReady = () => {
      ready = true
      clearTimeout(late)
    }
    const onHeavy = () => raise('lag')
    const onScroll = () => watch(WATCH_SCROLL)
    const late = setTimeout(() => raise('slow'), LOAD_LIMIT)
    addEventListener(SKY_READY, onReady)
    addEventListener(SKY_HEAVY, onHeavy)
    addEventListener('scroll', onScroll, { passive: true })
    watch(WATCH_START)
    return () => {
      clearTimeout(late)
      cancelAnimationFrame(frame)
      removeEventListener(SKY_READY, onReady)
      removeEventListener(SKY_HEAVY, onHeavy)
      removeEventListener('scroll', onScroll)
      setWarn(null)
    }
  }, [on])

  const hide = () => {
    try {
      sessionStorage.setItem(HIDDEN_KEY, '1')
    } catch {}
    setWarn(null)
  }

  return (
    <>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="sky-ask-title"
        onCancel={(e) => {
          e.preventDefault()
          close()
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close()
        }}
      >
        {asked && (
          <div className={styles.card}>
            <div className={styles.orbit} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${BASE}/space/moon-card.webp`} alt="" width={150} height={150} />
            </div>
            {/* Не h2: тема Сталь красит заголовки по тегу, а окно одинаковое во всех темах */}
            <p id="sky-ask-title" role="heading" aria-level={2} className={styles.title}>
              {s.title}
            </p>
            <p className={styles.text}>{s.text}</p>
            <p className={styles.note}>{s.note}</p>
            <label className={styles.never}>
              <input type="checkbox" checked={never} onChange={(e) => setNever(e.target.checked)} />
              <span>{s.never}</span>
            </label>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={enable}>
                {s.enable}
              </button>
              <button type="button" className={styles.ghost} onClick={stay}>
                {s.stay}
              </button>
            </div>
          </div>
        )}
      </dialog>

      {on && (
        <div className={styles.dock} data-open={warn ? '' : undefined}>
          {warn && (
            <p className={styles.warn} role="status">
              {s[warn]}
            </p>
          )}
          <button type="button" className={styles.back} aria-label={s.back} title={s.back} onClick={leaveSky}>
            <Earth />
            <span className={styles.backLabel}>{s.back}</span>
          </button>
          {warn && (
            <button type="button" className={styles.hide} aria-label={s.hide} title={s.hide} onClick={hide}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" fill="none" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}

function Earth() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <circle cx="9" cy="9" r="7.4" />
      <path d="M1.6 9h14.8M9 1.6c2.1 2.1 3.1 4.6 3.1 7.4s-1 5.3-3.1 7.4C6.900 14.300 5.900 11.800 5.900 9S6.900 3.700 9 1.600z" />
    </svg>
  )
}
