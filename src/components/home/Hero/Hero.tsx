import { localePath, type Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'
import { Button } from '@/components/ui/Button'
import { Stage } from './Stage'
import styles from './Hero.module.css'

type Props = {
  t: Dict['hero']
  locale: Locale
  /** Работа на сцене: название и что это */
  stage: { title: string; text: string }
}

/**
 * Первый экран: фраза на всю ширину в две строки, на телефоне по смыслу
 * в четыре, под ней описание и действия. Ниже из темноты поднимается работа
 */
export function Hero({ t, locale, stage }: Props) {
  const lines = [...t.title, ...t.accent]
  const split = Math.ceil(lines.length / 2)
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.head}`}>
        <h1 id="hero-title" className={styles.title}>
          {[lines.slice(0, split), lines.slice(split)].map((row, r) => (
            <span key={r} className={styles.row}>
              {row.map((line, i) => (
                <span
                  key={line}
                  className={styles.line}
                  style={{ animationDelay: `${80 + (r * split + i) * 110}ms` }}
                >
                  {line}{' '}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className={styles.under}>
          <p className={styles.lead}>{t.body}</p>
          <div className={styles.actions}>
            <Button href={localePath(locale, '/#contact')}>{t.primary}</Button>
            <Button href={localePath(locale, '/#works')} variant="text">
              {t.secondary}
            </Button>
          </div>
        </div>
      </div>

      <Stage href={localePath(locale, '/cases/parfumeria/')} title={stage.title} text={stage.text} />
    </section>
  )
}
