'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import type { Case, Direction } from '@/content/cases'
import type { Flow } from '@/content/flows'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { FILTER_EVENT } from './FilterLink'
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
  /** Цифры кейса по slug: для крупной плитки подборки */
  facts: Record<string, { v: string; l: string }[]>
  t: Dict['works']
  /** Префикс языка для ссылок на кейсы: '' или '/en' */
  base: string
}

/** Подборка на первом экране блока: самые сложные работы и сданные проекты настоящих заказчиков. Концепты и личные инструменты сюда не ставим */
const PICK = ['parfumeria', 'prosoft', 'garden-td', 'otrx', 'meeting-rooms', 'mimimibot', 'prof-study', 'reckon']
const GROUPS: Case['group'][] = ['titan', 'entersales', 'freelance', 'own']

const pad = (n: number) => String(n).padStart(2, '0')
const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Кейсы на главной. По умолчанию — подборка из восьми проектов крупной
 * мозаикой, остальное открывается вкладками: все, по направлению, плюс
 * второй фильтр «где сделано» (ТИТАН-2, EnterSales, фриланс, свои) и вид
 * плиткой или списком. Список с превью под курсором — 37 кейсов за пару
 * экранов вместо двадцати. Номер кейса — его место в общем списке.
 */
export function Works({ items, flows, facts, t, base }: Props) {
  const [tab, setTab] = useState<Tab>('pick')
  const [where, setWhere] = useState<Where>('any')
  const [view, setView] = useState<View>('grid')

  useEffect(() => {
    const onFilter = (e: Event) => {
      const detail = (e as CustomEvent<Direction | { where: Case['group'] }>).detail
      setTab(typeof detail === 'string' ? detail : 'all')
      setWhere(typeof detail === 'string' ? 'any' : detail.where)
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
              <span className={styles.dot} />
              <span>{x.label}</span>
              <span className={styles.count}>{pad(x.n)}</span>
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
            <div className={styles.bento}>
              {shown.map(({ c, index }, i) => (
                <WorkCard
                  key={c.slug}
                  item={c}
                  index={index}
                  href={href(c)}
                  flow={flows[c.slug]}
                  note={t.illustration}
                  size={i === 0 ? 'hero' : i < 3 || i >= 6 ? 'wide' : 'base'}
                  facts={i === 0 ? facts[c.slug] : undefined}
                  style={order(i)}
                  className={styles.cell}
                />
              ))}
            </div>
            <div className={styles.more}>
              <button type="button" className={styles.moreAll} onClick={() => setTab('all')}>
                <span>
                  {t.showAll} <span className={styles.moreN}>{pad(items.length)}</span>
                </span>
                <Arrow />
              </button>
              {(Object.keys(t.directions) as Direction[]).map((d) => (
                <button key={d} type="button" className={styles.moreDir} onClick={() => setTab(d)}>
                  <span className={styles.moreN}>{pad(byTab(d).length)}</span>
                  {t.directions[d]}
                </button>
              ))}
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
                  note={t.illustration}
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
