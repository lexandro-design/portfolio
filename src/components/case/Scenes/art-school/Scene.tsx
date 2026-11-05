'use client'

import { useState } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Sys, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import { Art } from './Art'
import styles from './Scene.module.css'

type Data = {
  board: string
  chat: { title: string; sub: string; idle: string }
  layers: { student: string; etalon: string; etalonHead: string; caption: string; captionText: string }
  drag: string
  tags: { k: string; v: string }[]
  match: { title: string; vector: string; meta: string }
  score: { title: string; base: string; of: string }
  pins: { k: string; t: string; ok: string }[]
  pinNote: string
  msgs: { photo1: string; review1: string; photo2: string; review2: string }
  steps: { cap: string; log: string }[]
}

/** Шаги: эталон, фото, описание, поиск эталона, сравнение, отзыв, вторая сдача */
const SPANS = [3000, 2400, 3000, 3200, 3800, 4600, 4600]

/** Где стоит шторка (доля работы ученика слева) на каждом шаге */
const WIPE = [0, 100, 100, 100, 50, 100, 100]

/** Рамки пометок на листе в процентах: [слева, сверху, ширина, высота] и сторона подписи */
const BOXES: { box: [number, number, number, number]; side: 'in' | 'right' | 'bottom' | 'left' }[] = [
  { box: [4, 5, 92, 88], side: 'in' },
  { box: [26, 6, 29, 15], side: 'right' },
  { box: [55, 82, 38, 9], side: 'bottom' },
  { box: [22, 33, 12, 40], side: 'left' },
]

/**
 * Проверка рисунков. Сцена: мольберт. На листе работа ученика и эталон
 * преподавателя, между ними шторка (её можно двигать). По шагам бот
 * описывает работу, находит ближайший эталон, сравнивает, и на листе
 * появляются пометки разбора, как замечания на полях. Рядом чат ученика,
 * куда разбор приходит текстом по критериям
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play
  const [drag, setDrag] = useState<{ step: number; v: number } | null>(null)

  const dragging = drag?.step === step
  const w = dragging ? drag.v : WIPE[step]
  const fixed = step >= 6
  const reviewed = step >= 5
  const score = fixed ? 84 : reviewed ? 72 : null

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.easel}>
          <section className={styles.board} aria-label={d.board}>
            <div className={styles.rail}>
              <Mono>{d.board}</Mono>
              <span className={styles.ticks} aria-hidden="true" />
              <p key={step} className={styles.log}>
                {d.steps[step].log}
              </p>
            </div>

            <div className={styles.stage} data-drag={dragging || undefined}>
              <div className={styles.layer} data-kind="etalon">
                <Art variant="etalon" className={styles.art} />
              </div>
              <div className={styles.layer} data-kind="student" style={{ clipPath: `inset(0 ${100 - w}% 0 0)` }}>
                <Art key={fixed ? 'f' : 's'} variant={fixed ? 'fixed' : 'student'} className={styles.art} />
              </div>

              <div className={styles.seam} style={{ left: `${w}%` }} data-on={(step >= 4 && w > 0 && w < 100) || undefined} aria-hidden="true">
                <i />
              </div>
              <span className={styles.who} data-side="l" data-on={(step >= 1 && step < 5 && w > 18) || undefined} aria-hidden="true">
                {d.layers.student}
              </span>
              <span className={styles.who} data-side="r" data-on={(step === 0 || (step >= 4 && w < 82)) || undefined} aria-hidden="true">
                {step === 0 ? d.layers.etalonHead : d.layers.etalon}
              </span>

              {step >= 4 && (
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(w)}
                  onChange={(e) => setDrag({ step, v: Number(e.target.value) })}
                  className={styles.wipe}
                  aria-label={d.drag}
                />
              )}

              {/* Шаг 0: подпись преподавателя к эталону */}
              <div className={styles.capt} data-on={step === 0 || undefined} aria-hidden="true">
                <Mono>{d.layers.caption}</Mono>
                <span>{d.layers.captionText}</span>
              </div>

              {/* Шаг 2: описание работы */}
              <ul className={styles.tags} data-on={step === 2 || undefined} aria-hidden="true">
                {d.tags.map((g, i) => (
                  <li key={g.k} style={{ transitionDelay: `${i * 140}ms` }}>
                    <small>{g.k}</small>
                    {g.v}
                  </li>
                ))}
              </ul>

              {/* Шаг 3: выбор ближайшего эталона */}
              <div className={styles.match} data-on={step === 3 || undefined} aria-hidden="true">
                <Mono>{d.match.title}</Mono>
                <Art variant="etalon" className={styles.mini} />
                <dl>
                  <div>
                    <dt>{d.match.vector}</dt>
                    <dd>0,6</dd>
                  </div>
                  <div>
                    <dt>{d.match.meta}</dt>
                    <dd>0,4</dd>
                  </div>
                </dl>
              </div>

              {/* Шаги 5-6: пометки разбора */}
              {d.pins.map((p, i) => {
                const b = BOXES[i]
                const ok = fixed && Boolean(p.ok)
                return (
                  <div
                    key={p.k}
                    className={styles.pin}
                    data-on={reviewed || undefined}
                    data-ok={ok || undefined}
                    data-side={b.side}
                    style={{ left: `${b.box[0]}%`, top: `${b.box[1]}%`, inlineSize: `${b.box[2]}%`, blockSize: `${b.box[3]}%`, transitionDelay: reviewed ? `${i * 260}ms` : '0ms' }}
                    aria-hidden="true"
                  >
                    <b>{ok ? '✓' : i + 1}</b>
                    <span>
                      <em>{p.k}</em> {ok ? p.ok : p.t}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className={styles.strip}>
              <div className={styles.meter} aria-hidden="true">
                <Mono>{d.score.title}</Mono>
                <div className={styles.track}>
                  <span className={styles.base}>{d.score.base}</span>
                  <i className={styles.mark} style={{ left: `${score ?? 0}%` }} data-on={score !== null || undefined} />
                  <i className={styles.fill} style={{ inlineSize: `${score ?? 0}%` }} />
                </div>
              </div>
              <p className={styles.big} aria-live="polite">
                {score !== null ? (
                  <>
                    <strong key={score}>{score}</strong> <span>{d.score.of}</span>
                  </>
                ) : (
                  <span>·</span>
                )}
              </p>
            </div>

            <ol className={styles.legend}>
              {d.pins.map((p, i) => {
                const ok = fixed && Boolean(p.ok)
                return (
                  <li key={p.k} data-on={reviewed || undefined} data-ok={ok || undefined}>
                    <b>{ok ? '✓' : i + 1}</b>
                    <span>
                      <em>{p.k}</em> {ok ? p.ok : p.t}
                    </span>
                  </li>
                )
              })}
              <li className={styles.legendNote}>{d.pinNote}</li>
            </ol>
          </section>

          <Chat title={d.chat.title} sub={d.chat.sub} live={play.playing} className={styles.chat}>
            {step === 0 && <Sys>{d.chat.idle}</Sys>}
            {step >= 1 && (
              <Msg side="out">
                <span className={styles.photo}>
                  <Art variant="student" className={styles.thumb} />
                </span>
                {d.msgs.photo1}
              </Msg>
            )}
            {reviewed && <Msg side="in">{d.msgs.review1}</Msg>}
            {fixed && (
              <Msg side="out">
                <span className={styles.photo}>
                  <Art variant="fixed" className={styles.thumb} />
                </span>
                {d.msgs.photo2}
              </Msg>
            )}
            {fixed && <Msg side="in">{d.msgs.review2}</Msg>}
          </Chat>
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
