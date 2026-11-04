'use client'

import { contacts } from '@/content/site'
import { useLocale } from '../useLocale'
import styles from './Footer.module.css'

const links = [
  { href: `mailto:${contacts.email}`, label: 'Email' },
  { href: contacts.telegram, label: 'Telegram' },
  { href: contacts.behance, label: 'Behance' },
  { href: contacts.github, label: 'GitHub' },
]

/** Подвал: кто и где, контакты, год */
export function Footer() {
  const { t } = useLocale()
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>{t.footer.place}</span>
        <ul className={styles.links}>
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <span>© 2026</span>
      </div>
    </footer>
  )
}
