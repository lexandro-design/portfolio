import { hero, SECTION_COUNT } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { Clock } from '@/components/ui/Clock'
import { Ticker } from '@/components/ui/Ticker'
import styles from './Hero.module.css'

/** Первый экран: мета по краям, крупный заголовок, описание и кнопки справа */
export function Hero() {
  return (
    <section className={`container ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.meta}>
        <div>
          {hero.metaLeft.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className={styles.metaEnd}>
          <span>{hero.coords}</span>
          <Clock />
        </div>
      </div>

      <div className={styles.body}>
        <h1 id="hero-title" className={styles.title}>
          {hero.title.map((line, i) => (
            <span
              key={line}
              className={styles.line}
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              {line}
            </span>
          ))}
        </h1>

        <div className={styles.aside}>
          <p className={styles.lead}>{hero.body}</p>
          <div className={styles.actions}>
            <Button href="/#contact">обсудить проект</Button>
            <Button href="/#works" variant="ghost">
              посмотреть кейсы
            </Button>
          </div>
          <Ticker label="сейчас в работе:" items={hero.ticker} />
        </div>
      </div>

      <div className={styles.foot}>
        <span>01 / {String(SECTION_COUNT).padStart(2, '0')} · intro</span>
        <a href="#services" className={styles.scroll}>
          листайте вниз
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  )
}
