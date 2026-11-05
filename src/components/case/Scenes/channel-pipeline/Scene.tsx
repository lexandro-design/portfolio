'use client'

import type { CSSProperties } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Sys, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Seg = { k: 'same' | 'del' | 'add' | 'dash'; t: string; alt?: string }
type Data = {
  stations: { name: string; note: string }[]
  loop: { title: string; before: string; after: string; note: string; pair: { before: string; after: string; note: string } }
  steps: { head: string; cap: string; foot: string }[]
  topic: { label: string; rubrics: string[]; active: number; form: string; formName: string; seedLabel: string; seed: string; rule: string }
  angles: { title: string; items: string[]; pick: number; picked: string }
  draft: {
    rubric: string
    title: string
    lines: { seg: Seg[]; flags: { t: string; auto?: boolean }[] }[]
    length: string
    pics: { title: string; items: string[]; active: number; note: string }
  }
  phone: { title: string; sub: string; idle: string; pending: string; queued: string; toast: string; published: string; menu: string[]; keys: string[]; keysQueued: string[] }
  channel: { head: string; time: string; empty: string }
  axis: {
    title: string
    bands: { from: string; to: string; label: string; low?: boolean }[]
    ticks: string[]
    lowNote: string
    digest: { at: string; label: string }
    pin: { at: string; wait: string; queued: string; out: string }
  }
}

/** Тема, автор, код, редактор, черновик в пульте, нажатие, слот, обучение */
const SPANS = [2800, 3000, 3600, 3800, 3000, 3000, 4000, 3800]

/** Шаг сценария -> станция конвейера: 0 тема, 1 автор, 2 код, 3 редактор, 4 пульт, 5 канал */
const STATION = [0, 1, 2, 3, 4, 4, 5, 5]

const minutes = (hm: string) => {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}
/** Позиция времени на оси дня 09:00-21:00, в процентах */
const at = (hm: string) => ((minutes(hm) - 540) / 720) * 100

/** Кусок строки черновика в зависимости от шага: что написал автор, что отметил код, что переписал редактор */
function Piece({ s, step }: { s: Seg; step: number }) {
  if (s.k === 'same') return <>{s.t}</>
  if (s.k === 'add') return step >= 3 ? <ins className={styles.add} data-fresh={step === 3 || undefined}>{s.t}</ins> : null
  if (s.k === 'del') {
    if (step >= 4) return null
    return (
      <del className={styles.del} data-flag={step === 2 || undefined} data-gone={step === 3 || undefined}>
        {s.t}
      </del>
    )
  }
  // dash: автор поставил тире, код заменил на дефис, редактор переписал фразу
  if (step >= 4) return null
  // само тире: знак, который ловит код бота, он не текст сцены
  if (step === 1) return <>{s.t}{'—'}</>
  if (step === 2) return <span className={styles.fix}>{s.alt}</span>
  return <del className={styles.del} data-gone>{s.alt}</del>
}

