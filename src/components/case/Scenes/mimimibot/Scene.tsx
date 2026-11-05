'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Progress, Reveal, Title, Typing, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Tile = { id: string; src: string; you: string }
type Data = {
  chat: { title: string; sub: string; typing: string }
  wall: { title: string; note: string }
  tiles: Tile[]
  cols: string[][]
  tag: { look: string; pick: string; gen: string; you: string }
  selfies: string[]
  start: { cmd: string; text: string; keys: string[] }
  demo: { text: string; keys: string[] }
  upload: { text: string; keys: string[]; count: string }
  gen: { text: string; eta: string }
  done: { text: string; keys: string[] }
  menu: { text: string; keys: string[] }
  speed: { title: string; rows: { label: string; value: string; ms: number }[] }
  steps: { cap: string; log: string }[]
}

type State = 'idle' | 'look' | 'pick' | 'gen' | 'you'

/** Шаги: старт, листание, выбор, селфи, генерация, готовый кадр, меню. Последний держится */
const SPANS = [3400, 3000, 3600, 3600, 4000, 4200, 4400]

/** Метки внутри шага, мс: «печатает» гаснет, ответ, продолжение, нажатие кнопки */
const MARKS = [700, 900, 1800, 2400]

/** Условное время сообщений: идёт вперёд по сценарию */
const CLOCK = ['12:04', '12:04', '12:05', '12:05', '12:06', '12:08', '12:09']

/** Какой плитке стены что происходит на каком шаге */
function stateOf(id: string, step: number): State {
  if (id === 'studio') return step === 0 ? 'look' : step === 6 ? 'you' : 'idle'
  if (id === 'nyc') return step === 1 ? 'look' : 'idle'
  if (id === 'terrace') return step < 2 ? 'idle' : step < 4 ? 'pick' : step === 4 ? 'gen' : 'you'
  if (id === 'car') return step === 6 ? 'you' : 'idle'
  return 'idle'
}

/** Кадр 3:4 в чате. Пустой alt: подпись и смысл несёт текст рядом */
function Pic({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img className={className ?? styles.pic} src={asset(src)} alt="" width={600} height={800} style={style} decoding="async" />
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
  const [ref, play] = usePlay(SPANS)
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
  const quiet = step === 1
  const typing = !quiet && n < 2
  const leaving = n === 1
  const reply = quiet || n >= 2
  const follow = n >= 3
  const press = n >= 4 ? 0 : undefined

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

  const carousel = step === 0 ? byId.studio : byId.nyc
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
                      <Pic src={tile.you} className={styles.you} />
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
            <Chat title={d.chat.title} sub={typing ? d.chat.typing : d.chat.sub} avatar="M" live={play.playing} fit minHeight={160} className={styles.chat}>
              {step <= 1 && (
                <>
                  <Msg side="out" time={CLOCK[0]} status={reply ? 'read' : 'sent'}>
                    {d.start.cmd}
                  </Msg>
                  {typing && <Typing leaving={leaving} delay={300} />}
                  {reply && (
                    <Msg side="in" time={CLOCK[1]} className={styles.wide}>
                      <Pic key={carousel.id} src={carousel.src} />
                      {d.start.text}
                      <Keys items={d.start.keys} pressed={step === 1 ? press : undefined} />
                    </Msg>
                  )}
                </>
              )}
              {step === 2 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <Msg side="in" time={CLOCK[2]} className={styles.wide}>
                      <Pic src={byId.terrace.src} />
                      {d.demo.text}
                      <Keys items={d.demo.keys} pressed={press} stack />
                    </Msg>
                  )}
                </>
              )}
              {step === 3 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <Msg side="in" time={CLOCK[2]} tail={false}>
                      {d.upload.text}
                      <Keys items={d.upload.keys} pressed={press} />
                    </Msg>
                  )}
                  {follow && (
                    <Msg side="out" time={CLOCK[3]} status={press === 0 ? 'read' : 'sent'} className={styles.selfies}>
                      <span className={styles.shots}>
                        {d.selfies.map((x, i) => (
                          <Pic key={x} src={x} className={styles.selfie} style={{ animationDelay: `${i * 320}ms` }} />
                        ))}
                      </span>
                      {d.upload.count}
                    </Msg>
                  )}
                </>
              )}
              {step === 4 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <Msg side="in" time={CLOCK[4]}>
                      {d.gen.text}
                      <Progress run={SPANS[4] - MARKS[1]} label={d.gen.eta} className={styles.prog} />
                    </Msg>
                  )}
                </>
              )}
              {step === 5 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <Msg side="in" tone="ok" time={CLOCK[5]} className={styles.wide}>
                      <Pic src={byId.terrace.you} />
                      {d.done.text}
                      <Keys items={d.done.keys} pressed={press} stack />
                    </Msg>
                  )}
                </>
              )}
              {step === 6 && (
                <>
                  {typing && <Typing leaving={leaving} />}
                  {reply && (
                    <Msg side="in" time={CLOCK[6]}>
                      {d.menu.text}
                      <Keys items={d.menu.keys} pressed={n >= 4 ? 2 : undefined} stack />
                    </Msg>
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
        </div>

        <div className={styles.under}>
          <Cap className={styles.cap}>{cur.cap}</Cap>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <div className={styles.notes}>
            <Note>{t.show.cast.demo}</Note>
            <Note>{t.mood.note}</Note>
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
