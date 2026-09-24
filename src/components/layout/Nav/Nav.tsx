import Link from 'next/link'
import { contacts, nav } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { ThemeSwitch } from '../ThemeSwitch'
import styles from './Nav.module.css'

/** Шапка: логотип, разделы, статус, переключатель тем, «написать» */
export function Nav() {
  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="LEXANDRO, на главную">
          LEXANDRO
        </Link>

        <nav className={styles.links} aria-label="Разделы">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.side}>
          <span className={styles.status}>
            <span className={styles.dot} />
            открыт к проектам
          </span>
          <ThemeSwitch />
          <Button href={contacts.telegram} external className={styles.cta}>
            написать
          </Button>
        </div>
      </div>
    </header>
  )
}
