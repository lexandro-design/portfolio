import Link from 'next/link'
import type { Case } from '@/content/cases'
import type { Flow } from '@/content/flows'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { FlowCard } from '@/components/ui/FlowCard'
import styles from './CaseHero.module.css'

type Props = {
  item: Case
  t: Dict['case']
  directions: Dict['works']['directions']
  /** Куда ведёт «все кейсы» — главная на своём языке */
  backHref: string
  /** Главы раскрытия — оглавление справа от лида, ссылки на якоря блоков */
  chapters: { id: string; title: string }[]
  /** У автоматизаций справа живая схема «как работает», оглавление уходит под лид */
  flow?: Flow | null
}

/**
 * Шапка кейса: назад, мета, заголовок, лид и оглавление глав, факты строкой.
 * У автоматизаций справа вместо оглавления крутится схема «как работает».
 * Большой обложки нет: первым кадром работает сама первая глава, так
 * страница не начинается с «одной большой картинки»
 */
export function CaseHero({ item, t, directions, backHref, chapters, flow }: Props) {
  const facts = [
    { label: t.facts.client, value: item.client },
    { label: t.facts.year, value: item.year },
    { label: t.facts.direction, value: item.directions.map((d) => directions[d]).join(', ') },
    { label: t.facts.stack, value: item.stack.join(', ') },
  ]

  const toc = chapters.length > 0 && (
    <nav className={styles.toc} aria-label={t.toc}>
      <span className={styles.tocLabel}>{t.toc}</span>
      <ol>
        {chapters.map((c) => (
          <li key={c.id}>
            <a href={`#${c.id}`}>{c.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  )

  return (
    <header className={styles.hero}>
      <div className="container">
        <Link href={backHref} className={styles.back}>
          <Arrow dir="left" />
          {t.back}
        </Link>

        <h1 className={styles.title}>
          {item.title}
          <span className={styles.tagline}>{item.tagline}</span>
        </h1>

        <div className={styles.intro} data-flow={flow ? '' : undefined}>
          <div className={styles.lead}>
            <p>{item.lead}</p>
            {item.credit && (
              <a href={item.credit.href} target="_blank" rel="noreferrer" className={styles.credit}>
                <span className={styles.creditRole}>{t.credit}</span>
                <span>github.com/{item.credit.handle}</span>
                <Arrow size={14} dir="up-right" />
              </a>
            )}
            {flow && toc}
          </div>

          {flow ? (
            <div className={styles.flow}>
              <FlowCard flow={flow} size="big" />
            </div>
          ) : (
            toc
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
