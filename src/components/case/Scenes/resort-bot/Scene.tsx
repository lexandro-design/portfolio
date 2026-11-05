'use client'

import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Title, Typing, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Data = {
  chat: { title: string; sub: string }
  calendar: { title: string; month: string; days: number[]; from: number; to: number; in: string; out: string; nights: string; empty: string }
  ticket: { title: string; open: string; done: string; empty: string; fields: { id: string; label: string; value: string; at: number }[] }
  tray: { title: string; sub: string; idle: string; rows: string[] }
  docs: { title: string; bar: string; sources: string[]; hit: number; note: string }
  human: { title: string; words: string; rules: string[]; to: string }
  steps: { cap: string; log: string }[]
  messages: { side: 'in' | 'out'; text: string; at: number }[]
}

/** Шаги: знакомство, разбор фразы, люлька и контакты, заявка уходит, вопрос по базе, передача человеку */
const SPANS = [3200, 3800, 3600, 4200, 3800, 3800]

/**
 * Бронь в чате. Сцена построена вокруг календаря заезда: гость пишет фразу,
 * и интервал дат подсвечивается, а рядом по полям собирается заявка. Когда
 * поля заполнены, заявка уходит в Bitrix24. Вторым проходом то, что бот
 * делает не с бронью: ищет ответ в документах или передаёт запрос человеку
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play

  const cal = d.calendar
  const picked = step >= 1 && step <= 3
  const kept = step >= 4
  const nights = cal.to - cal.from
  const first = cal.days.indexOf(cal.from)
  const last = cal.days.indexOf(cal.to)

  const filled = d.ticket.fields.filter((f) => f.at <= step).length
  const complete = step >= 3
  const sent = step >= 3

  const msgs = d.messages.filter((m) => m.at <= step)
  const searching = step === 4

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage} data-step={step}>
          {/* Календарь: главный герой сцены, интервал подсвечивается по фразе гостя */}
          <section className={styles.cal} aria-hidden="true" data-picked={picked || undefined} data-kept={kept || undefined}>
            <div className={styles.calHead}>
              <Mono>
                {cal.title} · {cal.month}
              </Mono>
              <span className={styles.calHint} key={picked || kept ? 'set' : 'none'}>
                {picked || kept ? `${cal.in} ${cal.from} · ${cal.out} ${cal.to}` : cal.empty}
              </span>
            </div>
            <ol className={styles.days} style={{ ['--n' as string]: cal.days.length }}>
              {cal.days.map((n) => {
                const mid = n > cal.from && n < cal.to
                return (
                  <li
                    key={n}
                    className={styles.day}
                    data-on={((picked || kept) && n >= cal.from && n <= cal.to) || undefined}
                    data-edge={((picked || kept) && (n === cal.from || n === cal.to)) || undefined}
                    data-mid={mid || undefined}
                    style={{ transitionDelay: picked ? `${(n - cal.from) * 140}ms` : undefined }}
                  >
                    {n}
                  </li>
                )
              })}
              <li
                className={styles.span}
                style={{ gridColumn: `${first + 1} / ${last + 2}` }}
                data-on={picked || kept || undefined}
              >
                {cal.nights} {nights}
              </li>
            </ol>
          </section>

          <Chat title={d.chat.title} sub={d.chat.sub} live={play.playing} className={styles.chat}>
            {msgs.map((m, i) => (
              <Msg key={`${m.at}-${i}`} side={m.side}>
                {m.text}
              </Msg>
            ))}
            {searching && <Typing />}
          </Chat>

          <div className={styles.side}>
            <div className={styles.deck}>
              {/* Заявка: поля заполняются по мере разговора, потом уходит в Bitrix24 */}
              <article className={styles.ticket} data-sent={sent || undefined} data-gone={kept || undefined} aria-hidden="true">
                <div className={styles.ticketHead}>
                  <Mono>{d.ticket.title}</Mono>
                  <span className={styles.status} data-done={complete || undefined}>
                    {complete ? d.ticket.done : d.ticket.open}
                  </span>
                </div>
                <dl className={styles.fields}>
                  {d.ticket.fields.map((f) => {
                    const on = f.at <= step
                    return (
                      <div key={`${f.id}-${on}`} className={styles.field} data-on={on || undefined} data-fresh={f.at === step || undefined}>
                        <dt>{f.label}</dt>
                        <dd>{on ? f.value : d.ticket.empty}</dd>
                      </div>
                    )
                  })}
                </dl>
                <div className={styles.meter}>
                  <i style={{ inlineSize: `${(filled / d.ticket.fields.length) * 100}%` }} />
                </div>
              </article>

              {step === 3 && (
                <div className={styles.flyer} aria-hidden="true">
                  <Mono>{d.ticket.title}</Mono>
                  <b>{d.ticket.fields[0].value}</b>
                  <span>
                    {d.ticket.fields[1].value} - {d.ticket.fields[2].value}
                  </span>
                </div>
              )}

              <article className={styles.docs} data-on={step === 4 || undefined} aria-hidden="true">
                <Mono>{d.docs.title}</Mono>
                <p className={styles.query}>{d.docs.bar}</p>
                <ul className={styles.sources}>
                  {d.docs.sources.map((s, i) => (
                    <li key={s} data-hit={i === d.docs.hit || undefined} style={{ animationDelay: `${i * 160}ms` }}>
                      {s}
                    </li>
                  ))}
                </ul>
                <p className={styles.docNote}>{d.docs.note}</p>
              </article>

              <article className={styles.human} data-on={step === 5 || undefined} aria-hidden="true">
                <Mono>{d.human.title}</Mono>
                <p className={styles.words}>{d.human.words}</p>
                <ul className={styles.rules}>
                  {d.human.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <p className={styles.to}>{d.human.to}</p>
              </article>
            </div>

            <div className={styles.tray} data-on={sent || undefined} aria-hidden="true">
              <div className={styles.trayHead}>
                <Mono>{d.tray.title}</Mono>
                <span>{sent ? d.tray.sub : d.tray.idle}</span>
              </div>
              <ol className={styles.trayRows}>
                {d.tray.rows.map((r, i) => (
                  <li key={r} style={{ transitionDelay: sent && step === 3 ? `${700 + i * 260}ms` : undefined }}>
                    {r}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className={styles.under}>
          <div className={styles.capBox}>
            <Mono className={styles.log}>{d.steps[step].log}</Mono>
            <Cap className={styles.cap}>{d.steps[step].cap}</Cap>
          </div>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <Note className={styles.note}>{t.show.cast.demo}</Note>
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
