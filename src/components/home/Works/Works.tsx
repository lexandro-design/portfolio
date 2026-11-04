'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Case, Direction } from '@/content/cases'
import type { Flow } from '@/content/flows'
import type { Dict } from '@/i18n/dict'
import type { Brief } from '@/content/showcase'
import { FILTER_EVENT } from './FilterLink'
import { Lookbook } from './Lookbook'
import { PICK } from './pick'
import { WorkList } from './WorkList'
import styles from './Works.module.css'

type Tab = 'all' | Direction
type Where = 'any' | Case['group']
type Props = {
  items: Case[]
  /** Схема «как работает» по slug — у автоматизаций вместо картинки */
  flows: Record<string, Flow | null>
  /** Цифры результата для подборки, по slug */
  nums: Record<string, Brief['nums']>
  t: Dict['works']
  /** Префикс языка для ссылок на кейсы: '' или '/en' */
  base: string
}

const GROUPS: Case['group'][] = ['titan', 'entersales', 'freelance', 'own']
/** Сколько строк списка видно сразу */
const FIRST = 10

/**
 * Кейсы на главной: подборка лукбуком, под ней все кейсы строками с
 * фильтрами по направлению и по тому, где сделано. Список с превью под
 * курсором занимает пару экранов вместо двадцати.
 */
export function Works({ items, flows, nums, t, base }: Props) {
  const [tab, setTab] = useState<Tab>('all')
  const [where, setWhere] = useState<Where>('any')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onFilter = (e: Event) => {
      setTab((e as CustomEvent<Direction>).detail)
      setWhere('any')
      setOpen(false)
    }
    window.addEventListener(FILTER_EVENT, onFilter)
    return () => window.removeEventListener(FILTER_EVENT, onFilter)
  }, [])

  const numbered = items.map((c, i) => ({ c, index: i + 1 }))
  const picks = PICK.map((slug) => numbered.find(({ c }) => c.slug === slug)).filter((x) => x !== undefined)
  const byTab = (f: Tab) => numbered.filter(({ c }) => f === 'all' || c.directions.includes(f))
  const inTab = byTab(tab)
  const shown = inTab.filter(({ c }) => where === 'any' || c.group === where)
  const visible = open ? shown : shown.slice(0, FIRST)

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: 'all', label: t.all, n: items.length },
    ...(Object.keys(t.directions) as Direction[]).map((id) => ({
      id,
      label: t.directions[id],
      n: byTab(id).length,
    })),
  ]
  const wheres: { id: Where; label: string; n: number }[] = [
    { id: 'any', label: t.where.any, n: inTab.length },
    ...GROUPS.map((id) => ({
      id,
      label: t.where[id],
      n: inTab.filter(({ c }) => c.group === id).length,
    })).filter((w) => w.n > 0),
  ]
  const href = (c: Case) => `${base}/cases/${c.slug}/`

  return (
    <>
      <Lookbook items={picks} flows={flows} nums={nums} href={href} read={t.read} />

      <div id="all" className={styles.index}>
        <h3 className={styles.title}>{t.showAll}</h3>

        <div className={styles.filters}>
          <div className={styles.tabs} role="tablist">
            {tabs.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={tab === x.id}
                className={styles.tab}
                onClick={() => {
                  setTab(x.id)
                  setWhere('any')
                  setOpen(false)
                }}
              >
                {x.label}
                <sup className={styles.count}>{x.n}</sup>
              </button>
            ))}
          </div>

          {wheres.length > 2 && (
            <div className={styles.tabs} role="group" aria-label={t.where.label}>
              {wheres.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  aria-pressed={where === w.id}
                  className={styles.tab}
                  data-small=""
                  onClick={() => {
                    setWhere(w.id)
                    setOpen(false)
                  }}
                >
                  {w.label}
                  <sup className={styles.count}>{w.n}</sup>
                </button>
              ))}
            </div>
          )}
        </div>

        <div role="tabpanel" key={`${tab}-${where}`} className={styles.panel}>
          {shown.length === 0 ? (
            <p className={styles.empty}>{t.empty}</p>
          ) : (
            <WorkList items={visible} flows={flows} href={href} where={t.where} />
          )}
        </div>

        {!open && shown.length > FIRST && (
          <button type="button" className={styles.more} onClick={() => setOpen(true)}>
            {t.showAll}
            <sup className={styles.count}>{shown.length}</sup>
          </button>
        )}
      </div>

      {/* Без JS и для поисковиков: со главной доступен каждый кейс, не только подборка */}
      <noscript>
        <ul className={styles.noscript}>
          {items.map((c) => (
            <li key={c.slug}>
              <Link href={href(c)}>
                {c.title}, {c.tagline}
              </Link>
            </li>
          ))}
        </ul>
      </noscript>
    </>
  )
}
