'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import type { Case, Direction } from '@/content/cases'
import type { Flow } from '@/content/flows'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import type { Brief } from '@/content/showcase'
import { FILTER_EVENT } from './FilterLink'
import { PICK } from './pick'
import { PickStack } from './PickStack'
import { WorkCard } from './WorkCard'
import { WorkList } from './WorkList'
import styles from './Works.module.css'

type Tab = 'pick' | 'all' | Direction
type Where = 'any' | Case['group']
type View = 'grid' | 'list'
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

const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Кейсы на главной. По умолчанию — подборка из шести проектов, по одному
 * на экран, остальное открывается вкладками: все, по направлению, плюс
 * второй фильтр «где сделано» (ТИТАН-2, EnterSales, фриланс, свои) и вид
 * плиткой или списком. Список с превью под курсором — 37 кейсов за пару
 * экранов вместо двадцати. Номер кейса — его место в общем списке.
 */
export function Works({ items, flows, nums, t, base }: Props) {
  const [tab, setTab] = useState<Tab>('pick')
  const [where, setWhere] = useState<Where>('any')
  const [view, setView] = useState<View>('grid')

  useEffect(() => {
    const onFilter = (e: Event) => {
      setTab((e as CustomEvent<Direction>).detail)
      setWhere('any')
    }
    window.addEventListener(FILTER_EVENT, onFilter)
    return () => window.removeEventListener(FILTER_EVENT, onFilter)
  }, [])

  const numbered = items.map((c, i) => ({ c, index: i + 1 }))
  const byTab = (f: Tab) =>
    f === 'pick'
      ? PICK.map((slug) => numbered.find(({ c }) => c.slug === slug)).filter((x) => x !== undefined)
      : numbered.filter(({ c }) => f === 'all' || c.directions.includes(f))
  const inTab = byTab(tab)
  const shown = tab === 'pick' ? inTab : inTab.filter(({ c }) => where === 'any' || c.group === where)

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: 'pick', label: t.pick, n: byTab('pick').length },
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
  // Ключ пересоздаёт сетку при смене фильтра — карточки въезжают заново лесенкой
  const key = `${tab}-${where}-${view}`

  return (
    <>
      <div className={styles.bar}>
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
              }}
            >
              <span>{x.label}</span>
              <span className={styles.count}>{x.n}</span>
            </button>
          ))}
        </div>

        {tab !== 'pick' && (
          <div className={styles.view} role="group">
            {(['grid', 'list'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                className={styles.viewBtn}
                onClick={() => setView(v)}
              >
                <span className={styles.viewIcon} data-view={v} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                {t.view[v]}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab !== 'pick' && wheres.length > 2 && (
        <div className={styles.where}>
          <span className={styles.whereLabel}>{t.where.label}</span>
          {wheres.map((w) => (
            <button
              key={w.id}
              type="button"
              aria-pressed={where === w.id}
              className={styles.chip}
              onClick={() => setWhere(w.id)}
            >
              {w.label}
              <span className={styles.chipCount}>{w.n}</span>
            </button>
          ))}
        </div>
      )}

      <div role="tabpanel" key={key} className={styles.panel}>
        {tab === 'pick' && (
          <>
            <PickStack items={shown} flows={flows} nums={nums} href={href} read={t.read} />
            <div className={styles.more}>
              <button type="button" className={styles.moreAll} onClick={() => setTab('all')}>
                {t.showAll} <span className={styles.moreN}>{items.length}</span>
                <Arrow size={20} />
              </button>
              <div className={styles.moreDirs}>
                {(Object.keys(t.directions) as Direction[]).map((d) => (
                  <button key={d} type="button" className={styles.moreDir} onClick={() => setTab(d)}>
                    {t.directions[d]} <span className={styles.chipCount}>{byTab(d).length}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab !== 'pick' && shown.length === 0 && <p className={styles.empty}>{t.empty}</p>}

        {tab !== 'pick' && view === 'grid' && shown.length > 0 && (
          <div className={styles.grid}>
            {shown.map(({ c, index }, i) => (
              <WorkCard
                key={c.slug}
                item={c}
                index={index}
                href={href(c)}
                flow={flows[c.slug]}
                style={order(Math.min(i, 12))}
                className={styles.cell}
              />
            ))}
          </div>
        )}

        {tab !== 'pick' && view === 'list' && shown.length > 0 && (
          <WorkList items={shown} flows={flows} href={href} where={t.where} />
        )}
      </div>

      {/* Без JS и для поисковиков: со главной доступен каждый кейс, не только подборка */}
      <noscript>
        <ul className={styles.noscript}>
          {items.map((c) => (
            <li key={c.slug}>
              <Link href={href(c)}>
                {c.title} · {c.tagline}
              </Link>
            </li>
          ))}
        </ul>
      </noscript>
    </>
  )
}
