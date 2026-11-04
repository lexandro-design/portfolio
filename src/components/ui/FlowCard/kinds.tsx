'use client'

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { asset } from '@/lib/asset'
import type { Flow } from '@/content/flows'
import { useScript } from '@/components/case/Showcase/hooks'
import styles from './kinds.module.css'

type Of<V extends Flow['variant']> = Extract<Flow, { variant: V }>

const BARS = 44
/** Рисунок волны: неровный, но одинаковый при каждой сборке */
const shape = (i: number) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6 + 1))

/** Голос: волна тянется к курсору, вопрос и ответ появляются репликами */
export function Voice({ flow, on }: { flow: Of<'voice'>; on: boolean }) {
  const step = useScript(4, 1300, on, 3)
  const wave = useRef<HTMLDivElement>(null)

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const box = wave.current
    if (!box) return
    const r = box.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * BARS
    box.querySelectorAll<HTMLElement>('i').forEach((bar, i) => {
      bar.style.setProperty('--near', String(Math.max(0, 1 - Math.abs(i - x) / 7)))
    })
  }
  const leave = () => wave.current?.querySelectorAll<HTMLElement>('i').forEach((bar) => bar.style.removeProperty('--near'))

  return (
    <div className={styles.voice} data-on={on || undefined} onPointerMove={move} onPointerLeave={leave}>
      {flow.metric && (
        <span className={styles.voiceMetric}>
          {flow.metric.v} <small>{flow.metric.l}</small>
        </span>
      )}
      <div ref={wave} className={styles.wave}>
        {Array.from({ length: BARS }, (_, i) => (
          <i key={i} style={{ '--h': shape(i), '--d': `${-(i % 11) * 110}ms` } as CSSProperties} />
        ))}
      </div>
      <p className={styles.said} data-on={step >= 1 || undefined}>
        {flow.me}
      </p>
      <p className={styles.reply} data-on={step >= 3 || undefined}>
        {flow.reply}
      </p>
    </div>
  )
}

/** Очередь: заказы идут лесенкой по этапам, наведение выделяет заказ и показывает, где он */
export function Queue({ flow, on }: { flow: Of<'queue'>; on: boolean }) {
  const n = flow.stages.length
  const rows = flow.items.slice(0, 4)
  const t = useScript(n + rows.length * 2, 620, on, 4)
  const [pick, setPick] = useState<number | null>(null)
  const at = (r: number) => Math.max(0, Math.min(n, t - r * 2))
  const focus = pick ?? rows.findIndex((_, r) => at(r) > 0 && at(r) < n)
  const stage = focus < 0 ? (t === 0 ? 0 : n - 1) : Math.max(0, at(focus) - 1)

  return (
    <div className={styles.queue} onPointerLeave={() => setPick(null)}>
      {flow.metric && (
        <div className={styles.metric}>
          <b>{flow.metric.v}</b>
          <span>{flow.metric.l}</span>
        </div>
      )}
      <ol className={styles.rows}>
        {rows.map((item, r) => (
          <li
            key={item}
            className={styles.row}
            data-focus={focus === r || undefined}
            onPointerEnter={() => setPick(r)}
          >
            <span className={styles.rowName}>{item}</span>
            <span className={styles.cells}>
              {flow.stages.map((s, c) => (
                <i key={s} data-on={c < at(r) || undefined} data-now={c === at(r) - 1 || undefined} />
              ))}
            </span>
          </li>
        ))}
      </ol>
      <span className={styles.stage}>{flow.stages[stage]}</span>
    </div>
  )
}

/** Табло: диспетчер раздаёт задачи столам, наведение на стол показывает его последнюю строку */
export function Board({ flow, on }: { flow: Of<'board'>; on: boolean }) {
  const feed = flow.feed
  const t = useScript(feed.length, 1500, on, 1)
  const [pick, setPick] = useState<number | null>(null)
  const auto = t % flow.desks.length
  const active = pick ?? auto
  const line = pick === null ? feed[t] : feed[pick % feed.length]

  return (
    <div className={styles.board} onPointerLeave={() => setPick(null)}>
      <span className={styles.hub}>{flow.hub}</span>
      <span className={styles.bus} style={{ '--at': ((active % 3) + 0.5) / 3 } as CSSProperties} />
      <ul className={styles.desks}>
        {flow.desks.map((d, i) => (
          <li
            key={d.name}
            className={styles.desk}
            data-on={active === i || undefined}
            onPointerEnter={() => setPick(i)}
          >
            <span className={styles.deskName}>{d.name}</span>
            <span className={styles.deskGroup}>{d.group}</span>
          </li>
        ))}
      </ul>
      {line && (
        <p key={line.text} className={styles.feed}>
          <span>{line.who}</span> {line.text}
        </p>
      )}
    </div>
  )
}

/** Журнал: запрос и шаги выводятся строками, как в терминале */
export function Trace({ flow, on }: { flow: Of<'trace'>; on: boolean }) {
  const n = flow.steps.length
  const t = useScript(n + 2, 760, on, 5)
  return (
    <div className={styles.trace}>
      <p className={styles.prompt}>
        <span>&gt;</span> {flow.prompt}
      </p>
      <ol>
        {flow.steps.map((s, i) => (
          <li key={s} data-on={t > i || undefined}>
            {s}
          </li>
        ))}
      </ol>
      <p className={styles.out} data-on={t > n || undefined}>
        {flow.out}
      </p>
    </div>
  )
}

/** Шторка: два состояния одного экрана, граница идёт за курсором, сама покачивается, пока его нет */
export function Compare({ flow }: { flow: Of<'compare'> }) {
  const [x, setX] = useState<number | null>(null)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setX(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)))
  }
  return (
    <div
      className={styles.compare}
      data-auto={x === null || undefined}
      style={x === null ? undefined : ({ '--x': `${x}%` } as CSSProperties)}
      onPointerMove={move}
      onPointerLeave={() => setX(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
      <img src={asset(flow.b.src)} alt="" loading="lazy" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
      <img className={styles.top} src={asset(flow.a.src)} alt="" loading="lazy" decoding="async" />
      <span className={styles.line} />
      <span className={styles.tag} data-side="a">
        {flow.a.label}
      </span>
      <span className={styles.tag} data-side="b">
        {flow.b.label}
      </span>
    </div>
  )
}
