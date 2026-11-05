'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Reveal, Sys, Title, useReduced, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Msgs = Record<string, { text: string; keys?: string[] }>
type Data = {
  axis: { title: string; checks: string; sent: string; sleep: string; aria: string }
  days: string[]
  pairs: { name: string; kind: string }[]
  steps: { cap: string }[]
  events: Record<string, { label: string }>
  phone: { title: string; sub: string; quiet: string; after: string }
  messages: Msgs
  deadlines: { title: string; sub: string; empty: string; name: string; course: string; due: string; states: { mark: string; left: string }[] }
  memory: { title: string; sub: string; dup: string; rows: { id: string; key: string; value: string }[] }
  also: { title: string; items: string[] }
  commands: { title: string; items: string[] }
}

/** Сутки с 06:00 до 24:00 по 15 минут: 72 проверки (бот просыпается с 06:00 до 23:45) */
const SLOTS = 72
const clockOf = (slot: number) => {
  const m = 360 + slot * 15
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Пары дня на шкале: начало и длина в слотах (10:00–11:30 и 12:00–13:30) */
const PAIRS = [
  { at: 16, len: 6 },
  { at: 24, len: 6 },
]

/**
 * События бота: на каком шаге и в какой проверке приходит сообщение.
 * day: какой из четырёх дней сцены (обычный, задание, за 3 дня, за сутки)
 */
const EVENTS = [
  { id: 'webinar', day: 0, step: 0, slot: 13 }, // 09:15, окно «за 45 минут до начала»
  { id: 'evening', day: 0, step: 1, slot: 56 }, // 20:00, пары на завтра
  { id: 'task', day: 1, step: 2, slot: 34 }, // 14:30
  { id: 'd3', day: 2, step: 3, slot: 48 }, // 18:00
  { id: 'd1', day: 3, step: 4, slot: 48 },
]

/** Каждый шаг: какой день и по каким проверкам пробегает бегунок */
const PLAN = [
  { day: 0, from: 0, to: 15 },
  { day: 0, from: 15, to: 71 },
  { day: 1, from: 0, to: 71 },
  { day: 2, from: 0, to: 50 },
  { day: 3, from: 0, to: 50 },
]

/**
 * Пять шагов на 16 с вместо семи на 24,8 с: тишина и вебинар склеены,
 * задание и следующие проверки без повторов тоже
 */
const SPANS = [3000, 3400, 3800, 2800, 3000]

/** Бегунок по проверкам: на каждом шаге пробегает из from в to, без движения встаёт сразу в конец */
function useSweep(step: number, from: number, to: number, still: boolean) {
  const [prog, setProg] = useState({ step, n: 0 })
  useEffect(() => {
    if (still) return
    const id = window.setInterval(() => {
      setProg((p) => (p.step === step ? { step, n: p.n + 1 } : { step, n: 1 }))
    }, 34)
    const stop = window.setTimeout(() => window.clearInterval(id), (to - from + 2) * 34)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(stop)
    }
  }, [step, from, to, still])
  if (still) return to
  return Math.min(to, from + (prog.step === step ? prog.n : 0))
}

