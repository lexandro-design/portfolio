'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Reveal, Title, Typing, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Data = {
  typing: string
  chat: { title: string; sub: string }
  ribbon: {
    title: string
    today: string
    days: string[]
    lanes: { meal: string; train: string; weight: string; bot: string }
    aria: string
  }
  ledger: { title: string }
  steps: { cap: string; log: string }[]
  msgs: {
    morning: string
    hello: string
    menu: string[]
    foodOpen: string
    foodHint: string
    photo: string
    ask: string
    askKeys: string[]
    weightAsk: string
    weightKeys: string[]
    meal: { head: string; rows: string[]; saved: string; undo: string }
    train: string
    trainSaved: string
    undoShort: string
    params: string
    paramsSaved: string
    progressAsk: string
    progress: string
    remind: string
    remindSaved: string
    remindUndo: string
    digest: { head: string; kbju: string; ex: string; exLine: string; load: string; tip: string }
  }
}

/** Шаги: утро и меню, еда по фото, итог еды, тренировка и параметры, прогресс и напоминание, вечерний отчёт */
const SPANS = [3800, 4200, 3000, 4000, 4000, 3600]

/** Моменты внутри шага, мс от его начала: ответ бота, нажатие кнопки, сообщение человека */
const EV = {
  hello: 900,
  tapMenu: 2000,
  openOut: 2250,
  hint: 3200,
  photoRead: 700,
  ask: 1300,
  tapYes: 2100,
  weight: 2900,
  tapWeight: 3700,
  meal: 900,
  train: 1000,
  paramsOut: 1900,
  params: 2900,
  progress: 1000,
  remOut: 2000,
  remind: 3000,
  digest: 1000,
}
/** «Печатает» виден за 600 мс до ответа, последние 200 мс гаснет */
const TYPE = 600
const LEAVE = 200

/** Метки каждого шага: когда что-то меняется на экране */
const MARKS: number[][] = [
  [EV.hello - TYPE, EV.hello - LEAVE, EV.hello, EV.tapMenu, EV.openOut, EV.hint - TYPE, EV.hint - LEAVE, EV.hint],
  [EV.photoRead, EV.ask - TYPE, EV.ask - LEAVE, EV.ask, EV.tapYes, EV.weight - TYPE, EV.weight - LEAVE, EV.weight, EV.tapWeight],
  [EV.meal - TYPE, EV.meal - LEAVE, EV.meal],
  [EV.train - TYPE, EV.train - LEAVE, EV.train, EV.paramsOut, EV.params - TYPE, EV.params - LEAVE, EV.params],
  [EV.progress - TYPE, EV.progress - LEAVE, EV.progress, EV.remOut, EV.remind - TYPE, EV.remind - LEAVE, EV.remind],
  [EV.digest - TYPE, EV.digest - LEAVE, EV.digest],
].map((a) => [...new Set(a.filter((x) => x > 0))].sort((p, q) => p - q))

/** Условное время сообщений: идёт вперёд по сценарию, вечерний отчёт в конце дня */
const CLOCK = { morning: '08:00', start: '12:10', photo: '12:11', meal: '12:12', train: '12:40', params: '12:41', progress: '12:45', remind: '12:46', digest: '21:00' }

/** Сегодня четверг. Дни до него уже заполнены, после него пусто */
const TODAY = 3
/** Высота столбиков в процентах колонки: прошлые дни условные, только для вида */
const MEAL = [62, 74, 58]
const TRAIN = [70, 0, 64]
const MEAL_TODAY = 56
const TRAIN_TODAY = 60
const WEIGHT_FIRST = 72
const WEIGHT_TODAY = 48
/** Доли Б, Ж, У в столбике рациона */
const SPLIT = [46, 30, 24]
/** Длины полос в сообщениях: калории, Б, Ж, У */
const METER = [86, 64, 38, 72]

const v = (n: number) => ({ '--v': n }) as CSSProperties

