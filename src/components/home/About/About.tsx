import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Numbers, type NumberItem } from './Numbers'
import { Sources } from './Sources'
import styles from './About.module.css'

type Props = {
  t: Dict['about']
  where: Dict['works']['where']
  counts: { group: Case['group']; n: number }[]
  numbers: { items: NumberItem[]; langs: { name: string; share: number }[]; date: string }
}

/** Обо мне: подход крупным текстом слева, опыт строками справа */
export function About({ t, where, counts, numbers }: Props) {
  return (
    <>
    <div className={styles.grid}>
      <Reveal className={styles.text}>
        <p className={styles.lead}>{t.lead}</p>
        {t.text.map((p) => (
          <p key={p.slice(0, 24)} className={styles.p}>
            {p}
          </p>
        ))}
      </Reveal>

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
    <Sources t={t.sources} labels={where} counts={counts} facts={t.facts} />
    <Numbers t={t.numbers} items={numbers.items} langs={numbers.langs} date={numbers.date} />
    </>
  )
}
