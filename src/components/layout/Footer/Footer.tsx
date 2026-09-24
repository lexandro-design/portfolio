import { contacts } from '@/content/site'
import styles from './Footer.module.css'

const links = [
  { href: `mailto:${contacts.email}`, label: 'email' },
  { href: contacts.telegram, label: 'telegram' },
  { href: contacts.github, label: 'github' },
]

/** Подвал: кто и где, контакты, год */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.col}>
          <span className={styles.primary}>LEXANDRO · дизайн, разработка, автоматизация</span>
          <span>Алексей Свешников · санкт-петербург</span>
        </div>
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
        <div className={`${styles.col} ${styles.end}`}>
          <span>© {new Date().getFullYear()}</span>
          <span>next.js · github pages</span>
        </div>
      </div>
    </footer>
  )
}
