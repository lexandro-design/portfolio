import { SECTION_COUNT } from '@/content/site'
import { Reveal } from '../Reveal'
import styles from './SectionHeader.module.css'

type Props = {
  index: number
  label: string
  title: string
  /** Строка справа: «три направления · один исполнитель» */
  aside?: string
}

const pad = (v: number) => String(v).padStart(2, '0')

/** Шапка секции: «02 / 06 · услуги» слева, пояснение справа, под ними H2 */
export function SectionHeader({ index, label, title, aside }: Props) {
  return (
    <Reveal className={styles.header}>
      <div className={styles.meta}>
        <span>
          {pad(index)} / {pad(SECTION_COUNT)} · {label}
        </span>
        {aside && <span className={styles.aside}>{aside}</span>}
      </div>
      <h2 className={styles.title}>{title}</h2>
    </Reveal>
  )
}
