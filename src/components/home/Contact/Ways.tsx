'use client'

import { useEffect, useState } from 'react'
import { contacts } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import styles from './Contact.module.css'

const moscow = () =>
  new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }).format(new Date())

/** Три пути связи: написать, скопировать почту, собрать заявку. Время показывает, когда ждать ответа */
export function Ways({ t, hello }: { t: Dict['contact']['ways']; hello: string }) {
  const [copied, setCopied] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(moscow())
    const start = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 20000)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(id)
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contacts.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${contacts.email}`
    }
  }

  return (
    <div className={styles.ways}>
      <a
        href={`${contacts.telegram}?text=${encodeURIComponent(hello)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.way}
        data-main
      >
        <span className={styles.wayName}>{t.telegram}</span>
        <span className={styles.wayValue}>{contacts.telegramHandle}</span>
        <span className={styles.wayNote}>{t.telegramNote}</span>
        <span className={styles.wayArrow}>
          <Arrow size={24} />
        </span>
      </a>
      <button type="button" className={styles.way} onClick={copy}>
        <span className={styles.wayName}>{t.email}</span>
        <span className={styles.wayValue} data-small>
          {contacts.email.replace('@', '\u200b@')}
        </span>
        <span className={styles.wayNote} aria-live="polite">
          {copied ? t.copied : t.emailNote}
        </span>
      </button>
      <a href="#brief" className={styles.way}>
        <span className={styles.wayName}>{t.brief}</span>
        <span className={styles.wayValue} data-small>
          {t.briefValue}
        </span>
        <span className={styles.wayNote}>{t.briefNote}</span>
      </a>
      <p className={styles.time}>{time && `${t.time} ${time}`}</p>
    </div>
  )
}
