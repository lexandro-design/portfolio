'use client'

import { useEffect, useState } from 'react'
import type { Case, Direction } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { CaseIndexRow } from './CaseIndexRow'
import { CaseRow } from './CaseRow'
import { FILTER_EVENT } from './FilterLink'
import styles from './Works.module.css'

type Filter = 'all' | Direction
type Props = {
  items: Case[]
  t: Dict['works']
  /** Префикс языка для ссылок на кейсы: '' или '/en' */
  base: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Кейсы с вкладками по направлениям. Кейсы с картинками идут крупными
 * строками, остальные компактным индексом ниже: пустые превью подряд
 * выглядят пусто. Появились скрины у кейса — он сам поднимается наверх.
 * Номер кейса — его место в общем списке.
 */
export function Works({ items, t, base }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const onFilter = (e: Event) => setFilter((e as CustomEvent<Direction>).detail)
    window.addEventListener(FILTER_EVENT, onFilter)
    return () => window.removeEventListener(FILTER_EVENT, onFilter)
  }, [])

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: t.all },
    ...(Object.keys(t.directions) as Direction[]).map((id) => ({ id, label: t.directions[id] })),
  ]
  const count = (f: Filter) =>
    f === 'all' ? items.length : items.filter((c) => c.directions.includes(f)).length

  const shown = items
    .map((c, i) => ({ c, index: i + 1 }))
    .filter(({ c }) => filter === 'all' || c.directions.includes(filter))
  const hasMedia = (c: Case) => Boolean(c.thumb || c.shots.length)
  const featured = shown.filter(({ c }) => hasMedia(c))
  const rest = shown.filter(({ c }) => !hasMedia(c))

  return (
    <>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            className={styles.tab}
            onClick={() => setFilter(tab.id)}
          >
            <span className={styles.dot} />
            <span>
              {pad(i + 1)} {tab.label}
            </span>
            <span className={styles.count}>{pad(count(tab.id))}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {featured.length > 0 && (
          <div className={styles.list}>
            {featured.map(({ c, index }) => (
              <CaseRow
                key={c.slug}
                item={c}
                index={index}
                total={items.length}
                href={`${base}/cases/${c.slug}/`}
                read={t.read}
              />
            ))}
          </div>
        )}
        {rest.length > 0 && (
          <>
            {featured.length > 0 && <p className={styles.restLabel}>{t.rest}</p>}
            <ul className={styles.list}>
              {rest.map(({ c, index }) => (
                <CaseIndexRow
                  key={c.slug}
                  item={c}
                  index={index}
                  href={`${base}/cases/${c.slug}/`}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
