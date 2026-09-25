import Link from 'next/link'
import type { Case } from '@/content/cases'
import { Arrow } from '@/components/ui/Arrow'
import styles from './NextCase.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = { item: Case; index: number; total: number; href: string; label: string }

/** Переход к следующему кейсу по кругу */
export function NextCase({ item, index, total, href, label }: Props) {
  return (
    <Link href={href} className={styles.next}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.label}>
          {label} · {pad(index)} / {pad(total)}
        </span>
        <div className={styles.row}>
          <span className={styles.title}>
            {item.title}
            <span className={styles.tagline}> · {item.tagline}</span>
          </span>
          <span className={styles.arrow}>
            <Arrow size={40} />
          </span>
        </div>
      </div>
    </Link>
  )
}
