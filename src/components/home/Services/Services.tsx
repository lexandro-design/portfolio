import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { Reveal } from '@/components/ui/Reveal'
import { FilterLink } from '../Works'
import styles from './Services.module.css'

/** Три направления карточками в одну линию, ссылка включает фильтр кейсов */
export function Services({ items, more }: { items: Dict['services']; more: string }) {
  return (
    <div className={styles.grid}>
      {items.map((s, i) => (
        <Reveal key={s.code} className={styles.card} delay={i * 80}>
          <div className={styles.meta}>
            <span>
              0{i + 1} / {s.code}
            </span>
            <span>
              0{i + 1}/0{items.length}
            </span>
          </div>
          <h3 className={styles.title}>{s.title}</h3>
          <p className={styles.text}>{s.text}</p>
          <p className={styles.price}>{s.price}</p>
          <ul className={styles.tags}>
            {s.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <FilterLink direction={s.filter} className={styles.more}>
            {more}
            <span className={styles.arrow}>
              <Arrow />
            </span>
          </FilterLink>
        </Reveal>
      ))}
    </div>
  )
}
