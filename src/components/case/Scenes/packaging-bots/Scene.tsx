'use client'

import type { CSSProperties, ReactNode } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Sys, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Msgs = { at: number; side: 'in' | 'out' | 'sys'; text: string; link?: string }
type Data = {
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

/** Шаги: вопрос, поиск, полка, карточка, анкета, лид, менеджер, саммари, ночная сверка */
const SPANS = [2800, 3200, 3400, 3800, 3400, 3800, 3400, 4600, 4200]

/** До какой фишки конвейера дошёл поиск на каждом шаге (-1: конвейер стоит) */
const LIT = [0, 2, 4, 4, -1, -1, -1, -1, -1]

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
  const intent = step <= 2 ? d.pipe.intents[0] : d.pipe.intents[1]
  const phrases = step === 3 ? d.pipe.phrases[1] : step === 1 || step === 2 ? d.pipe.phrases[0] : []
  const open = step >= 3
  const cards = step >= 2
  const msgs = d.messages.filter((m) => m.at <= step)
  const status = step >= 5

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage} data-late={step >= 7 || undefined}>
          <section className={styles.desk} aria-label={d.shelf.title}>
            <div className={styles.dhead}>
              <Mono>{d.pipe.title}</Mono>
              <p key={step} className={styles.log}>
                {d.steps[step].log}
              </p>
            </div>

            <ol className={styles.pipe} aria-hidden="true">
              {d.pipe.chips.map((c, i) => {
                const on = i <= lit
                return (
                  <li key={`${c.k}-${on ? step : 'off'}`} className={styles.chip} data-on={(on && step <= 3) || undefined} data-done={(on && step > 3) || undefined} style={css({ '--i': i })}>
                    <b>{c.k}</b>
                    <span>{i === 1 ? (on ? intent : '') : c.v}</span>
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
              <span className={styles.src} data-on={(step >= 1 && step <= 3) || undefined}>
                {d.shelf.src}
              </span>
            </div>

            <div className={styles.shelf} data-open={(cards && open) || undefined}>
              {!cards && <p className={styles.empty}>{d.shelf.empty}</p>}
              {cards &&
                d.shelf.cards.map((c, i) => {
                  const isOpen = open && i === 0
                  const dim = open && i > 0
                  return (
                    <article key={c.name} className={styles.card} data-open={isOpen || undefined} data-dim={dim || undefined} style={css({ '--i': i })}>
                      <div className={styles.thumb}>
                        <Mono>{d.shelf.thumb}</Mono>
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

          <Chat title={d.chat.title} sub={d.chat.sub} avatar="◐" live={play.playing} className={styles.chat}>
            {msgs.map((m, i) =>
              m.side === 'sys' ? (
                <Sys key={i}>{m.text}</Sys>
              ) : (
                <Msg key={i} side={m.side} className={m.side === 'in' ? styles.late : undefined}>
                  {m.text}
                  {m.link && <span className={styles.chatLink}>{m.link}</span>}
                </Msg>
              ),
            )}
          </Chat>
        </div>

        <div className={styles.rail}>
          <Panel title={d.anketa.title} sub={d.anketa.sub} live={step >= 3 && step <= 5}>
            <ul className={styles.rows}>
              {d.anketa.fields.map((f) => (
                <li key={f.k} data-on={step >= f.at || undefined} data-new={step === f.at || undefined}>
                  <span>{f.k}</span>
                  <b key={step >= f.at ? 'v' : 'x'}>{step >= f.at ? f.v : '···'}</b>
                </li>
              ))}
            </ul>
            <p className={styles.rule}>{d.anketa.rule}</p>
          </Panel>

          <Panel title={d.lead.title} sub={d.lead.sub} live={step >= 3 && step <= 6}>
            <ul className={styles.rows}>
              {d.lead.fields.map(([k, v, at]) => (
                <li key={k} data-on={step >= at || undefined} data-new={step === at || undefined}>
                  <span>{k}</span>
                  <b key={step >= at ? 'v' : 'x'}>{step >= at ? v : '···'}</b>
                </li>
              ))}
            </ul>
            <p className={styles.status} data-on={status || undefined}>
              <span>{d.lead.status}</span>
              <b key={String(status)}>{status ? d.lead.to : d.lead.from}</b>
            </p>
          </Panel>

          <Panel title={d.summary.title} sub={d.summary.sub} live={step === 7}>
            <div className={styles.timeline} aria-hidden="true">
              <div className={styles.track}>{step >= 7 && <i className={styles.fill} />}</div>
              <ol>
                {d.summary.scale.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <small>{d.summary.unit}</small>
            </div>
            {step >= 7 ? (
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

          <Panel title={d.sync.title} live={step === 8}>
            <div className={styles.sync}>
              <p className={styles.sk}>
                <b>{d.sync.docs.k}</b>
                <span>{d.sync.docs.when}</span>
              </p>
              <ul data-on={step === 8 || undefined}>
                {d.sync.docs.rows.map(([a, b, c], i) => (
                  <li key={`${a}-${step === 8}`} style={css({ '--i': i })}>
                    <span>{a}</span>
                    <span>{step === 8 ? b : '···'}</span>
                    <b>{step === 8 ? c : '···'}</b>
                  </li>
                ))}
              </ul>
              <p className={styles.sk}>
                <b>{d.sync.sheet.k}</b>
                <span>{d.sync.sheet.when}</span>
              </p>
              <ul data-on={step === 8 || undefined}>
                {d.sync.sheet.rows.map(([a, c], i) => (
                  <li key={`${a}-${step === 8}`} data-two style={css({ '--i': i + 3 })}>
                    <span>{a}</span>
                    <b>{step === 8 ? c : '···'}</b>
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

        <Reveal className={styles.intro}>
          <Lead item={item} />
          <Facts facts={facts} className={styles.facts} />
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
