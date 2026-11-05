'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Progress, Reveal, Title, Typing, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

/** Готовый кадр есть только у шаблона из сценария: остальные на стене просто шаблоны */
type Tile = { id: string; src: string; you?: string }
type Data = {
  chat: { title: string; sub: string; typing: string }
  note: string
  wall: { title: string; note: string }
  tiles: Tile[]
  cols: string[][]
  tag: { look: string; pick: string; gen: string; you: string }
  selfies: string[]
  start: { time: string; text: string[]; pager: string[]; keys: string[] }
  demo: { text: string[]; pager: string[]; keys: string[] }
  upload: { text: string[]; keys: string[] }
  gen: { text: string[]; pager: string[]; eta: string }
  done: { text: string[]; keys: string[] }
  menu: { text: string; keys: string[] }
  speed: { title: string; rows: { label: string; value: string; ms: number }[] }
  steps: { cap: string; log: string }[]
}

type State = 'idle' | 'look' | 'pick' | 'gen' | 'you'

/** Шаги: старт, листание, выбор, селфи, генерация, готовый кадр, меню. Последний держится */
const SPANS = [2800, 3000, 3000, 3200, 3000, 3200]

/** Метки внутри шага, мс: «печатает» гаснет, ответ, продолжение, нажатие кнопки */
const MARKS = [400, 600, 1300, 1800]

/** Условное время сообщений: идёт вперёд по сценарию */
const CLOCK = ['12:01', '12:02', '12:03', '12:03', '12:05', '12:06']

/** Какой плитке стены что происходит на каком шаге */
function stateOf(id: string, step: number): State {
  if (id === 'red') return step === 0 ? 'idle' : step === 1 ? 'look' : step === 2 ? 'pick' : step === 3 ? 'gen' : 'you'
  return 'idle'
}

/** Кадр 3:4 в чате. Пустой alt: подпись и смысл несёт текст рядом */
function Pic({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img className={className ?? styles.pic} src={asset(src)} alt="" width={600} height={800} style={style} decoding="async" />
  )
}

/** Тире подставляется здесь: в json его держать нельзя (tools/check-content.mjs) */
const DASH = '\u2014'

/** Настоящие кадры бота: обложка и логотип. Надписи уже на обложке, поверх ничего не кладём */
const COVER = '/cases/mimimibot/real/cover.webp'
const LOGO = '/cases/mimimibot/real/avatar.webp'
/** Тот же шаблон без белой рамки: квадрат в чате обрезает её, полосы по бокам смотрятся случайно */
const TEMPLATE = '/cases/mimimibot/real/tpl-red-crop.webp'

/** Логотип бота в шапке чата */
function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img className={styles.logo} src={asset(LOGO)} alt="" width={320} height={320} decoding="async" />
  )
}

/** Кнопки под сообщением бота, как у настоящего: отдельными рядами под пузырём */
function Pad({ rows }: { rows: { items: string[]; stack?: boolean; pressed?: number }[] }) {
  return (
    <li className={styles.real}>
      {rows.map((r, i) => (
        <Keys key={i} items={r.items} stack={r.stack} pressed={r.pressed} />
      ))}
    </li>
  )
}

