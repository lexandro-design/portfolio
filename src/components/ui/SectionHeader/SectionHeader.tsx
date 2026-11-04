import type { SectionCopy } from '@/i18n/dict/types'
import { Reveal } from '../Reveal'
import styles from './SectionHeader.module.css'

/** Шапка секции: заголовок крупно, рядом тихое пояснение */
export function SectionHeader({ copy }: { copy: SectionCopy }) {
  return (
    <Reveal className={styles.header}>
      <h2 className={styles.title}>{copy.title}</h2>
      {copy.aside && <p className={styles.aside}>{copy.aside}</p>}
    </Reveal>
  )
}
