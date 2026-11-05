'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Reveal, Title, Typing, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Doc = { id: string; title: string; bars: number; locked?: boolean }
type Frag = { n: number; doc: string; ref: string; head: string; text: string; id: string }
type Data = {
  chat: { title: string; sub: string }
  typing: string
  shelf: { title: string; role: string; locked: string; fresh: string }
  docs: Doc[]
  fresh: { title: string; bars: number }
  drawer: Record<string, string> & { terms: string[]; replyFlow: string[] }
  fragments: Frag[]
  weakFragments: { doc: string; head: string; id: string }[]
  stages: string[]
  steps: { cap: string; log: string }[]
  messages: {
    greet: string
    menu: string[]
    q1: string
    search: string
    answer: string[]
    pin: string[]
    q2: string
    miss: string
    notify: string
  }
}

/**
 * Шаги: вопрос и роль, поиск, фрагменты, ответ, пустой поиск с отказом, ответ методиста.
 * Было девять шагов на 29,6 с: вход, вопрос и роль, а также пустой поиск и отказ склеены
 */
const SPANS = [3200, 3000, 3200, 3400, 3600, 3400]

/** Внутри шага, мс: роль закрывает документы и «печатает» гаснет, затем ответ бота */
const MARKS = [1500, 1700]

/** Прежний номер шага для логики панели и полки: у разных состояний свой набор документов и панель */
const OLD = [1, 3, 4, 5, 6, 8]

/** Условное время сообщений: идёт вперёд по сценарию */
const CLOCK = ['09:12', '09:12', '09:13', '09:14', '09:16', '09:20']

/** Какая стадия ленты справа горит на каком старом шаге */
const STAGE = [0, 0, 1, 2, 3, 4, 5, 5, 6]

/** Какой по счёту отрезок документа подсвечивается, когда из него взят фрагмент (условно, как пункт) */
const LIT: Record<string, number> = { returns: 4, hard: 1, cashier: 4 }

/** Ширина полос поиска по месту в выдаче: чем выше место, тем длиннее */
const LANE = [92, 70, 52]

