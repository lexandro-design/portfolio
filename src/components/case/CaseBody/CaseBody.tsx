import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Shot } from '@/components/ui/Shot'
import { ShotTheme } from '../ShotTheme'
import styles from './CaseBody.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/** Разделы кейса и галерея экранов */
export function CaseBody({ item, t }: { item: Case; t: Dict['case'] }) {
  // Если обложка собрана отдельно, в галерею идут все скрины, иначе первый уже в шапке
  const offset = item.cover ? 0 : 1
  const gallery = item.shots.slice(offset)
  return (
    <>
      {item.sections.map((s, i) => (
        <section key={s.title} className={styles.section}>
          <Reveal className={`container ${styles.grid}`}>
            <div className={styles.head}>
              <span className={styles.label}>
                {pad(i + 1)} / {pad(item.sections.length)}
              </span>
              <h2 className={styles.title}>{s.title}</h2>
            </div>
            <div className={styles.body}>
              {s.body.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </section>
      ))}

      {gallery.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <Reveal className={styles.galleryHead}>
              <span className={styles.label}>
                {pad(item.sections.length + 1)} · {t.screens}
              </span>
              {item.note && <span className={styles.label}>{item.note}</span>}
              {gallery.some((s) => s.dark) && <ShotTheme labels={t.shotTheme} />}
            </Reveal>
            <div className={styles.gallery}>
              {gallery.map((shot, i) => (
                <Reveal as="figure" key={shot.src} className={styles.figure} delay={(i % 2) * 80}>
                  <Shot shot={shot} className={styles.image} zoom />
                  <figcaption className={styles.label}>
                    {pad(i + 1 + offset)} · {shot.caption}
                  </figcaption>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
