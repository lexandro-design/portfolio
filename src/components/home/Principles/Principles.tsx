import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import styles from './Principles.module.css'

/** Четыре правила: заголовок и пояснение, без оформления вокруг */
export function Principles({ items }: { items: Dict['principles'] }) {
  return (
    <ul className={styles.list}>
      {items.map((p) => (
        <Reveal as="li" key={p.title} className={styles.item}>
          <h3 className={styles.title}>{p.title}</h3>
          <p className={styles.text}>{p.text}</p>
        </Reveal>
      ))}
    </ul>
  )
}