/**
 * Бот учёбы. Экранный язык: часы и лента дня. Сверху вся шкала суток, по
 * ней идёт бегунок проверок раз в 15 минут, и почти каждая проверка
 * без изменений. Сообщение в телефон уходит только когда на портале
 * что-то появилось, а отметка в репозитории не даёт ему повториться
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const still = useReduced()
  const { step } = play
  const plan = PLAN[step]
  const slot = useSweep(step, plan.from, plan.to, still)

  const fired = (e: (typeof EVENTS)[number]) => step > e.step || (step === e.step && slot >= e.slot)
  const today = EVENTS.filter((e) => e.day === plan.day)
  const shown = today.filter(fired)
  const lastEvent = today[today.length - 1]
  const trailing = shown.length === today.length && slot >= lastEvent.slot + 2
  const sentSlots = new Map(today.map((e) => [e.slot, e.id]))
  const sentCount = shown.length
  const checks = Math.min(SLOTS, slot + 1)

  // Дедлайн: появляется вместе с сообщением о задании и меняет цвет по сроку
  const taskOn = fired(EVENTS[2])
  const dl = d.deadlines
  const dlState = dl.states[step >= 4 ? 2 : step >= 3 ? 1 : 0]
  const dupN = step === 2 ? slot - EVENTS[2].slot : 0

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <section className={styles.axis} aria-label={d.axis.aria}>
          <div className={styles.axHead}>
            <div className={styles.clock} aria-hidden="true">
              <b>{clockOf(Math.min(slot, SLOTS - 1))}</b>
              <Mono key={plan.day}>{d.days[plan.day]}</Mono>
            </div>
            <dl className={styles.count} aria-hidden="true">
              <div>
                <dt>{d.axis.checks}</dt>
                <dd>{checks}</dd>
              </div>
              <div>
                <dt>{d.axis.sent}</dt>
                <dd data-hot={sentCount > 0 || undefined}>{sentCount}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.rail} aria-hidden="true">
            {PAIRS.map((p, i) => (
              <span
                key={p.at}
                className={styles.pair}
                data-past={slot >= p.at || undefined}
                style={{ '--a': p.at + 1, '--len': p.len } as CSSProperties}
              >
                {d.pairs[i].name} {d.pairs[i].kind}
              </span>
            ))}
            {Array.from({ length: SLOTS }, (_, i) => {
              const sent = sentSlots.has(i)
              const state = sent && i <= slot ? 'sent' : i === slot ? 'now' : i < slot ? 'past' : 'next'
              return <i key={i} className={styles.tick} data-state={state} data-slot={sent ? 'event' : undefined} style={{ '--a': i + 1 } as CSSProperties} />
            })}
            {Array.from({ length: 18 }, (_, h) => (
              <span key={h} className={styles.hour} data-major={h % 3 === 0} style={{ '--a': h * 4 + 1 } as CSSProperties}>
                {String(h + 6).padStart(2, '0')}
                <small>:00</small>
              </span>
            ))}
            {today.map((e) => (
              <span key={e.id} className={styles.flag} data-on={fired(e) || undefined} style={{ '--a': e.slot + 1 } as CSSProperties}>
                <b>{clockOf(e.slot)}</b> {d.events[e.id].label}
              </span>
            ))}
            <span className={styles.sleep}>{d.axis.sleep}</span>
          </div>
        </section>

        <div className={styles.stage}>
          <Chat title={d.phone.title} sub={d.phone.sub} tone="tg" live={play.playing} fit minHeight={300} className={styles.phone} avatar="🎓">
            {shown.length === 0 && <Sys key={`q${plan.day}`}>{d.phone.quiet}</Sys>}
            {shown.map((e) => {
              const m = d.messages[e.id]
              return (
                <Msg key={`${plan.day}-${e.id}`} side="in" time={clockOf(e.slot)}>
                  {m.text}
                  {m.keys && (
                    <span className={styles.keys}>
                      <Keys items={m.keys} stack />
                    </span>
                  )}
                </Msg>
              )
            })}
            {trailing && <Sys key={`a${plan.day}`}>{d.phone.after}</Sys>}
          </Chat>

          <div className={styles.side}>
            <div className={styles.card}>
              <Mono>{dl.title}</Mono>
              <small className={styles.sub}>{dl.sub}</small>
              {taskOn ? (
                <div key={dlState.mark} className={styles.dl}>
                  <span className={styles.mark} aria-hidden="true">
                    {dlState.mark}
                  </span>
                  <span className={styles.dlText}>
                    <b>{dl.name}</b>
                    {dl.course}
                    <em>
                      {dl.due} · {dlState.left}
                    </em>
                  </span>
                </div>
              ) : (
                <p className={styles.empty}>{dl.empty}</p>
              )}
            </div>

            <div className={styles.card}>
              <Mono>{d.memory.title}</Mono>
              <small className={styles.sub}>{d.memory.sub}</small>
              <ul className={styles.keysList}>
                {d.memory.rows.map((r) => {
                  const ev = EVENTS.find((e) => e.id === r.id)!
                  const on = fired(ev)
                  return (
                    <li key={r.id} data-on={on || undefined}>
                      <i aria-hidden="true">{on ? '✓' : ''}</i>
                      <code>{r.key}</code>
                      <span>
                        {r.value}
                        {r.id === 'task' && on && dupN > 0 && <em>{d.memory.dup.replace('{n}', String(dupN))}</em>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className={styles.more}>
              <div>
                <Mono>{d.also.title}</Mono>
                <ul className={styles.chips}>
                  {d.also.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Mono>{d.commands.title}</Mono>
                <ul className={styles.chips} data-code>
                  {d.commands.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.under}>
            <Cap className={styles.cap}>{d.steps[step].cap}</Cap>
            <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
            <Note>{t.show.cast.demo}</Note>
          </div>
        </div>

        <Reveal className={styles.intro}>
          <Lead item={item} />
          <Facts facts={facts} className={styles.facts} />
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
