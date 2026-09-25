import Link from 'next/link'
import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { Shot } from '@/components/ui/Shot'
import styles from './CaseHero.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = {
  item: Case
  index: number
  total: number
  t: Dict['case']
  directions: Dict['works']['directions']
  /** Куда ведёт «все кейсы» — главная на своём языке */
  backHref: string
}

/** Шапка кейса: назад, мета, заголовок, лид, сетка фактов и обложка */
export function CaseHero({ item, index, total, t, directions, backHref }: Props) {
  const facts = [
    { label: t.facts.client, value: item.client },
    { label: t.facts.year, value: item.year },
    { label: t.facts.direction, value: item.directions.map((d) => directions[d]).join(', ') },
    { label: t.facts.stack, value: item.stack.join(' · ') },
  ]
  // Собранная обложка — картинка-композиция, её не увеличиваем; скрин — можно
  const cover = item.cover ?? item.shots[0]
  const zoomable = !item.cover && Boolean(cover)

  return (
    <header className={styles.hero}>
      <div className="container">
        <Link href={backHref} className={styles.back}>
          <Arrow dir="left" />
          {t.back}
        </Link>

        <div className={styles.meta}>
          <span>
            case {pad(index)} / {pad(total)} · {item.label}
          </span>
          <span>{item.year}</span>
        </div>

        <h1 className={styles.title}>
          {item.title}
          <span className={styles.tagline}> · {item.tagline}</span>
        </h1>
        <p className={styles.lead}>{item.lead}</p>

        <dl className={styles.facts}>
          {facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
          {item.link && (
            <div className={styles.fact}>
              <dt>{t.facts.site}</dt>
              <dd>
                <a href={item.link.href} target="_blank" rel="noreferrer" className={styles.site}>
                  {item.link.label}
                  <Arrow size={12} dir="up-right" />
                </a>
              </dd>
            </div>
          )}
        </dl>

        <figure className={styles.cover}>
          {cover ? (
            <Shot
              shot={{ ...cover, caption: cover.caption || item.title }}
              className={styles.image}
              eager
              zoom={zoomable}
            />
          ) : (
            <CasePreview index={index} year={item.year} stack={item.stack} size="cover" />
          )}
          {zoomable && <figcaption className={styles.caption}>{cover.caption}</figcaption>}
        </figure>
      </div>
    </header>
  )
}
