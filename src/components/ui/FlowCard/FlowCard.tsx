'use client'

import type { CSSProperties } from 'react'
import type { Flow } from '@/content/flows'
import { useInView, useScript } from '@/components/case/Showcase/hooks'
import { Board, Compare, Queue, Trace, Voice } from './kinds'
import styles from './FlowCard.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Живая схема автоматизации вместо фото: запрос приходит, бежит по шагам
 * (шаг загорается, получает галочку, точка едет к следующему) и выходит
 * ответом. Маршрут — запрос уходит по своей дорожке, следующий по другой.
 * У голоса, очереди, табло, журнала и шторки своя подача (см. kinds).
 * Крутится, только пока карточка на экране; без движения — всё сразу
 */
export function FlowCard({ flow, size = 'card' }: { flow: Flow; size?: 'card' | 'big' }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={styles.root} data-variant={flow.variant} data-size={size} aria-hidden="true">
      <span className={styles.grid} />
      {flow.variant === 'chain' && <Chain flow={flow} on={inView} />}
      {flow.variant === 'route' && <Route flow={flow} on={inView} />}
      {flow.variant === 'voice' && <Voice flow={flow} on={inView} />}
      {flow.variant === 'queue' && <Queue flow={flow} on={inView} />}
      {flow.variant === 'board' && <Board flow={flow} on={inView} />}
      {flow.variant === 'trace' && <Trace flow={flow} on={inView} />}
      {flow.variant === 'compare' && <Compare flow={flow} />}
    </div>
  )
}

function Chain({ flow, on }: { flow: Extract<Flow, { variant: 'chain' }>; on: boolean }) {
  const n = flow.steps.length
  // 0 — пусто, 1 — вход, 2…n+1 — шаги по очереди, n+2 — ответ
  const step = useScript(n + 3, 720, on, 5)
  const at = step - 2
  return (
    <div className={styles.chain}>
      {flow.input && (
        <span className={styles.bubble} data-side="in" data-on={step >= 1 || undefined}>
          {flow.input}
        </span>
      )}
      <ol className={styles.nodes} style={{ '--n': n } as CSSProperties}>
        {flow.steps.map((s, i) => (
          <li
            key={s + i}
            className={styles.node}
            data-state={i < at ? 'done' : i === at ? 'active' : undefined}
          >
            <span className={styles.idx}>{pad(i + 1)}</span>
            <span className={styles.label}>{s}</span>
            <span className={styles.tick}>ok</span>
          </li>
        ))}
      </ol>
      {flow.output && (
        <span className={styles.bubble} data-side="out" data-on={step >= n + 2 || undefined}>
          {flow.output}
        </span>
      )}
    </div>
  )
}

function Route({ flow, on }: { flow: Extract<Flow, { variant: 'route' }>; on: boolean }) {
  // На каждый запрос три такта: пришёл, разобран, ушёл в свою дорожку
  const total = flow.items.length * 3
  const step = useScript(total, 900, on, 0)
  const item = flow.items[Math.floor(step / 3) % flow.items.length]
  const phase = step % 3
  return (
    <div className={styles.route}>
      <span key={item.text} className={styles.bubble} data-side="in" data-on>
        {item.text}
      </span>
      <span className={styles.router} data-on={phase >= 1 || undefined}>
        <i />
      </span>
      <ol className={styles.lanes} style={{ '--n': flow.lanes.length } as CSSProperties}>
        {flow.lanes.map((l, i) => (
          <li key={l.label} className={styles.lane} data-state={phase === 2 && i === item.lane ? 'active' : undefined}>
            <span className={styles.label}>{l.label}</span>
            <span className={styles.laneOut}>{l.out}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
