import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { HeroPhoto } from '@/components/home/Hero/HeroPhoto'
import { Reveal } from '@/components/ui/Reveal'
import { Sources } from './Sources'
import styles from './About.module.css'

type Props = {
  t: Dict['about']
  photo: { alt: string; caption: string }
  where: Dict['works']['where']
  counts: { group: Case['group']; n: number }[]
}

/** Обо мне: подход крупным текстом и фото слева, опыт строками справа */
export function About({ t, photo, where, counts }: Props) {
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
        <div className={styles.photo}>
          <HeroPhoto alt={photo.alt} caption={photo.caption} />
        </div>
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
    </>
  )
}
