import Link from 'next/link'
import type { Case } from '@/content/cases'
import { Arrow } from '@/components/ui/Arrow'
import { Reveal } from '@/components/ui/Reveal'
import styles from './CaseIndexRow.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/** Кейс без скриншотов — строкой индекса: номер, название, лид, направление и год */
export function CaseIndexRow({ item, index }: { item: Case; index: number }) {
  return (
    <Reveal as="li" className={styles.row}>
      <Link href={`/cases/${item.slug}/`} className={styles.link}>
        <span className={styles.number}>{pad(index)}</span>
        <span className={styles.title}>
          {item.title}
          <span className={styles.tagline}>{item.tagline}</span>
        </span>
        <span className={styles.lead}>{item.lead}</span>
        <span className={styles.meta}>
          <span>{item.label}</span>
          <span>{item.year}</span>
        </span>
        <span className={styles.arrow}>
          <Arrow size={20} />
        </span>
      </Link>
    </Reveal>
  )
}
