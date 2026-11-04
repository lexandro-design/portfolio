import type { Dict } from '@/i18n/dict'
import { asset } from '@/lib/asset'
import { ScrollWords } from '@/components/ui/ScrollWords'
import styles from './About.module.css'

/** Обо мне: фото слева, подход крупным текстом справа, под ним опыт строками */
export function About({ t, alt }: { t: Dict['about']; alt: string }) {
  return (
    <div className={styles.grid}>
      <figure className={styles.photo}>
        {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
        <img src={asset('/me/photo.jpg')} alt={alt} width={720} height={900} loading="lazy" decoding="async" />
      </figure>

      <div className={styles.text}>
        <ScrollWords text={t.lead} className={styles.lead} />
        <div className={styles.columns}>
          {t.text.map((p) => (
            <p key={p.slice(0, 24)} className={styles.p}>
              {p}
            </p>
          ))}
        </div>

        <ol className={styles.timeline}>
          {t.timeline.map((row) => (
            <li key={row.title} className={styles.row}>
              <span className={styles.when}>{row.when}</span>
              <div>
                <h3 className={styles.title}>{row.title}</h3>
                <p className={styles.p}>{row.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
