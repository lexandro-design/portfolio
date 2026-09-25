import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import styles from './Process.module.css'

/** Пять шагов: крупная цифра контуром слева, шаг и описание справа */
export function Process({ t }: { t: Dict['process'] }) {
  return (
    <ol className={styles.list}>
      {t.steps.map((step, i) => (
        <Reveal as="li" key={step.title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            0{i + 1}
          </span>
          <div className={styles.body}>
            <span className={styles.label}>
              {t.step} 0{i + 1}
            </span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.text}>{step.text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  )
}
