import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Shot } from '@/components/ui/Shot'
import { Scheme } from '../Scheme'
import { ShotTheme } from '../ShotTheme'
import styles from './CaseBody.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Подробности после интерактивных блоков: разделы текста колонками,
 * схема и все экраны компактной сеткой — для тех, кто хочет рассмотреть
 */
export function CaseBody({ item, t }: { item: Case; t: Dict['case'] }) {
  // Если обложка собрана отдельно, в галерею идут все скрины, иначе первый уже в шапке
  const offset = item.cover ? 0 : 1
  const gallery = item.shots.slice(offset)
  return (
    <>
      <section className={styles.section}>
        <div className="container">
          <Reveal className={styles.storyHead}>
            <span className={styles.label}>{t.story}</span>
          </Reveal>
          <div className={styles.story} data-count={Math.min(item.sections.length, 3)}>
            {item.sections.map((s, i) => (
              <Reveal key={s.title} className={styles.part} delay={(i % 3) * 80}>
                <span className={styles.label}>
                  {pad(i + 1)} / {pad(item.sections.length)}
                </span>
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

      {gallery.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <Reveal className={styles.galleryHead}>
              <span className={styles.label}>
                {t.screens} · {pad(gallery.length)}
              </span>
              {item.note && <span className={styles.label}>{item.note}</span>}
              {gallery.some((s) => s.dark) && <ShotTheme labels={t.shotTheme} />}
            </Reveal>
            <div className={styles.gallery}>
              {gallery.map((shot, i) => (
                <Reveal as="figure" key={shot.src} className={styles.figure} delay={(i % 4) * 60}>
                  <Shot shot={shot} className={styles.image} zoom />
                  <figcaption className={styles.caption}>
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
