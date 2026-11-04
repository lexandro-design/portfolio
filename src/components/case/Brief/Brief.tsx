import type { Brief as Data } from '@/content/showcase'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { CountUp } from './CountUp'
import styles from './Brief.module.css'

/**
 * «Коротко» сразу под шапкой: крупные цифры, задача, что сделал, результат.
 * За десять секунд понятно, что за проект и чем кончился, остальное ниже
 */
export function Brief({ brief, t }: { brief: Data; t: Dict['case']['brief'] }) {
  return (
    <section className={styles.root} aria-label={t.label}>
      <div className="container">
        {brief.nums.length > 0 && (
          <Reveal className={styles.nums}>
            {brief.nums.map((n) => (
              <div key={n.l} className={styles.num}>
                <CountUp value={n.v} className={styles.v} />
                <span className={styles.l}>{n.l}</span>
              </div>
            ))}
          </Reveal>
        )}
        <Reveal className={styles.grid}>
          <div className={styles.col}>
            <span className={styles.label}>{t.task}</span>
            <p className={styles.task}>{brief.task}</p>
          </div>
          <div className={styles.col}>
            <span className={styles.label}>{t.did}</span>
            <ol className={styles.did}>
              {brief.did.map((d, i) => (
                <li key={d}>
                  {d}
                </li>
              ))}
            </ol>
          </div>
          <div className={`${styles.col} ${styles.result}`}>
            <span className={styles.label}>{t.result}</span>
            <p>{brief.result}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
