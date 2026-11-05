'use client'

import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Reveal, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Slot = 'busy' | 'free'
type Data = {
  example: string
  chat: { title: string; sub: string }
  board: {
    title: string
    service: string
    times: string[]
    days: { name: string; slots: Slot[] }[]
    legend: { busy: string; free: string; mine: string }
    reminder: string
  }
  messages: { side: 'in' | 'out'; text: string; keys?: string[] }[]
  steps: { cap: string; log: string }[]
}

/** Шаги: пишет, услуги, услуга, дни, день, время, окно закрыто, напоминание */
const SPANS = [2200, 2600, 2400, 3000, 2400, 3000, 3400, 4200]

/** Сколько сообщений уже в ленте на каждом шаге */
const SHOWN = [1, 2, 2, 3, 3, 4, 4, 5]
/** Сообщение с кнопками: с какого шага нажата кнопка и какая (услуга, день, время) */
const TAP: Record<number, [number, number]> = { 1: [2, 0], 2: [4, 1], 3: [6, 0] }

/** Выбранный день и окно: «завтра» (второй день) и 12:00 (вторая строка), как в сценарии кейса */
const DAY = 1
const ROW = 1

/**
 * Онлайн-запись как живая доска расписания. Главное здесь окна мастера:
 * дни колонками, время плитками. Бот в маленьком окне сбоку нажимает
 * кнопки, а доска отвечает: дни со свободным временем загораются, лишнее
 * гаснет, выбранное окно закрепляется за клиентом и получает напоминание
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play

  const msgs = d.messages.slice(0, SHOWN[step]).map((m, i) => ({ ...m, i }))
  const visible = msgs.slice(-3)

  const daysOpen = step >= 3
  const chosen = step >= 4
  const offered = step >= 5
  const booked = step >= 6
  const reminded = step >= 7

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage}>
          <section className={styles.board} aria-label={d.board.title}>
            <div className={styles.bar}>
              <Mono>{d.board.title}</Mono>
              <span className={styles.service} data-on={step >= 2 || undefined}>
                {d.board.service}
              </span>
              <ul className={styles.legend} aria-hidden="true">
                {(['busy', 'free', 'mine'] as const).map((k) => (
                  <li key={k} data-k={k}>
                    <i />
                    {d.board.legend[k]}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.grid}>
              <div className={styles.axis} aria-hidden="true">
                {d.board.times.map((tm) => (
                  <span key={tm}>{tm}</span>
                ))}
              </div>
              {d.board.days.map((day, di) => {
                const free = day.slots.some((s) => s === 'free')
                const state = chosen ? (di === DAY ? 'chosen' : 'off') : daysOpen && free ? 'lit' : undefined
                return (
                  <div key={day.name} className={styles.day} data-state={state}>
                    <div className={styles.dayHead}>{day.name}</div>
                    {day.slots.map((s, ri) => {
                      const mine = booked && di === DAY && ri === ROW
                      const k = mine ? 'mine' : s
                      const pulse = offered && !booked && di === DAY && s === 'free'
                      return (
                        <div key={ri} className={styles.slot} data-k={k} data-pulse={pulse || undefined} data-bell={(mine && reminded) || undefined}>
                          <span className={styles.time}>{d.board.times[ri]}</span>
                          <span className={styles.state}>{d.board.legend[k]}</span>
                          {mine && reminded && (
                            <span className={styles.bell} key="bell">
                              <span aria-hidden="true">🔔</span> {d.board.reminder}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <p key={step} className={styles.log}>
              {d.steps[step].log}
            </p>
          </section>

          <Chat title={d.chat.title} sub={d.chat.sub} live={play.playing} className={styles.chat}>
            {visible.map((m) => (
              <Msg key={m.i} side={m.side}>
                {m.text}
                {m.keys && (
                  <div className={styles.keys}>
                    <Keys items={m.keys} pressed={TAP[m.i] && step >= TAP[m.i][0] ? TAP[m.i][1] : undefined} />
                  </div>
                )}
              </Msg>
            ))}
          </Chat>
        </div>

        <div className={styles.under}>
          <Cap className={styles.cap}>{d.steps[step].cap}</Cap>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <Note>
            {t.show.cast.demo} {d.example}.
          </Note>
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
