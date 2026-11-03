import Link from 'next/link'
import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
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
  /** Главы раскрытия — оглавление справа от лида, ссылки на якоря блоков */
  chapters: { id: string; title: string }[]
}

/**
 * Шапка кейса: назад, мета, заголовок, лид и оглавление глав, факты строкой.
 * Большой обложки нет: первым кадром работает сама первая глава, так
 * страница не начинается с «одной большой картинки»
 */
export function CaseHero({ item, index, total, t, directions, backHref, chapters }: Props) {
  const facts = [
    { label: t.facts.client, value: item.client },
    { label: t.facts.year, value: item.year },
    { label: t.facts.direction, value: item.directions.map((d) => directions[d]).join(', ') },
    { label: t.facts.stack, value: item.stack.join(' · ') },
  ]

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

        <div className={styles.intro}>
          <div className={styles.lead}>
            <p>{item.lead}</p>
            {item.credit && (
              <a href={item.credit.href} target="_blank" rel="noreferrer" className={styles.credit}>
                <span className={styles.creditRole}>{t.credit}</span>
                <span>github.com/{item.credit.handle}</span>
                <Arrow size={14} dir="up-right" />
              </a>
            )}
          </div>

          {chapters.length > 0 && (
            <nav className={styles.toc} aria-label={t.toc}>
              <span className={styles.tocLabel}>{t.toc}</span>
              <ol>
                {chapters.map((c, i) => (
                  <li key={c.id} style={{ animationDelay: `${240 + i * 60}ms` }}>
                    <a href={`#${c.id}`}>
                      <span className={styles.tocN}>{pad(i + 1)}</span>
                      <span className={styles.tocTitle}>{c.title}</span>
                      <Arrow size={14} dir="down" />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

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
      </div>
    </header>
  )
}
