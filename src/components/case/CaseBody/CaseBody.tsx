import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Scheme } from '../Scheme'
import { ShotTheme } from '../ShotTheme'
import { Filmstrip } from './Filmstrip'
import styles from './CaseBody.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = {
  item: Case
  t: Dict['case']
  /** Разделы, которые уже стоят пояснением в главах раскрытия — здесь не повторяются */
  used: number[]
}

/**
 * Хвост кейса после глав: схема «как работает», разделы текста, которым
 * не нашлось демо, и все экраны лентой — для тех, кто хочет рассмотреть
 */
export function CaseBody({ item, t, used }: Props) {
  const rest = item.sections.filter((_, i) => !used.includes(i))
  return (
    <>
      {item.scheme && (
        <section className={styles.section}>
          <Reveal className="container">
            <div className={styles.schemeHead}>
              <span className={styles.label}>{t.scheme}</span>
            </div>
            <Scheme scheme={item.scheme} />
          </Reveal>
        </section>
      )}

      {rest.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <Reveal className={styles.storyHead}>
              <span className={styles.label}>{t.story}</span>
            </Reveal>
            <div className={styles.story} data-count={Math.min(rest.length, 3)}>
              {rest.map((s, i) => (
                <Reveal key={s.title} className={styles.part} delay={(i % 3) * 80}>
                  <h2 className={styles.title}>{s.title}</h2>
                  <div className={styles.body}>
                    {s.body.map((p) => (
                      <p key={p.slice(0, 32)}>{p}</p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {item.shots.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <Reveal className={styles.galleryHead}>
              <span className={styles.label}>
                {t.screens} · {pad(item.shots.length)}
              </span>
              {item.note && <span className={styles.label}>{item.note}</span>}
              {item.shots.some((s) => s.dark) && <ShotTheme labels={t.shotTheme} />}
            </Reveal>
          </div>
          <Filmstrip shots={item.shots} labels={{ prev: t.prev, next: t.nextShot }} />
        </section>
      )}
    </>
  )
}
