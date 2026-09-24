'use client'

import { useEffect, useState } from 'react'
import { cases, DIRECTION_LABELS, type Direction } from '@/content/cases'
import { CaseIndexRow } from './CaseIndexRow'
import { CaseRow } from './CaseRow'
import { FILTER_EVENT } from './FilterLink'
import styles from './Works.module.css'

type Filter = 'all' | Direction

const TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'всё' },
  ...(Object.keys(DIRECTION_LABELS) as Direction[]).map((id) => ({
    id,
    label: DIRECTION_LABELS[id],
  })),
]

const count = (f: Filter) =>
  f === 'all' ? cases.length : cases.filter((c) => c.directions.includes(f)).length
const pad = (n: number) => String(n).padStart(2, '0')
const plural = (n: number) => {
  const d = n % 10
  const dd = n % 100
  if (d === 1 && dd !== 11) return 'проект'
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return 'проекта'
  return 'проектов'
}

/**
 * Кейсы с вкладками по направлениям. Кейсы со скриншотами идут крупными
 * строками, остальные компактным индексом ниже: пустые превью подряд
 * выглядят пусто. Появились скрины у кейса — он сам поднимается наверх.
 * Номер кейса — его место в общем списке.
 */
export function Works() {
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const onFilter = (e: Event) => setFilter((e as CustomEvent<Direction>).detail)
    window.addEventListener(FILTER_EVENT, onFilter)
    return () => window.removeEventListener(FILTER_EVENT, onFilter)
  }, [])

  const shown = cases
    .map((c, i) => ({ c, index: i + 1 }))
    .filter(({ c }) => filter === 'all' || c.directions.includes(filter))
  const featured = shown.filter(({ c }) => c.shots.length > 0)
  const rest = shown.filter(({ c }) => c.shots.length === 0)

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="Направления">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={filter === t.id}
            className={styles.tab}
            onClick={() => setFilter(t.id)}
          >
            <span className={styles.dot} />
            <span>
              {pad(i + 1)} {t.label}
            </span>
            <span className={styles.count}>{pad(count(t.id))}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {featured.length > 0 && (
          <div className={styles.list}>
            {featured.map(({ c, index }) => (
              <CaseRow key={c.slug} item={c} index={index} total={cases.length} />
            ))}
          </div>
        )}
        {rest.length > 0 && (
          <>
            {featured.length > 0 && (
              <p className={styles.restLabel}>
                ещё {rest.length} {plural(rest.length)} · скриншоты под NDA или в работе
              </p>
            )}
            <ul className={styles.list}>
              {rest.map(({ c, index }) => (
                <CaseIndexRow key={c.slug} item={c} index={index} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
