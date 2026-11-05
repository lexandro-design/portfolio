'use client'

import { useEffect, useState } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Title, Typing, usePlay } from '../kit'
import scene from '../Scene.module.css'
import { Art } from './Art'
import styles from './Scene.module.css'

type Data = {
  typing: string
  board: string
  chat: { title: string; sub: string; idle: string }
  layers: { student: string; etalon: string; etalonHead: string; caption: string; captionText: string }
  drag: string
  tags: { k: string; v: string }[]
  match: { title: string; vector: string; meta: string; sim: string; note: string }
  score: { title: string; base: string; of: string }
  pins: { k: string; t: string; ok: string }[]
  pinNote: string
  msgs: { photo1: string; review1: string; photo2: string; review2: string }
  steps: { cap: string; log: string }[]
}

/** Шаги: фото и его образ, поиск эталона, сравнение, отзыв, вторая сдача. Эталон преподавателя уже в базе */
const SPANS = [3200, 2600, 3400, 4200, 4200]

/** Метки внутри шага, мс: образ работы, «печатает» гаснет, ответ бота */
const MARKS = [700, 1100, 1300]

/** Условное время сообщений чата по порядку: фото, отзыв, второе фото, второй отзыв */
const CLOCK = ['16:40', '16:41', '16:52', '16:53']

/** Оценки по пятибалльной шкале и место метки на шкале, % */
const GRADES = [{ v: '3+', at: 66 }, { v: '4+', at: 86 }]

/** Где стоит шторка (доля работы ученика слева) на каждом шаге */
const WIPE = [100, 100, 50, 100, 100]

/** Рамки пометок на листе в процентах: [слева, сверху, ширина, высота] и сторона подписи */
const BOXES: { box: [number, number, number, number]; side: 'in' | 'right' | 'top' | 'bottom' }[] = [
  { box: [4, 5, 92, 88], side: 'in' },
  { box: [26, 6, 29, 15], side: 'right' },
  { box: [55, 82, 38, 9], side: 'top' },
  { box: [22, 33, 12, 40], side: 'bottom' },
]

/**
 * Проверка рисунков. Сцена: мольберт. На листе работа ученика и эталон
 * преподавателя, между ними шторка (её можно двигать). По шагам бот
 * считает образ работы, находит ближайший эталон, сравнивает, и на листе
 * появляются пометки разбора, как замечания на полях. Рядом чат ученика,
 * куда разбор приходит текстом: пять критериев и оценка
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS, { hold: 1800 })
  const { step } = play

  // Внутри шага: образ работы, набор бота, ответ. Пауза и reduced-motion показывают итог
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === step ? ph.n : 0
  const [drag, setDrag] = useState<{ step: number; v: number } | null>(null)

  const dragging = drag?.step === step
  const w = dragging ? drag.v : WIPE[step]
  const fixed = step >= 4
  const reply = n >= 3
  const reviewed = step >= 4 || (step === 3 && reply)
  const done = step === 4 && reply
  const typing = (step === 3 || step === 4) && n <= 2
  const score = done ? GRADES[1] : reviewed ? GRADES[0] : null

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.table}>
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

              <div className={styles.seam} style={{ left: `${w}%` }} data-on={(step === 2 && w > 0 && w < 100) || undefined} aria-hidden="true">
                <i />
              </div>
              <span className={styles.who} data-side="l" data-on={(step < 3 && w > 18) || undefined} aria-hidden="true">
                {d.layers.student}
              </span>
              <span className={styles.who} data-side="r" data-on={(step >= 2 && w < 82) || undefined} aria-hidden="true">
                {d.layers.etalon}
              </span>

              {step >= 2 && (
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

              {/* Шаг 0: образ работы */}
              <ul className={styles.tags} data-on={(step === 0 && n >= 1) || undefined} aria-hidden="true">
                {d.tags.map((g, i) => (
                  <li key={g.k} style={{ transitionDelay: `${i * 140}ms` }}>
                    <small>{g.k}</small>
                    {g.v}
                  </li>
                ))}
              </ul>

              {/* Шаг 1: выбор ближайшего эталона */}
              <div className={styles.match} data-on={step === 1 || undefined} aria-hidden="true">
                <Mono>{d.match.title}</Mono>
                <Art variant="etalon" className={styles.mini} />
                <dl>
                  <div>
                    <dt>{d.match.vector}</dt>
                    <dd>{d.match.sim}</dd>
                  </div>
                  <div>
                    <dt>{d.match.meta}</dt>
                    <dd>{d.match.note}</dd>
                  </div>
                </dl>
              </div>

              {/* Шаги 3-4: пометки разбора */}
              {d.pins.map((p, i) => {
                const b = BOXES[i]
                const ok = done && Boolean(p.ok)
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
                  <i className={styles.mark} style={{ left: `${score?.at ?? 0}%` }} data-on={score !== null || undefined} />
                  <i className={styles.fill} style={{ inlineSize: `${score?.at ?? 0}%` }} />
                </div>
              </div>
              <p className={styles.big} aria-live="polite">
                {score !== null ? (
                  <>
                    <strong key={score.v}>{score.v}</strong> <span>{d.score.of}</span>
                  </>
                ) : (
                  <span>·</span>
                )}
              </p>
            </div>

            <ol className={styles.legend}>
              {d.pins.map((p, i) => {
                const ok = done && Boolean(p.ok)
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

          <Chat title={d.chat.title} sub={typing ? d.typing : d.chat.sub} live={play.playing} fit minHeight={160} className={styles.chat}>
            <Msg side="out" time={CLOCK[0]} status={step >= 1 ? 'read' : 'sent'}>
              <span className={styles.photo}>
                <Art variant="student" className={styles.thumb} />
              </span>
              {d.msgs.photo1}
            </Msg>
            {step === 3 && typing && <Typing text={d.typing} leaving={n === 2} delay={150} />}
            {(step === 4 || (step === 3 && reply)) && (
              <Msg side="in" time={CLOCK[1]}>
                {d.msgs.review1}
              </Msg>
            )}
            {step === 4 && (
              <Msg side="out" time={CLOCK[2]} status={reply ? 'read' : 'sent'}>
                <span className={styles.photo}>
                  <Art variant="fixed" className={styles.thumb} />
                </span>
                {d.msgs.photo2}
              </Msg>
            )}
            {step === 4 && typing && <Typing text={d.typing} leaving={n === 2} delay={150} />}
            {done && (
              <Msg side="in" time={CLOCK[3]}>
                {d.msgs.review2}
              </Msg>
            )}
          </Chat>
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