/**
 * Фитнес-бот как дневник недели. Сверху лента дней: рацион, тренировка, вес
 * и то, что бот пишет сам. Записи из чата зажигают клетки сегодняшнего дня и
 * растят столбики. Чат маленьким окном сбоку, как телефон, рядом журнал
 * того, что бот делает на каждом шаге
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const m = d.msgs
  const [ref, play] = usePlay(SPANS, { hold: 1800 })
  const { step } = play

  // Время внутри шага: метки двигают t. Пауза и reduced-motion показывают итог шага
  const [ph, setPh] = useState({ step: -1, el: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS[step].map((ms) => window.setTimeout(() => setPh({ step, el: ms }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, play.inView, play.stopped])
  const el = play.stopped ? Infinity : ph.step === step ? ph.el : 0

  /** Ответ бота на шаге si в момент r: ещё нет, печатает, гаснет, показан */
  const bot = (si: number, r: number) => {
    if (step > si) return 'shown'
    if (step < si) return 'none'
    return el >= r ? 'shown' : el >= r - LEAVE ? 'leaving' : el >= r - TYPE ? 'typing' : 'none'
  }
  const did = (si: number, a: number) => step > si || (step === si && el >= a)
  /** Индикатор печати на месте ответа */
  const wait = (si: number, r: number) => {
    const p = bot(si, r)
    return p === 'typing' || p === 'leaving' ? <Typing key={'w' + si + '-' + r} text={d.typing} leaving={p === 'leaving'} /> : null
  }
  const typingNow = (
    [[0, EV.hello], [0, EV.hint], [1, EV.ask], [1, EV.weight], [2, EV.meal], [3, EV.train], [3, EV.params], [4, EV.progress], [4, EV.remind], [5, EV.digest]] as const
  ).some(([si, r]) => {
    const p = bot(si, r)
    return p === 'typing' || p === 'leaving'
  })
  const scroller = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)

  // На узком экране лента листается: ставим сегодняшний день в середину
  useEffect(() => {
    const box = scroller.current
    const col = todayRef.current
    if (!box || !col) return
    if (col.offsetLeft + col.offsetWidth <= box.clientWidth) return
    box.scrollLeft = col.offsetLeft + col.offsetWidth / 2 - box.clientWidth / 2
  }, [])

  const mealOn = bot(2, EV.meal) === 'shown'
  const trainOn = bot(3, EV.train) === 'shown'
  const weightOn = bot(3, EV.params) === 'shown'
  const lineOn = bot(4, EV.progress) === 'shown'
  const bellOn = bot(4, EV.remind) === 'shown'
  const nightOn = bot(5, EV.digest) === 'shown'
  const ghost = step === 1 || (step === 2 && !mealOn)

  const lab = d.ribbon.lanes
  const lanes = [
    { id: 'meal', label: lab.meal },
    { id: 'train', label: lab.train },
    { id: 'weight', label: lab.weight },
    { id: 'bot', label: lab.bot },
  ]

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        {/* Лента недели */}
        <div className={styles.scroll} ref={scroller} role="img" aria-label={d.ribbon.aria}>
          <div className={styles.ribbon}>
            <div ref={todayRef} className={styles.todayBg} style={{ gridColumn: TODAY + 2 }} data-done={nightOn || undefined} aria-hidden="true" />

            <div className={styles.corner} style={{ gridRow: 1, gridColumn: 1 }}>
              <Mono>{d.ribbon.title}</Mono>
            </div>
            {d.ribbon.days.map((day, i) => (
              <div key={day} className={styles.dayHead} style={{ gridRow: 1, gridColumn: i + 2 }} data-today={i === TODAY || undefined} data-future={i > TODAY || undefined}>
                <span>{day}</span>
                {i === TODAY && <small>{d.ribbon.today}</small>}
              </div>
            ))}

            {lanes.map((l, r) => (
              <div key={l.id} className={styles.lab} style={{ gridRow: r + 2, gridColumn: 1 }}>
                <Mono>{l.label}</Mono>
              </div>
            ))}

            {d.ribbon.days.map((day, i) => {
              const past = i < TODAY
              const today = i === TODAY
              const col = i + 2
              const state = today ? 'today' : past ? 'past' : 'future'
              const mealH = today ? (mealOn ? MEAL_TODAY : 0) : (MEAL[i] ?? 0)
              const trainH = today ? (trainOn ? TRAIN_TODAY : 0) : (TRAIN[i] ?? 0)
              return (
                <Fragment key={day}>
                  <div className={styles.cell} style={{ gridRow: 2, gridColumn: col }} data-state={state}>
                    <div className={styles.well}>
                      {today && ghost && <span className={styles.ghost} />}
                      <div className={styles.bar} style={v(mealH)}>
                        {SPLIT.map((s, k) => (
                          <i key={k} style={{ flexGrow: s }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cell} style={{ gridRow: 3, gridColumn: col }} data-state={state}>
                    <div className={styles.well}>
                      <div className={styles.bar} style={v(trainH)} data-solid>
                        <i style={{ flexGrow: 1 }} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.cell} style={{ gridRow: 4, gridColumn: col }} data-state={state}>
                    <div className={styles.well} data-flat>
                      {(i === 0 || (today && weightOn)) && (
                        <span className={styles.dot} style={v(i === 0 ? WEIGHT_FIRST : WEIGHT_TODAY)} data-today={today || undefined} />
                      )}
                    </div>
                  </div>
                  <div className={styles.cell} style={{ gridRow: 5, gridColumn: col }} data-state={state} data-bot>
                    <span className={styles.chip} data-show={past || today || undefined}>
                      ☀️
                    </span>
                    <span className={styles.chip} data-show={(past && i === 1) || (today && bellOn) || undefined}>
                      🔔
                    </span>
                    <span className={styles.chip} data-show={past || (today && nightOn) || undefined}>
                      🌙
                    </span>
                  </div>
                </Fragment>
              )
            })}

            {/* Линия веса от первой записи к сегодняшней, когда бот сравнил их */}
            <div className={styles.line} data-on={lineOn || undefined} aria-hidden="true">
              <svg viewBox="0 0 7 100" preserveAspectRatio="none">
                <line x1={0.5} y1={100 - WEIGHT_FIRST} x2={TODAY + 0.5} y2={100 - WEIGHT_TODAY} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.lower}>
          <div className={styles.left}>
            <Mono>{d.ledger.title}</Mono>
            <ol className={styles.ledger}>
              {d.steps.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => play.go(i)}
                    data-state={i < step ? 'past' : i === step ? 'now' : 'next'}
                    aria-current={i === step || undefined}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {s.log}
                  </button>
                </li>
              ))}
            </ol>
            <Cap className={styles.cap}>{d.steps[step].cap}</Cap>
            <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} />
            <Note>{t.show.cast.demo}</Note>
          </div>

          <Chat title={d.chat.title} sub={typingNow ? d.typing : d.chat.sub} live={play.playing} className={styles.phone}>
            <Msg key="morning" side="in" time={CLOCK.morning}>
              {m.morning}
            </Msg>
            {bot(0, EV.hello) === 'shown' && (
              <Msg key="hello" side="in" time={CLOCK.start}>
                {m.hello}
                <Keys items={m.menu} stack pressed={did(0, EV.tapMenu) ? 0 : undefined} />
              </Msg>
            )}
            {wait(0, EV.hello)}
            {(step > 0 || el >= EV.openOut) && (
              <Msg key="open" side="out" time={CLOCK.start} status={bot(0, EV.hint) === 'shown' ? 'read' : 'sent'}>
                {m.foodOpen}
              </Msg>
            )}
            {bot(0, EV.hint) === 'shown' && (
              <Msg key="hint" side="in" time={CLOCK.start}>
                {m.foodHint}
              </Msg>
            )}
            {wait(0, EV.hint)}
            {step >= 1 && (
              <Msg key="photo" side="out" time={CLOCK.photo} status={step > 1 || el >= EV.photoRead ? 'read' : 'sent'}>
                <span className={styles.photo} data-scan={(step === 1 && el < EV.ask) || undefined}>
                  <b aria-hidden="true">📷</b>
                  {m.photo}
                  <i aria-hidden="true" />
                </span>
              </Msg>
            )}
            {bot(1, EV.ask) === 'shown' && (
              <Msg key="ask" side="in" time={CLOCK.photo}>
                {m.ask}
                <Keys items={m.askKeys} pressed={did(1, EV.tapYes) ? 0 : undefined} />
              </Msg>
            )}
            {wait(1, EV.ask)}
            {bot(1, EV.weight) === 'shown' && (
              <Msg key="wask" side="in" time={CLOCK.photo}>
                {m.weightAsk}
                <Keys items={m.weightKeys} pressed={did(1, EV.tapWeight) ? 1 : undefined} />
              </Msg>
            )}
            {wait(1, EV.weight)}
            {mealOn && (
              <Msg key="meal" side="in" time={CLOCK.meal}>
                <b>{m.meal.head}</b>
                <span className={styles.meter} aria-hidden="true">
                  {m.meal.rows.map((r, k) => (
                    <span key={r}>
                      <em>{r}</em>
                      <i style={v(METER[k])} />
                    </span>
                  ))}
                </span>
                <small>{m.meal.saved}</small>
                <Keys items={[m.meal.undo]} />
              </Msg>
            )}
            {wait(2, EV.meal)}
            {step >= 3 && (
              <Msg key="train" side="out" time={CLOCK.train} status={trainOn ? 'read' : 'sent'}>
                {m.train}
              </Msg>
            )}
            {trainOn && (
              <Msg key="trainSaved" side="in" time={CLOCK.train}>
                {m.trainSaved}
                <Keys items={[m.undoShort]} />
              </Msg>
            )}
            {wait(3, EV.train)}
            {(step > 3 || (step === 3 && el >= EV.paramsOut)) && (
              <Msg key="params" side="out" time={CLOCK.params} status={weightOn ? 'read' : 'sent'}>
                {m.params}
              </Msg>
            )}
            {weightOn && (
              <Msg key="paramsSaved" side="in" time={CLOCK.params}>
                {m.paramsSaved}
                <Keys items={[m.undoShort]} />
              </Msg>
            )}
            {wait(3, EV.params)}
            {step >= 4 && (
              <Msg key="pAsk" side="out" time={CLOCK.progress} status={lineOn ? 'read' : 'sent'}>
                {m.progressAsk}
              </Msg>
            )}
            {lineOn && (
              <Msg key="p" side="in" time={CLOCK.progress}>
                {m.progress}
              </Msg>
            )}
            {wait(4, EV.progress)}
            {(step > 4 || (step === 4 && el >= EV.remOut)) && (
              <Msg key="rem" side="out" time={CLOCK.remind} status={bellOn ? 'read' : 'sent'}>
                {m.remind}
              </Msg>
            )}
            {bellOn && (
              <Msg key="remSaved" side="in" time={CLOCK.remind}>
                {m.remindSaved}
                <Keys items={[m.remindUndo]} />
              </Msg>
            )}
            {wait(4, EV.remind)}
            {nightOn && (
              <Msg key="digest" side="in" time={CLOCK.digest}>
                <b>{m.digest.head}</b>
                <span className={styles.digest}>
                  <em>{m.digest.kbju}</em>
                  <span className={styles.split} aria-hidden="true">
                    {SPLIT.map((s, k) => (
                      <i key={k} style={{ flexGrow: s }} />
                    ))}
                  </span>
                  <em>{m.digest.ex}</em>
                  {m.digest.exLine}
                  <em>{m.digest.load}</em>
                  <span className={styles.split} aria-hidden="true">
                    <i style={{ flexGrow: 1 }} />
                  </span>
                  <small>{m.digest.tip}</small>
                </span>
              </Msg>
            )}
            {wait(5, EV.digest)}
          </Chat>
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
