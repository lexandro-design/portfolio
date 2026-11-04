import type { Shot as ShotType } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { Shot } from '@/components/ui/Shot'
import styles from './Mood.module.css'

type Props = { shots: ShotType[]; title: string; t: Dict['case']['mood'] }

/** Иллюстрации настроения: первая крупно, остальные сеткой. Подпись всегда видна, чтобы никто не принял их за результат */
export function Mood({ shots, title, t }: Props) {
  return (
    <section className={`container ${styles.mood}`}>
      <h2 className={styles.title}>{t.title}</h2>
      <div className={styles.grid}>
        {shots.map((shot, i) => (
          <figure key={shot.src} className={styles.cell} data-lead={i === 0 || undefined}>
            <Shot shot={{ ...shot, caption: `${title}. ${t.note}` }} className={styles.image} />
          </figure>
        ))}
      </div>
      <p className={styles.note}>{t.note}</p>
    </section>
  )
}
