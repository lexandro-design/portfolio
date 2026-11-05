'use client'

import { useEffect, useState } from 'react'
import { asset } from '@/lib/asset'
import type { SceneProps } from '../types'
import {
  Back,
  Brief,
  Cap,
  Chat,
  Controls,
  Facts,
  Lead,
  Meta,
  Mono,
  Msg,
  Note,
  Reveal,
  Title,
  Typing,
  usePlay,
} from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Data = {
  typing: string
  photoNote: string
  place: { label: string; name: string; note: string }
  chat: { title: string; sub: string }
  calendar: {
    title: string
    month: string
    days: number[]
    from: number
    to: number
    in: string
    out: string
    nights: string
    empty: string
  }
  ticket: {
    title: string
    open: string
    done: string
    empty: string
    fields: { id: string; label: string; value: string; at: number }[]
  }
  tray: { title: string; sub: string; idle: string; rows: string[] }
  docs: { title: string; bar: string; sources: string[]; hit: number; note: string }
  human: { title: string; words: string; rules: string[]; to: string }
  steps: { cap: string; log: string }[]
  messages: { side: 'in' | 'out'; text: string; at: number }[]
}

/** Метки внутри шага, мс: «печатает» гаснет, ответ бота появляется */
const MARKS = [600, 900]

/** Условное время сообщений, идёт вперёд по сценарию */
const CLOCK = ['18:42', '18:42', '18:43', '18:43', '18:44', '18:45', '18:46', '18:47', '18:47']

/** Фото с сайта базы: один кадр дома и один интерьер, подпись источника рядом */
const PHOTOS = [
  { src: '/cases/resort-bot/real/house-teremok.webp', w: 1360, h: 603 },
  { src: '/cases/resort-bot/real/interior-teremok.webp', w: 750, h: 1000 },
]

/** Шаги: знакомство, разбор фразы и люлька, контакты и заявка уходит, вопрос по базе, передача человеку */
const SPANS = [2600, 3600, 3400, 3000, 3400]

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
  const picked = step >= 1 && step <= 2
  const kept = step >= 3
  const nights = cal.to - cal.from
  const first = cal.days.indexOf(cal.from)
  const last = cal.days.indexOf(cal.to)

  const filled = d.ticket.fields.filter((f) => f.at <= step).length
  const complete = step >= 2
  const sent = step >= 2

  // Внутри шага: набор бота, потом его ответ. Пауза и reduced-motion показывают итог
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === step ? ph.n : 0
  const reply = n >= 2
  const leaving = n === 1

  const searching = step === 3
  const botNow = d.messages.some((m) => m.side === 'in' && m.at === step)
  const typing = searching || (botNow && !reply)
  const shown = d.messages
    .map((m, i) => ({ ...m, i }))
    .filter((m) => m.at < step || (m.at === step && (m.side === 'out' || reply)))
  const lastIn = Math.max(-1, ...shown.filter((m) => m.side === 'in').map((m) => m.i))

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.table}>
          <div className={styles.stage} data-step={step}>
            {/* Календарь: главный герой сцены, интервал подсвечивается по фразе гостя */}
            <section
              className={styles.cal}
              aria-hidden="true"
              data-picked={picked || undefined}
              data-kept={kept || undefined}
            >
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
                      data-edge={
                        ((picked || kept) && (n === cal.from || n === cal.to)) || undefined
                      }
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

            <Chat
              title={d.chat.title}
              sub={typing ? d.typing : d.chat.sub}
              live={play.playing}
              className={styles.chat}
            >
              {shown.map((m) => (
                <Msg
                  key={m.i}
                  side={m.side}
                  time={CLOCK[m.i]}
                  status={
                    m.side === 'out'
                      ? m.i < lastIn || (typing && m.at === step)
                        ? 'read'
                        : 'sent'
                      : undefined
                  }
                >
                  {m.text}
                </Msg>
              ))}
              {typing && <Typing text={d.typing} leaving={leaving} delay={300} />}
            </Chat>

            <div className={styles.side}>
              <div className={styles.deck}>
                {/* Заявка: поля заполняются по мере разговора, потом уходит в Bitrix24 */}
                <article
                  className={styles.ticket}
                  data-sent={sent || undefined}
                  data-gone={kept || undefined}
                  aria-hidden="true"
                >
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
                        <div
                          key={`${f.id}-${on}`}
                          className={styles.field}
                          data-on={on || undefined}
                          data-fresh={f.at === step || undefined}
                        >
                          <dt>{f.label}</dt>
                          <dd>{on ? f.value : d.ticket.empty}</dd>
                        </div>
                      )
                    })}
                  </dl>
                  <div className={styles.meter}>
                    <i style={{ inlineSize: `${(filled / d.ticket.fields.length) * 100}%` }} />
                  </div>

                  {/* Жильё из каталога базы: фото с сайта базы, не сообщение бота (бот в коде шлёт только текст) */}
                  <figure className={styles.place} data-on={step >= 1 || undefined}>
                    <div className={styles.shots}>
                      {PHOTOS.map(({ src, w, h }) => (
                        // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
                        <img
                          key={src}
                          src={asset(src)}
                          alt=""
                          width={w}
                          height={h}
                          decoding="async"
                         
                        />
                      ))}
                    </div>
                    <figcaption>
                      <Mono>{d.place.label}</Mono>
                      <b>{d.place.name}</b>
                      <span>{d.place.note}</span>
                      <small>{d.photoNote}</small>
                    </figcaption>
                  </figure>
                </article>

                {step === 2 && (
                  <div className={styles.flyer} aria-hidden="true">
                    <Mono>{d.ticket.title}</Mono>
                    <b>{d.ticket.fields[0].value}</b>
                    <span>
                      {d.ticket.fields[1].value} - {d.ticket.fields[2].value}
                    </span>
                  </div>
                )}

                <article
                  className={styles.docs}
                  data-on={step === 3 || undefined}
                  aria-hidden="true"
                >
                  <Mono>{d.docs.title}</Mono>
                  <p className={styles.query}>{d.docs.bar}</p>
                  <ul className={styles.sources}>
                    {d.docs.sources.map((s, i) => (
                      <li
                        key={s}
                        data-hit={i === d.docs.hit || undefined}
                        style={{ animationDelay: `${i * 160}ms` }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className={styles.docNote}>{d.docs.note}</p>
                </article>

                <article
                  className={styles.human}
                  data-on={step === 4 || undefined}
                  aria-hidden="true"
                >
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
                    <li
                      key={r}
                      style={{
                        transitionDelay: sent && step === 2 ? `${700 + i * 260}ms` : undefined,
                      }}
                    >
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
            <Controls
              play={play}
              t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }}
              className={styles.controls}
            />
            <Note className={styles.note}>{t.show.cast.demo}</Note>
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
