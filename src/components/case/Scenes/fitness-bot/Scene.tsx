'use client'

import { Fragment, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Reveal, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Data = {
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

/** Шаги: утро, меню, фото, вопрос о блюде, масса, итог еды, тренировка, параметры, прогресс, напоминание, вечер */
const SPANS = [2600, 3400, 2400, 2800, 2800, 3400, 3000, 2800, 2800, 3200, 4200]

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
  const [ref, play] = usePlay(SPANS)
  const { step } = play
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

  const mealOn = step >= 5
  const trainOn = step >= 6
  const weightOn = step >= 7
  const lineOn = step >= 8
  const ghost = step >= 2 && step < 5

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
            <div ref={todayRef} className={styles.todayBg} style={{ gridColumn: TODAY + 2 }} data-done={step === 10 || undefined} aria-hidden="true" />

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
                    <span className={styles.chip} data-show={(past && i === 1) || (today && step >= 9) || undefined}>
                      🔔
                    </span>
                    <span className={styles.chip} data-show={past || (today && step >= 10) || undefined}>
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

          <Chat title={d.chat.title} sub={d.chat.sub} live={play.playing} className={styles.phone}>
            <Msg key="morning" side="in">
              {m.morning}
            </Msg>
            {step >= 1 && (
              <>
                <Msg key="hello" side="in">
                  {m.hello}
                  <Keys items={m.menu} stack />
                </Msg>
                <Msg key="open" side="out" className={styles.late1}>
                  {m.foodOpen}
                </Msg>
                <Msg key="hint" side="in" className={styles.late2}>
                  {m.foodHint}
                </Msg>
              </>
            )}
            {step >= 2 && (
              <Msg key="photo" side="out">
                <span className={styles.photo} data-scan={step === 2 || undefined}>
                  <b aria-hidden="true">📷</b>
                  {m.photo}
                  <i aria-hidden="true" />
                </span>
              </Msg>
            )}
            {step >= 3 && (
              <Msg key="ask" side="in">
                {m.ask}
                <Keys items={m.askKeys} pressed={step >= 4 ? 0 : undefined} />
              </Msg>
            )}
            {step >= 4 && (
              <Msg key="wask" side="in">
                {m.weightAsk}
                <Keys items={m.weightKeys} pressed={step >= 5 ? 1 : undefined} />
              </Msg>
            )}
            {step >= 5 && (
              <Msg key="meal" side="in">
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
            {step >= 6 && (
              <>
                <Msg key="train" side="out">
                  {m.train}
                </Msg>
                <Msg key="trainSaved" side="in">
                  {m.trainSaved}
                  <Keys items={[m.undoShort]} />
                </Msg>
              </>
            )}
            {step >= 7 && (
              <>
                <Msg key="params" side="out">
                  {m.params}
                </Msg>
                <Msg key="paramsSaved" side="in">
                  {m.paramsSaved}
                  <Keys items={[m.undoShort]} />
                </Msg>
              </>
            )}
            {step >= 8 && (
              <>
                <Msg key="pAsk" side="out">
                  {m.progressAsk}
                </Msg>
                <Msg key="p" side="in">
                  {m.progress}
                </Msg>
              </>
            )}
            {step >= 9 && (
              <>
                <Msg key="rem" side="out">
                  {m.remind}
                </Msg>
                <Msg key="remSaved" side="in">
                  {m.remindSaved}
                  <Keys items={[m.remindUndo]} />
                </Msg>
              </>
            )}
            {step >= 10 && (
              <Msg key="digest" side="in">
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
