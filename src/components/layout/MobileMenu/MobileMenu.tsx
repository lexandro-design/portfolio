'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { contacts, nav } from '@/content/site'
import styles from './MobileMenu.module.css'

/**
 * Меню на планшете и телефоне: кнопка в шапке и полноэкранный слой
 * с разделами и контактами. Нативный <dialog>: фокус, Esc и инертный
 * фон браузер держит сам.
 */
export function MobileMenu() {
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
        aria-label="Открыть меню"
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
      </button>

      <dialog ref={ref} className={styles.menu} aria-label="Меню" onClose={() => setOpen(false)}>
        <div className={`container ${styles.head}`}>
          <span className={styles.logo}>LEXANDRO</span>
          <button
            type="button"
            className={styles.close}
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
          >
            <span />
            <span />
          </button>
        </div>

        <nav className={`container ${styles.links}`} aria-label="Разделы">
          {nav.map((item, i) => (
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
