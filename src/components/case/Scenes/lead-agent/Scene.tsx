'use client'

import type { SceneProps } from '../types'
import { Back, Brief, Cap, Controls, Facts, Keys, Lead, Meta, Mono, Note, Reveal, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Post = { src: string; text: string; cut: string | null; score: number | null }
type Data = {
  feed: { title: string; tick: string; gate1: string; gate2: string; pass: string }
  posts: Post[]
  tags: { low: string; card: string; won: string }
  totals: string[]
  phone: { title: string; sub: string; empty: string }
  card: { head: string; title: string; summary: string; money: string; note: string; draft: string }
  keys: Record<'open' | 'draft' | 'wrote' | 'pass' | 'answered' | 'silent' | 'won' | 'expensive' | 'lost', string>
  status: { replied: string; answered: string; won: string; by: string }
  steps: string[]
  rules: string[]
}

/** Шаги: поток, первое сито, оценка, карточка, черновик, три отметки воронки */
const SPANS = [3000, 3200, 3600, 3400, 3600, 3400, 3200, 4200]
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
  const counts = [d.posts.length, step >= 1 ? cutCount : null, step >= 2 ? lowCount : null, step >= 3 ? cardCount : null]

  // Кнопки карточки по шагу: что нажато и что приходит на смену
  const rows: Row[] = [{ items: [k.open] }]
  if (step === 3) rows.push({ items: [k.draft] }, { items: [k.wrote, k.pass] })
  if (step === 4) rows.push({ items: [k.draft], pressed: 0, leave: true }, { items: [k.wrote, k.pass] })
  if (step === 5) rows.push({ items: [k.wrote, k.pass], pressed: 0, leave: true }, { items: [k.answered, k.silent], enter: true })
  if (step === 6) rows.push({ items: [k.answered, k.silent], pressed: 0, leave: true }, { items: [k.won, k.expensive, k.lost], enter: true })
  if (step === 7) rows.push({ items: [k.won, k.expensive, k.lost], pressed: 0, leave: true })
  const status = step === 5 ? d.status.replied : step === 6 ? d.status.answered : step === 7 ? d.status.won : null

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
                const scored = step >= 2 && !p.cut
                const low = scored && (p.score ?? 0) < THRESHOLD
                const pass = scored && !low
                const won = pass && step >= 7
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
            <div className={styles.top}>
              <span className={styles.ava} aria-hidden="true">
                {d.phone.title.slice(0, 1)}
              </span>
              <span className={styles.who}>
                {d.phone.title}
                <small>{d.phone.sub}</small>
              </span>
              <span className={styles.dot} data-on={play.playing || undefined} aria-hidden="true" />
            </div>
            <div className={styles.feed}>
              {step < 3 ? (
                <p className={styles.empty}>{d.phone.empty}</p>
              ) : (
                <div className={styles.card}>
                  <div className={styles.bubble}>
                    {status && (
                      <b key={status} className={styles.status} data-late>
                        {status} · {d.status.by}
                      </b>
                    )}
                    <span>{d.card.head}</span>
                    <b>{d.card.title}</b>
                    <span>{d.card.summary}</span>
                    <span className={styles.money}>{d.card.money}</span>
                    <span className={styles.money}>{d.card.note}</span>
                    {step >= 4 && (
                      <pre key={step >= 4 ? 'draft' : 'none'} className={styles.draft} data-late={step === 4 || undefined}>
                        {d.card.draft}
                      </pre>
                    )}
                  </div>
                  <div className={styles.keys}>
                    {rows.map((r) => (
                      <div key={r.items.join('|')} className={styles.keyrow} data-leave={r.leave || undefined} data-enter={r.enter || undefined}>
                        <Keys items={r.items} pressed={r.pressed} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
