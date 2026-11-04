import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Spotlight } from '@/components/ui/Spotlight'
import spot from '@/components/ui/Spotlight/Spotlight.module.css'
import styles from './Principles.module.css'

/** Четыре правила плитками: номер, заголовок, пояснение */
export function Principles({ items }: { items: Dict['principles'] }) {
  return (
    <Spotlight as="ol" className={styles.list}>
      {items.map((p, i) => (
        <Reveal as="li" key={p.title} className={`${spot.tile} ${styles.item}`} delay={(i % 2) * 80}>
          <span className={styles.number}>0{i + 1}</span>
          <div className={styles.body}>
            <h3 className={styles.title}>{p.title}</h3>
            <p className={styles.text}>{p.text}</p>
          </div>
        </Reveal>
      ))}
    </Spotlight>
  )
}
