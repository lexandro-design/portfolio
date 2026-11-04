import Link from 'next/link'
import styles from './Logo.module.css'

/** Логотип-вордмарк: широкий гротеск Unbounded отделяет бренд от текста сайта */
export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className={styles.logo}>
      LEXANDRO
    </Link>
  )
}
