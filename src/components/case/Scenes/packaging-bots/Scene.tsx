'use client'

import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { asset } from '@/lib/asset'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Progress, Reveal, Sys, Title, Typing, usePlay } from '../kit'
import { beat, marksOf, schedule, useBeats } from './useBeats'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'
import { ClientLogo } from '@/components/ui/ClientLogo'

type Msgs = { at: number; side: 'in' | 'out' | 'sys'; text: string; link?: string }
type Data = {
  typing: string
  photoNote: string
  chat: { title: string; sub: string }
  pipe: { title: string; chips: { k: string; v: string }[]; intents: string[]; phrases: string[][] }
  shelf: {
    title: string
    src: string
    tags: Record<string, string>
    empty: string
    thumb: string
    cards: { name: string; tags: string[]; chars: string[][] }[]
    spec: { title: string; fields: string[][]; photo: string }
  }
  messages: Msgs[]
  anketa: { title: string; sub: string; fields: { k: string; v: string; at: number }[]; rule: string }
  lead: { title: string; sub: string; fields: [string, string, number][]; status: string; from: string; to: string }
  summary: { title: string; sub: string; unit: string; scale: string[]; waiting: string; text: string; where: string[]; inside: string }
  sync: {
    title: string
    docs: { k: string; when: string; rows: string[][] }
    sheet: { k: string; when: string; rows: string[][] }
    idle: string
  }
  steps: { cap: string; log: string }[]
}

/**
 * Шаги: вопрос с поиском, полка, карточка, анкета с лидом, менеджер с саммари, ночная сверка.
 * В json реплики и поля размечены прежними девятью шагами, N переводит их в эти шесть
 */
const SPANS = [3000, 3200, 3800, 3800, 4200, 3400]
const N = [0, 0, 1, 2, 3, 3, 4, 4, 5]

/** До какой фишки конвейера дошёл поиск на каждом шаге (-1: конвейер стоит) */
const LIT = [2, 4, 4, -1, -1, -1]

/** Условное время реплик по порядку в json (монотонное), у строк системы времени нет */
const CLOCK = ['10:41', '10:42', '10:43', '10:43', '10:44', '10:44', '', '10:47', '10:47', '']

const PHOTO = '/cases/osq/real/product-box.webp'

const css = (v: Record<string, string | number>) => v as CSSProperties

function Panel({ title, sub, live, className, children }: { title: string; sub?: string; live?: boolean; className?: string; children: ReactNode }) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')} data-live={live || undefined}>
      <header className={styles.phead}>
        <Mono>{title}</Mono>
        {sub && <small>{sub}</small>}
      </header>
      {children}
    </section>
  )
}

