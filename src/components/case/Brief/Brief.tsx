import type { Brief as Data } from '@/content/showcase'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { CountUp } from './CountUp'
import styles from './Brief.module.css'

/**
 * «Коротко» сразу под шапкой: задача, что сделал, результат и крупные цифры.
 * За десять секунд понятно, что за проект и чем кончился, остальное ниже.
 * Вторая строка той же таблицы: кем я был в проекте и как шла работа.
 * Она есть только там, где это подтверждено материалами кейса
 */
export function Brief({ brief, t }: { brief: Data; t: Dict['case']['brief'] }) {
  const process = brief.process ?? []
  return (
    <section className={styles.root} aria-label={t.label}>
      <div className="container">
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
                  <span className={styles.n}>{String(i + 1).padStart(2, '0')}</span>
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
        {(brief.role || process.length > 0) && (
          <Reveal className={styles.more} delay={60}>
            {brief.role && (
              <div className={styles.col}>
                <span className={styles.label}>{t.role}</span>
                <p className={styles.role}>{brief.role}</p>
              </div>
            )}
            {process.length > 0 && (
              <div className={`${styles.col} ${styles.wide}`}>
                <span className={styles.label}>{t.process}</span>
                <ul className={styles.process}>
                  {process.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        )}
        {brief.nums.length > 0 && (
          <Reveal className={brief.nums.length === 1 ? `${styles.nums} ${styles.one}` : styles.nums} delay={120}>
            {brief.nums.map((n) => (
              <div key={n.l} className={styles.num}>
                <CountUp value={n.v} className={styles.v} />
                <span className={styles.l}>{n.l}</span>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  )
}