/**
 * Конвейер Telegram-канала. Лента из шести станций идёт через всю ширину,
 * по ней едет карточка поста: тема, автор, проверка кодом, редактор, пульт,
 * канал. Под лентой лист, на котором черновик меняется построчно, телефон
 * с пультом-ботом и ось дня со слотами. Последний шаг: правки возвращаются
 * к автору по обратной линии
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play
  const st = STATION[step]
  const s = d.steps[step]

  const draftStep = step >= 1 && step <= 5
  const onChannel = step >= 6
  const queued = step >= 6
  const pinAt = at(d.axis.pin.at)

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        {/* Конвейер: станции и карточка поста, которая по ним едет */}
        <div className={styles.line} style={{ '--i': st, '--n': d.stations.length } as CSSProperties}>
          <ol className={styles.belt}>
            {d.stations.map((x, i) => (
              <li key={x.name} className={styles.station} data-state={i < st ? 'done' : i === st ? 'now' : 'next'}>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.sname}>
                  <i>{String(i + 1).padStart(2, '0')}</i>
                  {x.name}
                </span>
                <span className={styles.snote}>{x.note}</span>
              </li>
            ))}
          </ol>
          <span className={styles.rail} aria-hidden="true">
            <span className={styles.fill} />
          </span>
          <span className={styles.travel} aria-hidden="true">
            <span className={styles.card} data-run={play.playing || undefined}>
              <b />
              <b />
              <b />
            </span>
          </span>
        </div>

        {/* Обратная линия: правки возвращаются к автору */}
        <div className={styles.loop} data-on={step === 7 || undefined}>
          <div className={styles.loopBar}>
            <span className={styles.arrow} aria-hidden="true">
              ↺
            </span>
            <Mono>{d.loop.title}</Mono>
          </div>
          <div className={styles.pairWrap}>
            <dl className={styles.pair}>
              <div>
                <dt>{d.loop.before}</dt>
                <dd>
                  <del>{d.loop.pair.before}</del>
                </dd>
              </div>
              <div>
                <dt>{d.loop.after}</dt>
                <dd>
                  <ins>{d.loop.pair.after}</ins>
                </dd>
              </div>
              <div>
                <dt>{d.loop.note}</dt>
                <dd>{d.loop.pair.note}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className={styles.work}>
          {/* Лист: тема, черновик с правками или готовый пост в канале */}
          <section className={styles.paper} data-mode={onChannel ? 'channel' : 'draft'} aria-label={s.head}>
            <div className={styles.phead}>
              <Mono key={s.head}>{onChannel ? d.channel.head : s.head}</Mono>
              {draftStep && <Mono className={styles.tagr}>{d.draft.rubric}</Mono>}
            </div>

            {step === 0 && (
              <div className={styles.topic} key="topic">
                <div className={styles.row}>
                  <Mono>{d.topic.label}</Mono>
                  <ul className={styles.chips}>
                    {d.topic.rubrics.map((r, i) => (
                      <li key={r} data-on={i === d.topic.active || undefined}>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.row}>
                  <Mono>{d.topic.seedLabel}</Mono>
                  <p className={styles.seed}>{d.topic.seed}</p>
                </div>
                <div className={styles.row}>
                  <Mono>{d.topic.form}</Mono>
                  <p className={styles.form}>{d.topic.formName}</p>
                </div>
                <p className={styles.rule}>{d.topic.rule}</p>
              </div>
            )}

            {draftStep && (
              <div className={styles.doc} key="doc" data-step={step}>
                {step === 1 && (
                  <ul className={styles.angles}>
                    {d.angles.items.map((a, i) => (
                      <li key={a} data-pick={i === d.angles.pick || undefined} style={{ animationDelay: `${i * 160}ms` }}>
                        <span>{a}</span>
                        {i === d.angles.pick && <em>{d.angles.picked}</em>}
                      </li>
                    ))}
                  </ul>
                )}
                <h3 className={styles.dtitle}>{d.draft.title}</h3>
                {d.draft.lines.map((ln, li) => (
                  <p key={li} className={styles.dline} style={{ animationDelay: `${step === 1 ? 500 + li * 420 : 0}ms` }} data-typed={step === 1 || undefined}>
                    {ln.seg.map((sg, si) => (
                      <Piece key={si} s={sg} step={step} />
                    ))}
                    {step === 2 &&
                      ln.flags.map((f) => (
                        <span key={f.t} className={styles.flag} data-auto={f.auto || undefined}>
                          {f.t}
                        </span>
                      ))}
                  </p>
                ))}
                {s.foot && <p className={styles.foot}>{s.foot}</p>}
                {step >= 4 && (
                  <div className={styles.pics}>
                    <Mono>{d.draft.pics.title}</Mono>
                    <ul className={styles.chips}>
                      {d.draft.pics.items.map((x, i) => (
                        <li key={x} data-on={i === d.draft.pics.active || undefined}>
                          {x}
                        </li>
                      ))}
                    </ul>
                    <p className={styles.picsNote}>{d.draft.pics.note}</p>
                  </div>
                )}
                {step === 3 && <p className={styles.len}>{d.draft.length}</p>}
              </div>
            )}

            {onChannel && (
              <div className={styles.channel} key="channel">
                <div className={styles.waiting}>{d.channel.empty}</div>
                <article className={styles.post}>
                  <h3 className={styles.dtitle}>{d.draft.title}</h3>
                  {d.draft.lines.map((ln, li) => (
                    <p key={li} className={styles.dline}>
                      {ln.seg.map((sg, si) => (
                        <Piece key={si} s={sg} step={4} />
                      ))}
                    </p>
                  ))}
                  <span className={styles.ptime}>{d.channel.time}</span>
                </article>
              </div>
            )}
          </section>

          {/* Ось дня: окна рубрик, слот поста, сводка на завтра */}
          <section className={styles.axis} aria-label={d.axis.title}>
            <Mono>{d.axis.title}</Mono>
            <div className={styles.scale}>
              {d.axis.bands.map((b, bi) => (
                <span
                  key={b.label}
                  className={styles.band}
                  data-low={b.low || undefined}
                  data-hit={(bi === 1 && step >= 4) || undefined}
                  style={{ insetInlineStart: `${at(b.from)}%`, inlineSize: `${at(b.to) - at(b.from)}%` }}
                >
                  <i>{b.label}</i>
                </span>
              ))}
              {d.axis.ticks.map((tk) => (
                <span key={tk} className={styles.tick} style={{ insetInlineStart: `${at(`${tk}:00`)}%` }}>
                  <i>{tk}</i>
                </span>
              ))}
              <span className={styles.digest} style={{ insetInlineStart: `${at(d.axis.digest.at)}%` }}>
                <i>{d.axis.digest.at}</i>
              </span>
              {step >= 4 && (
                <span className={styles.pin} data-solid={queued || undefined} style={{ insetInlineStart: `${pinAt}%` }}>
                  <b />
                  <span className={styles.plabel}>
                    <strong>{d.axis.pin.at}</strong>
                    {queued ? (
                      <>
                        <em className={styles.q}>{d.axis.pin.queued}</em>
                        <em className={styles.o}>{d.axis.pin.out}</em>
                      </>
                    ) : (
                      <em>{d.axis.pin.wait}</em>
                    )}
                  </span>
                </span>
              )}
              {queued && <span className={styles.head} style={{ '--to': `${pinAt}%` } as CSSProperties} aria-hidden="true" />}
            </div>
            <p className={styles.legend}>
              <span>{d.axis.lowNote}</span>
              <span>
                {d.axis.digest.at} {d.axis.digest.label}
              </span>
            </p>
          </section>

          {/* Телефон: бот-пульт с кнопками */}
          <div className={styles.phone}>
            <Chat title={d.phone.title} sub={d.phone.sub} avatar="◆" live={play.playing} className={styles.chat}>
              {step < 4 && <Sys>{d.phone.idle}</Sys>}
              {step >= 4 && (
                <Msg side="in" className={styles.draftMsg}>
                  <span className={styles.status} key={queued ? 'q' : 'p'}>
                    {queued ? (
                      <>
                        <span className={step === 6 ? styles.stQ : styles.stGone}>{d.phone.queued}</span>
                        <span className={step === 6 ? styles.stOut : styles.stShow}>{d.phone.published}</span>
                      </>
                    ) : (
                      d.phone.pending
                    )}
                  </span>
                  <b className={styles.btitle}>{d.draft.title}</b>
                  {d.draft.lines.map((ln, li) => (
                    <span key={li} className={styles.bline}>
                      {ln.seg.map((sg, si) => (
                        <Piece key={si} s={sg} step={4} />
                      ))}
                    </span>
                  ))}
                  <span className={styles.pad}>
                    <span className={styles.keysWrap}>
                      {!queued ? (
                        <>
                          <span className={styles.krow}>
                            {d.phone.keys.slice(0, 2).map((k, i) => (
                              <span key={k} className={styles.key} data-press={(step === 5 && i === 0) || undefined}>
                                {k}
                              </span>
                            ))}
                          </span>
                          <span className={styles.krow}>
                            {d.phone.keys.slice(2).map((k) => (
                              <span key={k} className={styles.key}>
                                {k}
                              </span>
                            ))}
                          </span>
                          {step === 5 && <span className={styles.cursor} aria-hidden="true" />}
                        </>
                      ) : (
                        <span className={styles.krow} data-fold={step >= 6 || undefined}>
                          {d.phone.keysQueued.map((k) => (
                            <span key={k} className={styles.key}>
                              {k}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </span>
                </Msg>
              )}
              {step === 5 && <Sys>{d.phone.toast}</Sys>}
            </Chat>
            <div className={styles.menu} aria-hidden="true">
              {d.phone.menu.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.under}>
          <Cap className={styles.cap}>{s.cap}</Cap>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <Note>{t.show.cast.demo}</Note>
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