/**
 * Бот по ассортименту упаковки. Главная идея: «полка». Вопрос клиента
 * превращается в ряд карточек каталога, одна из них раскрывается в
 * спецификацию. Справа узкий чат, снизу то, что бот делает с клиентом:
 * анкета, лид в CRM, саммари через 1,5 часа и ночная сверка базы
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play

  const lit = LIT[step]
  const intent = step <= 1 ? d.pipe.intents[0] : d.pipe.intents[1]
  const phrases = step === 2 ? d.pipe.phrases[1] : step <= 1 ? d.pipe.phrases[0] : []
  const open = step >= 2
  const cards = step >= 1
  const status = step >= 3
  const at = (v: number) => N[v]

  // Чат: реплики прошлых шагов целиком, у текущего своя очередь: «печатает», ответ
  const all = d.messages.map((m, k) => ({ ...m, k, s: N[m.at] }))
  const now = all.filter((m) => m.s === step)
  const times = schedule(now.map((m) => m.side))
  const marks = now.flatMap((m, i) => marksOf(times[i], m.side === 'in'))
  const clock = useBeats(step, play.inView && !play.stopped, marks)
  const beats = now.map((m, i) => beat(clock, times[i], m.side === 'in'))
  const shown = (k: number) => {
    const m = all[k]
    if (!m) return false
    if (m.s < step) return true
    const i = now.findIndex((x) => x.k === k)
    return i >= 0 && beats[i].shown
  }
  const typingNow = beats.some((b) => b.typing || b.leaving)

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.table}>
        <div className={styles.stage} data-late={step >= 4 || undefined}>
          <section className={styles.desk} aria-label={d.shelf.title}>
            <div className={styles.dhead}>
              <span className={styles.brand}>
                {item.logo && <ClientLogo logo={item.logo} className={styles.logo} />}
                <Mono>{d.pipe.title}</Mono>
              </span>
              <p key={step} className={styles.log}>
                {d.steps[step].log}
              </p>
            </div>

            <ol className={styles.pipe} aria-hidden="true">
              {d.pipe.chips.map((c, i) => {
                const on = i <= lit
                return (
                  <li key={`${c.k}-${on ? step : 'off'}`} className={styles.chip} data-on={(on && step <= 2) || undefined} data-done={(on && step > 2) || undefined} style={css({ '--i': i })}>
                    <b>{c.k}</b>
                    <span>{i === 1 ? (on ? intent : '') : c.v}</span>
                    {i === 0 && step === 0 && play.playing && <Progress run={SPANS[0] - 500} label={c.v} className={styles.chipBar} />}
                  </li>
                )
              })}
            </ol>

            <ul className={styles.phrases} aria-hidden="true">
              {phrases.map((p, i) => (
                <li key={`${step}-${p}`} style={css({ '--i': i })}>
                  {p}
                </li>
              ))}
            </ul>

            <div className={styles.shelfHead}>
              <Mono>{d.shelf.title}</Mono>
              <span className={styles.src} data-on={(step <= 2) || undefined}>
                {d.shelf.src}
              </span>
            </div>

            <div className={styles.shelf} data-open={(cards && open) || undefined}>
              {!cards && (
                <>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={styles.skel} style={css({ '--i': i })} aria-hidden="true">
                      <i />
                      <b />
                      <b />
                    </div>
                  ))}
                  <p className={styles.empty}>{d.shelf.empty}</p>
                </>
              )}
              {cards &&
                d.shelf.cards.map((c, i) => {
                  const isOpen = open && i === 0
                  const dim = open && i > 0
                  return (
                    <article key={c.name} className={styles.card} data-open={isOpen || undefined} data-dim={dim || undefined} style={css({ '--i': i })}>
                      <div className={styles.thumb} data-photo={isOpen || undefined}>
                        {isOpen && (
                          // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
                          <img className={styles.photo} src={asset(PHOTO)} alt="" width={400} height={400} decoding="async" />
                        )}
                        <Mono>{isOpen ? d.photoNote : d.shelf.thumb}</Mono>
                        {isOpen && <span className={styles.link}>{d.shelf.spec.photo}</span>}
                      </div>
                      <div className={styles.cbody}>
                        <h3 className={styles.name}>{c.name}</h3>
                        <p className={styles.tags}>
                          {c.tags.map((tag) => (
                            <span key={tag}>{d.shelf.tags[tag]}</span>
                          ))}
                        </p>
                        {!open && (
                          <dl className={styles.chars}>
                            {c.chars.map(([k, v]) => (
                              <div key={k}>
                                <dt>{k}</dt>
                                <dd>{v}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {isOpen && (
                          <div className={styles.spec}>
                            <Mono>{d.shelf.spec.title}</Mono>
                            <dl className={styles.fields}>
                              {d.shelf.spec.fields.map(([k, v], j) => (
                                <div key={k} style={css({ '--j': j })}>
                                  <dt>{k}</dt>
                                  <dd>{v}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })}
            </div>
          </section>

          <Chat title={d.chat.title} sub={typingNow ? d.typing : d.chat.sub} avatar="◐" live={play.playing} className={styles.chat}>
            {all
              .filter((m) => m.s <= step)
              .map((m) => {
                const i = now.findIndex((x) => x.k === m.k)
                const bt = i >= 0 ? beats[i] : undefined
                const visible = m.s < step || Boolean(bt?.shown)
                return (
                  <Fragment key={m.k}>
                    {bt && (bt.typing || bt.leaving) && <Typing text={d.typing} leaving={bt.leaving} />}
                    {visible &&
                      (m.side === 'sys' ? (
                        <Sys>{m.text}</Sys>
                      ) : (
                        <Msg side={m.side} time={CLOCK[m.k]} status={m.side === 'out' ? (all[m.k + 1]?.side === 'in' && shown(m.k + 1) ? 'read' : 'sent') : undefined}>
                          {m.text}
                          {m.link && (
                            <span className={styles.preview}>
                              {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
                              <img src={asset(PHOTO)} alt="" width={120} height={120} decoding="async" />
                              <small>{m.link}</small>
                            </span>
                          )}
                        </Msg>
                      ))}
                  </Fragment>
                )
              })}
          </Chat>
        </div>

        <div className={styles.rail}>
          <Panel title={d.anketa.title} sub={d.anketa.sub} live={step >= 2 && step <= 3}>
            <ul className={styles.rows}>
              {d.anketa.fields.map((f) => (
                <li key={f.k} data-on={step >= at(f.at) || undefined} data-new={step === at(f.at) || undefined}>
                  <span>{f.k}</span>
                  <b key={step >= at(f.at) ? 'v' : 'x'}>{step >= at(f.at) ? f.v : '···'}</b>
                </li>
              ))}
            </ul>
            <p className={styles.rule}>{d.anketa.rule}</p>
          </Panel>

          <Panel title={d.lead.title} sub={d.lead.sub} live={step >= 2 && step <= 4}>
            <ul className={styles.rows}>
              {d.lead.fields.map(([k, v, a]) => (
                <li key={k} data-on={step >= at(a) || undefined} data-new={step === at(a) || undefined}>
                  <span>{k}</span>
                  <b key={step >= at(a) ? 'v' : 'x'}>{step >= at(a) ? v : '···'}</b>
                </li>
              ))}
            </ul>
            <p className={styles.status} data-on={status || undefined}>
              <span>{d.lead.status}</span>
              <b key={String(status)}>{status ? d.lead.to : d.lead.from}</b>
            </p>
          </Panel>

          <Panel title={d.summary.title} sub={d.summary.sub} live={step === 4}>
            <div className={styles.timeline} aria-hidden="true">
              <div className={styles.track}>{step >= 4 && <i className={styles.fill} />}</div>
              <ol>
                {d.summary.scale.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <small>{d.summary.unit}</small>
            </div>
            {step >= 4 ? (
              <div className={styles.note}>
                <p className={styles.said}>{d.summary.text}</p>
                <ul className={styles.where}>
                  {d.summary.where.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={styles.wait}>{d.summary.waiting}</p>
            )}
          </Panel>

          <Panel title={d.sync.title} live={step === 5}>
            <div className={styles.sync}>
              <p className={styles.sk}>
                <b>{d.sync.docs.k}</b>
                <span>{d.sync.docs.when}</span>
              </p>
              <ul data-on={step === 5 || undefined}>
                {d.sync.docs.rows.map(([a, b, c], i) => (
                  <li key={`${a}-${step === 5}`} style={css({ '--i': i })}>
                    <span>{a}</span>
                    <span>{step === 5 ? b : '···'}</span>
                    <b>{step === 5 ? c : '···'}</b>
                  </li>
                ))}
              </ul>
              <p className={styles.sk}>
                <b>{d.sync.sheet.k}</b>
                <span>{d.sync.sheet.when}</span>
              </p>
              <ul data-on={step === 5 || undefined}>
                {d.sync.sheet.rows.map(([a, c], i) => (
                  <li key={`${a}-${step === 5}`} data-two style={css({ '--i': i + 3 })}>
                    <span>{a}</span>
                    <b>{step === 5 ? c : '···'}</b>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
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
