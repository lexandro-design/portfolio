'use client'

import type { SceneProps } from '../types'
import { useEffect, useState } from 'react'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Reveal, Title, Typing, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Slot = 'busy' | 'free'
type Data = {
  typing: string
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

/** Шаги: услуга, день, время, запись с напоминанием. Клиент пишет в первом, без пустого старта */
const SPANS = [3400, 3400, 3600, 3400]

/** Метки внутри шага, мс: печатает, гаснет, ответ бота, нажатие кнопки клиентом */
const MARKS = [500, 1100, 1300, 2300]

/** Условное время сообщений по их номеру в сценарии */
const CLOCK = ['14:20', '14:20', '14:21', '14:21', '14:22']

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
  const [ref, play] = usePlay(SPANS, { hold: 1800 })
  const { step } = play

  // Внутри шага: бот печатает, отвечает, клиент жмёт кнопку. Пауза и reduced-motion показывают итог
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === step ? ph.n : 0
  const typing = step === 0 ? n >= 1 && n <= 2 : n <= 2
  const leaving = n === 2
  const reply = n >= 3
  const press = n >= 4

  const msgs = d.messages.slice(0, step + 1 + (reply ? 1 : 0)).map((m, i) => ({ ...m, i }))
  const visible = msgs.slice(-3)

  // Кнопки сообщения i нажаты на шаге i - 1 после ответа бота (сообщение 1 на шаге 0)
  const tapped = (i: number) => (step > i - 1 ? 0 : step === i - 1 && press ? 0 : undefined)
  const pick: Record<number, number> = { 1: 0, 2: 1, 3: 0 }

  const serviceOn = step >= 1 || press
  const daysOpen = (step === 1 && reply) || step >= 2
  const chosen = (step === 1 && press) || step >= 2
  const offered = (step === 2 && reply) || step >= 3
  const booked = (step === 2 && press) || step >= 3
  const reminded = step === 3 && reply

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
              <span className={styles.service} data-on={serviceOn || undefined}>
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
              <Msg key={m.i} side={m.side} time={CLOCK[m.i]} status={m.side === 'out' ? (step > 0 || n >= 3 ? 'read' : 'sent') : undefined}>
                {m.text}
                {m.keys && (
                  <div className={styles.keys}>
                    <Keys items={m.keys} pressed={tapped(m.i) === undefined ? undefined : pick[m.i]} />
                  </div>
                )}
              </Msg>
            ))}
            {typing && <Typing text={d.typing} leaving={leaving} />}
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
