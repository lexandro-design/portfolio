import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { ScrollWords } from '@/components/ui/ScrollWords'
import styles from './About.module.css'

/** Обо мне: подход крупным текстом слева, опыт строками справа */
export function About({ t }: { t: Dict['about'] }) {
  return (
    <div className={styles.grid}>
      <div className={styles.text}>
        <ScrollWords text={t.lead} className={styles.lead} />
        {t.text.map((p) => (
          <p key={p.slice(0, 24)} className={styles.p}>
            {p}
          </p>
        ))}
      </div>

      <ol className={styles.timeline}>
        {t.timeline.map((row, i) => (
          <Reveal as="li" key={row.title} className={styles.row} delay={i * 80}>
            <span className={styles.when}>{row.when}</span>
            <div>
              <h3 className={styles.title}>{row.title}</h3>
              <p className={styles.p}>{row.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}
