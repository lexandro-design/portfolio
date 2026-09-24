import Link from 'next/link'
import { DIRECTION_LABELS, type Case } from '@/content/cases'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { Shot } from '@/components/ui/Shot'
import styles from './CaseHero.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = { item: Case; index: number; total: number }

/** Шапка кейса: назад, мета, заголовок, лид, сетка фактов и обложка */
export function CaseHero({ item, index, total }: Props) {
  const facts = [
    { label: 'клиент', value: item.client },
    { label: 'год', value: item.year },
    { label: 'направление', value: item.directions.map((d) => DIRECTION_LABELS[d]).join(', ') },
    { label: 'стек', value: item.stack.join(' · ') },
  ]
  const cover = item.shots[0]

  return (
    <header className={styles.hero}>
      <div className="container">
        <Link href="/#works" className={styles.back}>
          <Arrow dir="left" />
          все кейсы
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
              <dt>сайт</dt>
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
            <Shot shot={cover} className={styles.image} eager />
          ) : (
            <CasePreview index={index} year={item.year} stack={item.stack} size="cover" />
          )}
          {cover && <figcaption className={styles.caption}>{cover.caption}</figcaption>}
        </figure>
      </div>
    </header>
  )
}
