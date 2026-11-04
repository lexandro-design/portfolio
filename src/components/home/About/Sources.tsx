'use client'

import type { CSSProperties } from 'react'
import type { Case } from '@/content/cases'
import type { Dict } from '@/i18n/dict'
import { FILTER_EVENT } from '../Works/FilterLink'
import styles from './About.module.css'

type Props = {
  t: Dict['about']['sources']
  labels: Dict['works']['where']
  counts: { group: Case['group']; n: number }[]
  facts: Dict['about']['facts']
}

/** Откуда кейсы на сайте: полоса в настоящих пропорциях, каждая часть открывает свои кейсы в разделе работ */
export function Sources({ t, labels, counts, facts }: Props) {
  const total = counts.reduce((s, c) => s + c.n, 0)
  return (
    <div className={styles.sources}>
      <div className={styles.sourcesHead}>
        <h3 className={styles.sourcesTitle}>
          {total} {t.title}
        </h3>
        <p className={styles.p}>{t.note}</p>
      </div>
      <ul className={styles.bar}>
        {counts.map(({ group, n }) => (
          <li key={group} style={{ '--n': n } as CSSProperties}>
            <a
              href="#works"
              onClick={() => window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: { where: group } }))}
            >
              <b>{n}</b>
              <span>{labels[group]}</span>
            </a>
          </li>
        ))}
      </ul>
      <ul className={styles.facts}>
        {facts.map((f) => (
          <li key={f.l}>
            <b>{f.v}</b>
            <span>{f.l}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
