import { services } from '@/content/site'
import { Arrow } from '@/components/ui/Arrow'
import { Reveal } from '@/components/ui/Reveal'
import { FilterLink } from '../Works'
import styles from './Services.module.css'

/** Три направления карточками в одну линию, ссылка ведёт к кейсам направления */
export function Services() {
  return (
    <div className={styles.grid}>
      {services.map((s, i) => (
        <Reveal key={s.code} className={styles.card} delay={i * 80}>
          <div className={styles.meta}>
            <span>
              0{i + 1} / {s.code}
            </span>
            <span>
              0{i + 1}/0{services.length}
            </span>
          </div>
          <h3 className={styles.title}>{s.title}</h3>
          <p className={styles.text}>{s.text}</p>
          <ul className={styles.tags}>
            {s.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <FilterLink direction={s.filter} className={styles.more}>
            кейсы направления
            <span className={styles.arrow}>
              <Arrow />
            </span>
          </FilterLink>
        </Reveal>
      ))}
    </div>
  )
}
