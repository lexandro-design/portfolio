'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { contacts } from '@/content/site'
import { LOCALE_LABELS, LOCALES, localePath, type Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'
import styles from './MobileMenu.module.css'

type Props = {
  links: { href: string; label: string }[]
  locale: Locale
  rest: string
  t: Dict['nav']
}

/**
 * Меню на планшете и телефоне: кнопка в шапке и полноэкранный слой
 * с разделами, языками и контактами. Нативный <dialog>: фокус, Esc и
 * инертный фон браузер держит сам.
 */
export function MobileMenu({ links, locale, rest, t }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Переход на другую страницу закрывает меню
  useEffect(() => {
    ref.current?.close()
  }, [pathname])

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-label={t.menuOpen}
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
      </button>

      <dialog
        ref={ref}
        className={styles.menu}
        aria-label={t.menuOpen}
        onClose={() => setOpen(false)}
      >
        <div className={`container ${styles.head}`}>
          <span className={styles.logo}>LEXANDRO</span>
          <button
            type="button"
            className={styles.close}
            aria-label={t.menuClose}
            onClick={() => setOpen(false)}
          >
            <span />
            <span />
          </button>
        </div>

        <nav className={`container ${styles.links}`}>
          {links.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              style={{ animationDelay: `${80 + i * 60}ms` }}
              onClick={() => setOpen(false)}
            >
              <span className={styles.index}>0{i + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={`container ${styles.foot}`}>
          <div className={styles.langs} aria-label={t.language}>
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={localePath(l, rest)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {LOCALE_LABELS[l]}
              </Link>
            ))}
          </div>
          <a href={contacts.telegram} target="_blank" rel="noreferrer">
            telegram {contacts.telegramHandle}
          </a>
          <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
          <a href={contacts.github} target="_blank" rel="noreferrer">
            github
          </a>
        </div>
      </dialog>
    </>
  )
}
