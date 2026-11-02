import type { CSSProperties } from 'react'
import type { Scheme as SchemeType, SchemeStep } from '@/content/cases'
import styles from './Scheme.module.css'

const pad = (n: number) => String(n).padStart(2, '0')
// Порядковый номер в CSS: от него считаются задержки анимации
const order = (i: number, extra?: Record<string, number>) => ({ '--i': i, ...extra }) as CSSProperties

/**
 * Схема «как работает» для AI-кейсов без экранов. Рисуется кодом и живёт
 * на CSS: по цепочке бежит запрос, шаги по очереди загораются, на табло
 * столы меняют статусы. Подписи — только из текста кейса. Без движения
 * (prefers-reduced-motion) схема стоит целиком подсвеченной
 */
export function Scheme({ scheme }: { scheme: SchemeType }) {
  return (
    <div className={styles.scheme} data-kind={scheme.kind}>
      <span className={styles.corner} data-pos="tl" aria-hidden="true" />
      <span className={styles.corner} data-pos="br" aria-hidden="true" />
      <div className={styles.head}>
        <span className={styles.live} aria-hidden="true" />
        {scheme.title}
      </div>
      {scheme.kind === 'pipeline' ? <Pipeline scheme={scheme} /> : <Board scheme={scheme} />}
    </div>
  )
}

function Node({ step, i, tag }: { step: SchemeStep; i: number; tag?: string }) {
  return (
    <li className={styles.node} style={order(i)}>
      <span className={styles.index}>{tag ?? pad(i + 1)}</span>
      <span className={styles.label}>{step.label}</span>
      {step.note && <span className={styles.note}>{step.note}</span>}
    </li>
  )
}

function Pipeline({ scheme }: { scheme: Extract<SchemeType, { kind: 'pipeline' }> }) {
  const n = scheme.steps.length
  const m = scheme.loop?.steps.length ?? 0
  // Один цикл: шаги цепочки, потом обратная дорожка, по 1,2 с на шаг и пауза
  const cycle = { '--n': n, '--cycle': `${(n + m + 1) * 1.2}s` } as CSSProperties
  return (
    <div className={styles.pipeline} style={cycle}>
      <ol className={styles.row} style={{ '--cols': n } as CSSProperties}>
        {scheme.steps.map((s, i) => (
          <Node key={s.label} step={s} i={i} />
        ))}
      </ol>
      {scheme.loop && (
        <div className={styles.loop}>
          <span className={styles.loopTitle}>
            <span aria-hidden="true">↺</span> {scheme.loop.title}
          </span>
          <ol className={styles.row} style={{ '--cols': m } as CSSProperties} data-loop>
            {scheme.loop.steps.map((s, i) => (
              <Node key={s.label} step={s} i={n + i} tag={`${pad(n + i + 1)}`} />
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function Board({ scheme }: { scheme: Extract<SchemeType, { kind: 'board' }> }) {
  let desk = 0
  return (
    <div className={styles.board}>
      <ol className={styles.lane}>
        <Node step={scheme.input} i={0} tag="in" />
        <Node step={scheme.hub} i={1} tag="hub" />
      </ol>
      <div className={styles.groups}>
        {scheme.groups.map((g) => (
          <div key={g.label} className={styles.group}>
            <span className={styles.groupLabel}>{g.label}</span>
            {g.items.map((item) => {
              const d = desk++
              return (
                <span key={item} className={styles.desk} style={order(d)}>
                  <span className={styles.deskName}>{item}</span>
                  <span className={styles.states} aria-hidden="true">
                    {scheme.results.map((r, j) => (
                      <span key={r} className={styles.state} style={{ '--j': j } as CSSProperties}>
                        {r}
                      </span>
                    ))}
                  </span>
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <ul className={styles.rules}>
        {scheme.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  )
}
