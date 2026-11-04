import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import styles from './Principles.module.css'

/** Четыре правила строками: номер, заголовок, пояснение */
export function Principles({ items }: { items: Dict['principles'] }) {
  return (
    <ol className={styles.list}>
      {items.map((p, i) => (
        <Reveal as="li" key={p.title} className={styles.item}>
          <span className={styles.number}>0{i + 1}</span>
          <div className={styles.body}>
            <h3 className={styles.title}>{p.title}</h3>
            <p className={styles.text}>{p.text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  )
}
