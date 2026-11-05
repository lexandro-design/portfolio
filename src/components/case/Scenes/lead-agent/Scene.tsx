'use client'

import { useEffect, useState } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Progress, Reveal, Sys, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Post = { src: string; text: string; cut: string | null; score: number | null }
type Data = {
  feed: { title: string; tick: string; gate1: string; gate2: string; pass: string }
  posts: Post[]
  tags: { low: string; card: string; won: string }
  totals: string[]
  phone: { title: string; sub: string; empty: string; drafting: string }
  card: { head: string; title: string; summary: string; money: string; note: string; draft: string }
  keys: Record<'open' | 'draft' | 'wrote' | 'pass' | 'answered' | 'silent' | 'won' | 'expensive' | 'lost', string>
  status: { replied: string; answered: string; won: string; by: string }
  steps: string[]
  rules: string[]
}

/**
 * Шаги: поток, сито и оценка, карточка, черновик, «написал», «ответил и взял».
 * Прежде было восемь шагов на 28 с, сито и оценка склеены, две отметки воронки тоже
 */
const SPANS = [2600, 3000, 2800, 3600, 3000, 3600]

/** Условное время карточки в чате */
const STAMP = '12:40'

/** Внутри последнего шага: «ответил» нажата, дальше «взял»; пауза и reduced-motion сразу итог */
const LATE_MS = 1500
const THRESHOLD = 50

type Row = { items: string[]; pressed?: number; leave?: boolean; enter?: boolean }

