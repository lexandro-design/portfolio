import type { Dict } from '@/i18n/dict'
import { Steps } from './Steps'
import styles from './Process.module.css'

/** Пять шагов по порядку: шаг на середине экрана светлый, остальные притихают */
export function Process({ t }: { t: Dict['process'] }) {
  return (
    <Steps className={styles.list}>
      {t.steps.map((step, i) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {i + 1}
          </span>
          <div className={styles.body}>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.text}>{step.text}</p>
          </div>
        </li>
      ))}
    </Steps>
  )
}
