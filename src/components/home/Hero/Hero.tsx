import { COORDS, PHOTO, SECTION_COUNT } from '@/content/site'
import { localePath, type Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'
import { asset } from '@/lib/asset'
import { Button } from '@/components/ui/Button'
import { Clock } from '@/components/ui/Clock'
import { Ticker } from '@/components/ui/Ticker'
import styles from './Hero.module.css'

type Props = { t: Dict['hero']; locale: Locale; ticker: string[] }

/**
 * Первый экран: мета по краям, заголовок слева и фото справа, под ними
 * описание и действия. Высота по содержимому, а не на весь экран:
 * растянутый первый экран давал дыру между метой и заголовком.
 */
export function Hero({ t, locale, ticker }: Props) {
  const lines = [
    ...t.title.map((text) => ({ text, accent: false })),
    ...t.accent.map((text) => ({ text, accent: true })),
  ]
  return (
    <section className={`container ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.meta}>
        <div>
          {t.metaLeft.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className={styles.metaEnd}>
          <span>{COORDS}</span>
          <Clock />
        </div>
      </div>

      <div className={styles.main}>
        <h1 id="hero-title" className={styles.title}>
          {lines.map((line, i) => (
            <span
              key={line.text}
              className={styles.line}
              data-accent={line.accent || undefined}
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              {line.text}
            </span>
          ))}
        </h1>

        <figure className={styles.photo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
          <img src={asset(PHOTO.src)} alt={t.photoAlt} width={PHOTO.w} height={PHOTO.h} />
          <figcaption>{t.photoCaption}</figcaption>
        </figure>
      </div>

      <div className={styles.bottom}>
        <p className={styles.lead}>{t.body}</p>
        <div className={styles.actions}>
          <div className={styles.buttons}>
            <Button href={localePath(locale, '/#contact')}>{t.primary}</Button>
            <Button href={localePath(locale, '/#works')} variant="ghost">
              {t.secondary}
            </Button>
          </div>
          <Ticker label={t.ticker} items={ticker} />
        </div>
      </div>

      <div className={styles.foot}>
        <span>01 / {String(SECTION_COUNT).padStart(2, '0')} · intro</span>
        <a href="#services" className={styles.scroll}>
          {t.scroll}
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  )
}
