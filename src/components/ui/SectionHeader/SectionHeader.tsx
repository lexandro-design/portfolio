import { SECTION_COUNT } from '@/content/site'
import type { SectionCopy } from '@/i18n/dict/types'
import { Reveal } from '../Reveal'
import styles from './SectionHeader.module.css'

const pad = (v: number) => String(v).padStart(2, '0')

/** Шапка секции: «02 / 08 · услуги» слева, пояснение справа, под ними H2 */
export function SectionHeader({ index, copy }: { index: number; copy: SectionCopy }) {
  return (
    <Reveal className={styles.header}>
      <div className={styles.meta}>
        <span>
          {pad(index)} / {pad(SECTION_COUNT)} · {copy.label}
        </span>
        {copy.aside && <span className={styles.aside}>{copy.aside}</span>}
      </div>
      <h2 className={styles.title}>{copy.title}</h2>
    </Reveal>
  )
}
