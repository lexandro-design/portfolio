'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LOCALE_LABELS, LOCALES, localePath, type Locale } from '@/i18n/config'
import styles from './LangSwitch.module.css'

type Props = { locale: Locale; rest: string; label: string }

/** Выбор языка: кнопка с текущим и список. Ведёт на ту же страницу на другом языке */
export function LangSwitch({ locale, rest, label }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        {LOCALE_LABELS[locale]}
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
          <path d="M1 2.5 4 5.5 7 2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      {open && (
        <ul className={styles.list}>
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                href={localePath(l, rest)}
                hrefLang={l}
                lang={l}
                className={styles.item}
                aria-current={l === locale ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {LOCALE_LABELS[l]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
