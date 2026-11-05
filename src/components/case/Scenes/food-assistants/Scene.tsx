'use client'

import { Fragment } from 'react'
import { asset } from '@/lib/asset'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Sys, Title, Typing, usePlay } from '../kit'
import { beat, marksOf, schedule, useBeats } from '../packaging-bots/useBeats'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Line = { k: 'out' | 'in' | 'sys'; text: string; d?: number }
type Step = {
  cap: string
  log: string
  lead: string
  who: 'left' | 'right' | 'both'
  lane: number
  reset?: 'left' | 'right'
  left?: Line[]
  right?: Line[]
}
type Data = {
  typing: string
  photoNote: string
  left: { title: string; sub: string }
  right: { title: string; sub: string }
  idle: string
  newDialog: string
  head: { title: string; idle: string; all: string }
  lanes: { label: string; out: string; tags: string[]; card?: string }[]
  steps: Step[]
}

/** Шаги: телефон клиента, каталог, база знаний, готовый ответ, сотрудник, передача менеджеру, итог */
const SPANS = [3600, 3000, 3000, 3000, 3000, 4200, 3000]

const LOGO = '/cases/food-assistants/real/logo.webp'

const pad = (n: number) => String(n + 1).padStart(2, '0')

/** Условное время: у каждого диалога своя точка отсчёта, минуты идут вперёд по шагам и репликам */
const BASE: Record<string, [number, number]> = { left: [14, 2], right: [14, 40] }
const BASE_RESET: [number, number] = [15, 37]
const stamp = ([h, m]: [number, number], plus: number) => {
  const t = h * 60 + m + plus
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

type Row = Line & { key: string; cur: boolean; old: boolean; step: number; j: number; time: string }

/** Лента окна: с последнего сброса (новый диалог) до текущего шага */
function feed(steps: Step[], step: number, side: 'left' | 'right', fresh: string) {
  let from = 0
  for (let i = 0; i <= step; i++) if (steps[i].reset === side) from = i
  const base = side === 'left' && from > 0 ? BASE_RESET : BASE[side]
  const out: Row[] = []
  for (let i = 0; i <= step; i++) {
    if (i === from && from > 0) out.push({ k: 'sys', text: fresh, key: `new-${i}`, cur: false, old: false, step: i, j: -1, time: '' })
    ;(steps[i][side] ?? []).forEach((m, j) =>
      out.push({ ...m, key: `${i}-${j}`, cur: i === step, old: i < from, step: i, j, time: stamp(base, i - from + (j >= 2 ? 1 : 0)) }),
    )
  }
  return out
}

/**
 * Один мозг, два окна. По краям два чата: клиент пишет Андрею, сотрудник
 * пишет Софье. Между ними общий разбор запроса и четыре дорожки: каталог,
 * база знаний, готовый ответ, менеджер. Запрос уезжает из своего окна по
 * рельсе к дорожке, дорожка загорается, ответ возвращается в тот же чат
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play
  const cur = d.steps[step]
  const all = cur.who === 'both'

  // Название ИИ-инструмента в фактах не показываем
  const safeFacts = facts.map((f) => ({ ...f, value: f.value.replace(/\s*[,·/]\s*GigaChat/gi, '').replace(/GigaChat\s*[,·/]\s*/gi, '') }))

  const act = cur.who === 'right' ? 'right' : 'left'
  const curLines = (cur[act] ?? []) as Line[]
  const times = schedule(curLines.map((m) => m.k))
  const clock = useBeats(step, play.inView && !play.stopped, curLines.flatMap((m, i) => marksOf(times[i], m.k === 'in')))
  const beats = curLines.map((m, i) => beat(clock, times[i], m.k === 'in'))
  const typing = beats.some((b) => b.typing || b.leaving)

  const side = (s: 'left' | 'right') => {
    const dim = !all && cur.who !== s
    return (
      <div className={`${styles.col} ${styles[s]}`}>
      <Chat
        title={d[s].title}
        sub={typing && s === act ? d.typing : d[s].sub}
        tone="tg"
        live={play.playing && (all || cur.who === s)}
        className={styles.chat}
        style={{ opacity: dim ? 0.5 : 1 }}
      >
        {(() => {
          const rows = feed(d.steps, step, s, d.newDialog)
          return rows.map((m, idx) => {
            if (m.k === 'sys' && m.j < 0) return <Sys key={m.key}>{m.text}</Sys>
            const bt = m.cur && s === act ? beats[m.j] : undefined
            const visible = !m.cur || s !== act || Boolean(bt?.shown)
            const next = rows[idx + 1]
            const read = m.k === 'out' && next && (next.step > m.step || (next.k === 'in' && (!next.cur || Boolean(beats[next.j]?.shown))))
            return (
              <Fragment key={m.key}>
                {bt && (bt.typing || bt.leaving) && <Typing text={d.typing} leaving={bt.leaving} />}
                {visible &&
                  (m.k === 'sys' ? (
                    <Sys>{m.text}</Sys>
                  ) : (
                    <Msg side={m.k} time={m.time} status={m.k === 'out' ? (read ? 'read' : 'sent') : undefined} className={m.old ? styles.old : undefined}>
                      {m.text}
                    </Msg>
                  ))}
              </Fragment>
            )
          })
        })()}
      </Chat>
      </div>
    )
  }

  const rail = (i: number, s: 'l' | 'r') => {
    const hot = cur.lane === i && cur.who === (s === 'l' ? 'left' : 'right')
    return (
      <span key={`${s}${i}-${hot ? step : 'x'}`} className={`${styles.rail} ${s === 'l' ? styles.railL : styles.railR}`} data-hot={hot || undefined} data-all={all || undefined} aria-hidden="true">
        <i />
      </span>
    )
  }

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.table}>
        <div className={styles.stage} data-who={cur.who} data-final={all || undefined}>
          {side('left')}

          <div className={styles.head}>
            {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
            <img className={styles.logo} src={asset(LOGO)} alt="" width={500} height={200} decoding="async" />
            <Mono>{d.head.title}</Mono>
            <p key={step} className={styles.log}>
              {all ? d.head.all : cur.log || d.head.idle}
            </p>
            <span className={styles.lead} data-on={cur.lead ? true : undefined}>
              {cur.lead}
            </span>
          </div>

          {d.lanes.map((l, i) => {
            const hot = cur.lane === i
            return (
              <div key={l.label} className={styles.laneRow} style={{ ['--row' as string]: i + 2 }}>
                {rail(i, 'l')}
                <div className={styles.lane} data-hot={hot || undefined} data-all={all || undefined} data-last={i === d.lanes.length - 1 || undefined}>
                  <span className={styles.laneHead}>
                    <b>{pad(i)}</b>
                    {l.label}
                  </span>
                  <span className={styles.out}>{l.out}</span>
                  <span className={styles.tags}>
                    {l.tags.map((g) => (
                      <em key={g}>{g}</em>
                    ))}
                  </span>
                  {l.card && <span className={styles.card}>{l.card}</span>}
                  <i key={hot ? step : 'x'} className={styles.sweep} aria-hidden="true" />
                </div>
                {rail(i, 'r')}
              </div>
            )
          })}

          {side('right')}
        </div>

        <div className={styles.under}>
          <Cap className={styles.cap}>{cur.cap}</Cap>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <Note>{t.show.cast.demo}</Note>
        </div>
        </div>

        <Reveal className={styles.intro}>
          <Lead item={item} />
          <Facts facts={safeFacts} className={styles.facts} />
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