/**
 * Поиск заказов. Сцена-воронка: сверху вниз идёт поток постов из каналов
 * и с биржи, проходит первое сито без модели и оценку с порогом, а то, что
 * прошло, падает карточкой в телефон справа (на узком экране под поток).
 * В телефоне кнопки двигают заказ по воронке, и статус виден всей команде
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play
  const k = d.keys

  const cutCount = d.posts.filter((p) => p.cut).length
  const lowCount = d.posts.filter((p) => !p.cut && (p.score ?? 0) < THRESHOLD).length
  const cardCount = d.posts.length - cutCount - lowCount
  const counts = [d.posts.length, step >= 1 ? cutCount : null, step >= 1 ? lowCount : null, step >= 2 ? cardCount : null]

  // Вторая половина последнего шага: «ответил» нажата, дальше «взял»
  const [lateAt, setLateAt] = useState(-1)
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const id = window.setTimeout(() => setLateAt(step), LATE_MS)
    return () => window.clearTimeout(id)
  }, [step, play.inView, play.stopped])
  const late = play.stopped || lateAt === step

  // Кнопки карточки по шагу: что нажато и что приходит на смену
  const rows: Row[] = [{ items: [k.open] }]
  if (step === 2) rows.push({ items: [k.draft] }, { items: [k.wrote, k.pass] })
  if (step === 3) rows.push({ items: [k.draft], pressed: 0, leave: true }, { items: [k.wrote, k.pass] })
  if (step === 4) rows.push({ items: [k.wrote, k.pass], pressed: 0, leave: true }, { items: [k.answered, k.silent], enter: true })
  if (step === 5 && !late) rows.push({ items: [k.answered, k.silent], pressed: 0, leave: true })
  if (step === 5 && late) rows.push({ items: [k.won, k.expensive, k.lost], pressed: 0 })
  const status = step === 4 ? d.status.replied : step === 5 ? (late ? d.status.won : d.status.answered) : null
  const drafting = step === 3 && !late
  const showDraft = step >= 4 || (step === 3 && late)

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage}>
          {/* Воронка: лента → сито без модели → оценка с порогом */}
          <section className={styles.funnel} aria-label={d.feed.title}>
            <div className={styles.head}>
              <Mono className={styles.tick}>
                <i className={styles.pulse} data-on={play.playing || undefined} aria-hidden="true" />
                {d.feed.tick}
              </Mono>
              <Mono className={styles.g1}>{d.feed.gate1}</Mono>
              <Mono className={styles.g2}>{d.feed.gate2}</Mono>
            </div>

            <ol className={styles.rows}>
              {d.posts.map((p, i) => {
                const cut = step >= 1 && p.cut !== null
                const scored = step >= 1 && !p.cut
                const low = scored && (p.score ?? 0) < THRESHOLD
                const pass = scored && !low
                const won = pass && step >= 5 && late
                return (
                  <li
                    key={p.src + p.text}
                    className={styles.row}
                    style={{ animationDelay: `${i * 160}ms` }}
                    data-cut={cut || undefined}
                    data-low={low || undefined}
                    data-pass={pass || undefined}
                  >
                    <div className={styles.post}>
                      <span className={styles.src}>{p.src}</span>
                      <span className={styles.text}>{p.text}</span>
                    </div>
                    <div className={styles.gate1}>
                      {cut ? <span className={styles.reason}>{p.cut}</span> : step >= 1 ? <span className={styles.ok}>✓ {d.feed.pass}</span> : <span className={styles.wait}>·</span>}
                    </div>
                    <div className={styles.gate2}>
                      {scored ? (
                        <>
                          <span className={styles.track} aria-hidden="true">
                            <i style={{ inlineSize: `${p.score}%`, transitionDelay: `${i * 90}ms` }} />
                          </span>
                          <b className={styles.num}>{p.score}</b>
                          {pass && <span className={styles.out}>{won ? d.tags.won : `→ ${d.tags.card}`}</span>}
                          {low && <span className={styles.out}>{d.tags.low}</span>}
                        </>
                      ) : (
                        <span className={styles.wait}>{cut ? '' : '·'}</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>

            <dl className={styles.totals}>
              {d.totals.map((label, i) => (
                <div key={label} data-on={counts[i] !== null || undefined}>
                  <dt>{label}</dt>
                  <dd>{counts[i] ?? '·'}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Телефон: сюда падает только то, что прошло оба сита */}
          <div className={styles.phone} aria-label={d.phone.title}>
            <Chat title={d.phone.title} sub={d.phone.sub} live={play.playing} className={styles.chat}>
              {step < 2 ? (
                <Sys key="empty">{d.phone.empty}</Sys>
              ) : (
                <Msg side="in" time={STAMP} className={styles.card}>
                  <span key={status ?? 'none'} className={styles.stack}>
                    {status && (
                      <b className={styles.status} data-late>
                        {status} · {d.status.by}
                      </b>
                    )}
                    <span>{d.card.head}</span>
                    <b>{d.card.title}</b>
                    <span>{d.card.summary}</span>
                    <span className={styles.money}>{d.card.money}</span>
                    <span className={styles.money}>{d.card.note}</span>
                    {showDraft && (
                      <pre key="draft" className={styles.draft} data-late={step === 3 || undefined}>
                        {d.card.draft}
                      </pre>
                    )}
                  </span>
                  {drafting && (
                    <span className={styles.drafting}>
                      {d.phone.drafting}
                      <Progress run={LATE_MS} label={d.phone.drafting} />
                    </span>
                  )}
                  <span className={styles.keys}>
                    {rows.map((r) => (
                      <span key={r.items.join('|')} className={styles.keyrow} data-leave={r.leave || undefined} data-enter={r.enter || undefined}>
                        <Keys items={r.items} pressed={r.pressed} />
                      </span>
                    ))}
                  </span>
                </Msg>
              )}
            </Chat>
          </div>
        </div>

        <div className={styles.under}>
          <Cap className={styles.cap}>{d.steps[step]}</Cap>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <Note>{t.show.cast.demo}</Note>
        </div>

        <Reveal className={styles.intro}>
          <Lead item={item} />
          <Facts facts={facts} className={styles.facts} />
          <ul className={styles.rules}>
            {d.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