/**
 * MiMiMi AI. Сцена: стена шаблонов, как доска, живёт вокруг и позади чата.
 * Человек листает карусель, выбирает кадр, шлёт три селфи, идёт генерация,
 * и готовый кадр с лицом встаёт на место шаблона. Стена откликается на
 * каждый шаг: подсвечивает кадр из чата, показывает ожидание и результат
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS, { hold: 1400 })
  const { step } = play
  const byId = Object.fromEntries(d.tiles.map((x) => [x.id, x])) as Record<string, Tile>

  // Внутри шага: набор бота, ответ, продолжение, нажатие кнопки. Пауза и reduced-motion показывают итог
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === step ? ph.n : 0
  // Первый экран и листание не ждут: сообщение бота уже на месте, обложка и кнопки видны с первой секунды
  const quiet = step === 0
  const typing = !quiet && n < 2
  const leaving = n === 1
  const reply = quiet || n >= 2
  const follow = n >= 3
  const press = n >= 4 ? 0 : undefined
  const said = (l: string[]) => l.map((x) => x.replace('{d}', DASH)).join('\n')

  const side = [d.cols[0], d.cols[1], d.cols[2], d.cols[3]]
  const filler = [
    [d.tiles[5].id, d.tiles[0].id],
    [d.tiles[7].id, d.tiles[3].id],
  ]
  const wall: { ids: string[]; hide?: boolean }[] = [
    { ids: side[0] },
    { ids: side[1] },
    { ids: filler[0], hide: true },
    { ids: filler[1], hide: true },
    { ids: side[2] },
    { ids: side[3] },
  ]

  const cur = d.steps[step]

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage}>
          <div className={styles.wall} aria-hidden="true">
            {wall.map((col, ci) => (
              <div key={ci} className={styles.col} data-hide={col.hide || undefined} data-i={ci}>
                {col.ids.map((id) => {
                  const tile = byId[id]
                  const s: State = col.hide ? 'idle' : stateOf(id, step)
                  return (
                    <div key={id} className={styles.tile} data-s={s}>
                      <Pic src={tile.src} className={styles.base} />
                      {tile.you && <Pic src={tile.you} className={styles.you} />}
                      {s === 'gen' && (
                        <span className={styles.gen}>
                          <i className={styles.sweep} />
                          <b>{d.gen.eta}</b>
                          <i key={step} className={styles.fill} style={{ animationDuration: `${SPANS[4]}ms` }} />
                        </span>
                      )}
                      {s !== 'idle' && <span className={styles.tag}>{d.tag[s]}</span>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className={styles.phone}>
            <Chat title={d.chat.title} sub={typing ? d.chat.typing : d.chat.sub} avatar={<Logo />} live={play.playing} className={styles.chat}>
              {step === 0 && (
                <>
                  <Msg side="in" time={d.start.time} tail={false} className={styles.first}>
                    <span className={styles.cover}>
                      <Pic src={COVER} className={styles.coverPic} />
                    </span>
                    <span className={styles.said}>{said(d.start.text)}</span>
                  </Msg>
                  <Pad rows={[{ items: d.start.pager }, { items: d.start.keys, stack: true }]} />
                </>
              )}
              {step === 1 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <>
                      <Msg side="in" time={CLOCK[1]} tail={false} className={styles.first}>
                        <Pic src={TEMPLATE} className={styles.pic} />
                        <span className={styles.said}>{said(d.demo.text)}</span>
                      </Msg>
                      <Pad rows={[{ items: d.demo.pager }, { items: d.demo.keys, stack: true, pressed: press }]} />
                    </>
                  )}
                </>
              )}
              {step === 2 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <>
                      <Msg side="in" time={CLOCK[2]} tail={false} className={styles.first}>
                        <span className={styles.said}>{said(d.upload.text)}</span>
                      </Msg>
                      <Pad rows={[{ items: d.upload.keys, stack: true, pressed: press }]} />
                    </>
                  )}
                  {follow && (
                    <Msg side="out" time={CLOCK[2]} status={press === 0 ? 'read' : 'sent'} className={styles.selfies}>
                      <span className={styles.shots}>
                        {d.selfies.map((x, i) => (
                          <Pic key={x} src={x} className={styles.selfie} style={{ animationDelay: `${i * 320}ms` }} />
                        ))}
                      </span>
                    </Msg>
                  )}
                </>
              )}
              {step === 3 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <>
                      <Msg side="in" time={CLOCK[3]} tail={false} className={styles.first}>
                        <span className={styles.said}>{said(d.gen.text)}</span>
                        <Progress run={SPANS[3] - MARKS[1]} label={d.gen.eta} className={styles.prog} />
                      </Msg>
                      <Pad rows={[{ items: d.gen.pager }]} />
                    </>
                  )}
                </>
              )}
              {step === 4 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <>
                      <Msg side="in" tone="ok" time={CLOCK[4]} tail={false} className={styles.first}>
                        <Pic src={byId.red.you ?? byId.red.src} className={styles.pic} />
                        <span className={styles.said}>{said(d.done.text)}</span>
                      </Msg>
                      <Pad rows={[{ items: d.done.keys, stack: true, pressed: press }]} />
                    </>
                  )}
                </>
              )}
              {step === 5 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <>
                      <Msg side="in" time={CLOCK[5]} tail={false} className={styles.first}>
                        <span className={styles.said}>{d.menu.text}</span>
                      </Msg>
                      <Pad rows={[{ items: d.menu.keys, stack: true, pressed: press }]} />
                    </>
                  )}
                </>
              )}
            </Chat>

            <div key={step} className={styles.dock} aria-hidden="true">
              <Mono>{step === 0 ? d.speed.title : cur.log}</Mono>
              {step === 0 && (
                <ul className={styles.speed}>
                  {d.speed.rows.map((r) => (
                    <li key={r.label}>
                      <span>{r.label}</span>
                      <i style={{ inlineSize: `${Math.max(3, (r.ms / 2000) * 100)}%` }} />
                      <b>{r.value}</b>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.under}>
            <Cap className={styles.cap}>{cur.cap}</Cap>
            <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
            <div className={styles.notes}>
              <Note>{t.show.cast.demo}</Note>
              <Note>{d.note}</Note>
            </div>
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
