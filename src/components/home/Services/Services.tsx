import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { FilterLink } from '../Works'
import styles from './Services.module.css'

/** Три направления строками: название крупно, что входит, цена, ссылка включает фильтр кейсов */
export function Services({ items, more }: { items: Dict['services']; more: string }) {
  return (
    <ul className={styles.list}>
      {items.map((s) => (
        <Reveal as="li" key={s.code} className={styles.row}>
          <h3 className={styles.title}>{s.title}</h3>
          <div className={styles.body}>
            <p className={styles.text}>{s.text}</p>
            <p className={styles.tags}>{s.tags.join(', ')}</p>
          </div>
          <div className={styles.side}>
            <p className={styles.price}>{s.price}</p>
            <FilterLink direction={s.filter} className={styles.more}>
              {more}
            </FilterLink>
          </div>
        </Reveal>
      ))}
    </ul>
  )
}