/**
 * Наставник по базе документов. Композиция вертикальная: сверху полка
 * документов лентой, под ней чат, а прямо под чатом выдвинута панель
 * «под капотом». Вопрос подсвечивает на полке нужные документы, из них
 * вылетают пронумерованные фрагменты, и из фрагментов складывается ответ
 * со ссылками. Второй проход: подходящего нет, полка молчит, бот честно
 * отказывает, а ответ методиста потом появляется на полке новым документом
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const nstep = play.step
  const m = d.messages
  const dr = d.drawer

  // Внутри шага: набор бота, ответ. Пауза и reduced-motion показывают итог
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step: nstep, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [nstep, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === nstep ? ph.n : 0
  const typing = n < 2
  const leaving = n === 1
  const reply = n >= 2

  // Прежний номер шага: по нему полка, панель и лента стадий
  const step = nstep === 0 ? (n >= 1 ? 2 : 1) : nstep === 4 ? (reply ? 7 : 6) : OLD[nstep]

  const hitIds = step >= 3 && step <= 5 ? d.fragments.map((f) => f.id) : []
  const weakIds = step === 6 ? d.weakFragments.map((f) => f.id) : []
  const asked = step >= 1
  const shelfDocs = step >= 8 ? [{ id: 'fresh', title: d.fresh.title, bars: d.fresh.bars }, ...d.docs] : d.docs

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage}>
          <section className={styles.shelf} aria-hidden="true">
            <div className={styles.shelfHead}>
              <Mono>{d.shelf.title}</Mono>
              <Mono className={styles.role}>{d.shelf.role}</Mono>
            </div>
            <ul className={styles.docs} data-scan={step === 3 || undefined}>
              {shelfDocs.map((doc, i) => {
                const locked = 'locked' in doc && doc.locked && step >= 2
                const hit = hitIds.includes(doc.id)
                const weak = weakIds.includes(doc.id)
                const fresh = doc.id === 'fresh'
                const lit = hit && step >= 4 ? LIT[doc.id] : -1
                return (
                  <li
                    key={doc.id}
                    className={styles.doc}
                    data-hit={hit || undefined}
                    data-weak={weak || undefined}
                    data-locked={locked || undefined}
                    data-fresh={fresh || undefined}
                    style={{ '--i': i } as CSSProperties}
                  >
                    <span className={styles.docTitle}>{doc.title}</span>
                    <span className={styles.bars}>
                      {Array.from({ length: doc.bars }, (_, b) => (
                        <i key={b} data-lit={b === lit || undefined} />
                      ))}
                    </span>
                    <span className={styles.tag}>{locked ? d.shelf.locked : fresh ? d.shelf.fresh : ''}</span>
                  </li>
                )
              })}
            </ul>
          </section>

          <div className={styles.main}>
            <Chat title={d.chat.title} sub={d.chat.sub} tone="tg" live={play.playing} className={styles.chat}>
              <Msg side="in" time={CLOCK[0]}>
                {m.greet}
                <span className={styles.keysWrap}>
                  <Keys items={m.menu} />
                </span>
              </Msg>
              {asked && (
                <Msg side="out" key="q1" time={CLOCK[1]} status={step >= 5 ? 'read' : 'sent'} delay={nstep === 0 ? 700 : undefined}>
                  {m.q1}
                </Msg>
              )}
              {(step === 3 || step === 4) && (
                <Msg side="in" key="scan" time={CLOCK[2]}>
                  <span className={styles.scan}>{m.search}</span>
                </Msg>
              )}
              {nstep === 3 && typing && <Typing key="ta" text={d.typing} leaving={leaving} />}
              {step >= 5 && (nstep > 3 || reply) && (
                <Msg side="in" key="a" time={CLOCK[3]}>
                  {m.answer.map((s, i) => (
                    <span key={i}>
                      {s}
                      <sup className={styles.cite} data-on={step === 5 || undefined}>
                        [{[2, 3, 1][i]}]
                      </sup>
                      {i < 2 ? '. ' : '.'}
                    </span>
                  ))}
                  <span className={styles.keysWrap}>
                    <Keys items={m.pin} />
                  </span>
                </Msg>
              )}
              {step >= 6 && (
                <Msg side="out" key="q2" time={CLOCK[4]} status={step >= 7 ? 'read' : 'sent'}>
                  {m.q2}
                </Msg>
              )}
              {nstep === 4 && typing && <Typing key="tm" text={d.typing} leaving={leaving} delay={400} />}
              {step >= 7 && (
                <Msg side="in" key="miss" time={CLOCK[4]}>
                  {m.miss}
                </Msg>
              )}
              {step >= 8 && (
                <Msg side="in" key="notify" tone="ok" time={CLOCK[5]} delay={600}>
                  {m.notify}
                </Msg>
              )}
            </Chat>

            <section className={styles.drawer} data-step={step} aria-label={dr.title}>
              <div className={styles.drawerHead}>
                <Mono>{dr.title}</Mono>
                <span className={styles.log} key={step}>
                  {d.steps[nstep].log}
                </span>
              </div>
              <div className={styles.drawerBody} key={step}>
                {step <= 1 && <p className={styles.idle}>{dr.idle}</p>}
                {step === 2 && <p className={styles.idle}>{dr.role}</p>}

                {step === 3 && (
                  <div className={styles.lanes}>
                    <div className={styles.lane}>
                      <Mono>{dr.meaning}</Mono>
                      {d.fragments.map((f, i) => (
                        <p key={f.n} className={styles.hitRow} style={{ '--w': `${LANE[i]}%`, '--d': `${i * 160}ms` } as CSSProperties}>
                          <span>
                            {f.doc} · {f.ref}
                          </span>
                          <i />
                        </p>
                      ))}
                    </div>
                    <div className={styles.lane}>
                      <Mono>{dr.words}</Mono>
                      <p className={styles.terms}>
                        {dr.terms.map((w) => (
                          <b key={w}>«{w}»</b>
                        ))}
                      </p>
                      {d.fragments.slice(0, 2).map((f, i) => (
                        <p key={f.n} className={styles.hitRow} style={{ '--w': `${LANE[i + 1]}%`, '--d': `${300 + i * 160}ms` } as CSSProperties}>
                          <span>
                            {f.doc} · {f.ref}
                          </span>
                          <i />
                        </p>
                      ))}
                    </div>
                    <p className={styles.merge}>{dr.merge}</p>
                  </div>
                )}

                {(step === 4 || step === 5) && (
                  <>
                    <ol className={styles.frags}>
                      {d.fragments.map((f, i) => (
                        <li key={f.n} className={styles.frag} data-cited={step === 5 || undefined} style={{ '--d': `${i * 160}ms` } as CSSProperties}>
                          <span className={styles.fragHead}>
                            <b>[{f.n}]</b>
                            <span>
                              {f.doc} · {f.ref}
                            </span>
                          </span>
                          <strong>{f.head}</strong>
                          <p>{f.text}</p>
                          {step === 5 && <em>{dr.cited}</em>}
                        </li>
                      ))}
                    </ol>
                    <Meter label={dr.meter} thr={dr.threshold} value={84} />
                  </>
                )}

                {step === 6 && (
                  <>
                    <ol className={styles.frags} data-weak>
                      {d.weakFragments.map((f, i) => (
                        <li key={f.id} className={styles.frag} data-weak style={{ '--d': `${i * 160}ms` } as CSSProperties}>
                          <span className={styles.fragHead}>
                            <span>{f.doc}</span>
                          </span>
                          <strong>{f.head}</strong>
                          <em>{dr.weak}</em>
                        </li>
                      ))}
                    </ol>
                    <Meter label={dr.meter} thr={dr.threshold} value={24} low />
                  </>
                )}

                {step === 7 && (
                  <div className={styles.gap}>
                    <strong>{dr.gap}</strong>
                    <p>{dr.gapText}</p>
                    <p className={styles.gapQ}>«{m.q2}»</p>
                  </div>
                )}

                {step === 8 && (
                  <div className={styles.reply}>
                    <strong>{dr.reply}</strong>
                    <span className={styles.skel} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <ol className={styles.flow}>
                      {dr.replyFlow.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className={styles.rail}>
            <Mono>{dr.flow}</Mono>
            <ol className={styles.stages}>
              {d.stages.map((s, i) => (
                <li key={s} data-on={STAGE[step] === i || undefined} data-done={i < STAGE[step] || undefined}>
                  {s}
                </li>
              ))}
            </ol>
          </aside>

          <Cap className={styles.cap}>{d.steps[nstep].cap}</Cap>
          <div className={styles.ctl}>
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

/** Шкала «лучшее совпадение» с отметкой порога: ниже отметки бот честно говорит, что ответа нет */
function Meter({ label, thr, value, low }: { label: string; thr: string; value: number; low?: boolean }) {
  return (
    <div className={styles.meter} data-low={low || undefined}>
      <span>{label}</span>
      <div className={styles.track}>
        <i style={{ '--v': `${value}%` } as CSSProperties} />
        <b aria-hidden="true" />
      </div>
      <span>{thr}</span>
    </div>
  )
}
