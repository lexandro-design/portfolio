'use client'

import { useEffect, useState, type ReactNode } from 'react'
import type { SceneProps } from '../types'
import {
  Back,
  Brief,
  Cap,
  Chat,
  Controls,
  Facts,
  Keys,
  Lead,
  Meta,
  Mono,
  Msg,
  Note,
  Reveal,
  Title,
  usePlay,
} from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Status = 'wait' | 'work' | 'done' | 'free'
type DeskId = 'web' | 'design' | 'mech' | 'content'

type Data = {
  phone: { title: string; sub: string }
  office: string
  desks: { id: DeskId; name: string; task: string }[]
  status: Record<Status, string>
  replies: { title: string; items: string[] }
  keys: { yes: string; no: string; own: string; allow: string; deny: string }
  msgs: {
    ask: string
    hint: string
    ack: string
    read: string
    perm: string
    allowed: string
    decoding: string
    decoded: string
    done: string
    shot: string
    text: string
    textAck: string
    photoCap: string
    photoAck: string
    office: string
    wait: string
    busy: string
    free: string
    boardBusy: string[]
    boardFree: string
    onPc: string
  }
  steps: { cap: string; log: string }[]
  rule: { title: string; num: string; text: string }
  cmds: { c: string; t: string }[]
}

/**
 * Шаги: вопрос и «Да», запрос и разрешение, голос, скрин, текст и фото, табло, закрыто на компе.
 * Было десять шагов на 34,6 с: нажатие склеено с вопросом, разрешение с запросом, текст с фото
 */
const SPANS = [3200, 3200, 3000, 2800, 3600, 3000, 3200]

/** Внутри шага, мс: кнопка нажата, затем ответ бота и разрешение. Пауза и reduced-motion показывают итог */
const MARKS = [1100, 1900]

/** Условное время сообщений по прежним номерам шагов: идёт вперёд по сценарию */
const CLOCK = [
  '10:02',
  '10:02',
  '10:15',
  '10:15',
  '10:21',
  '10:24',
  '10:26',
  '10:27',
  '10:31',
  '10:40',
]

/** Что летит между столом и телефоном на каждом шаге: стол, направление, значок */
const FLY: ({ desk: DeskId; dir: 'in' | 'out'; glyph: string } | null)[] = [
  { desk: 'web', dir: 'in', glyph: '❓' },
  { desk: 'web', dir: 'out', glyph: '✓' },
  { desk: 'design', dir: 'in', glyph: '❓' },
  { desk: 'design', dir: 'out', glyph: '✅' },
  { desk: 'web', dir: 'out', glyph: '🎤' },
  { desk: 'web', dir: 'in', glyph: '✅' },
  { desk: 'design', dir: 'out', glyph: '💬' },
  { desk: 'design', dir: 'out', glyph: '📷' },
  null,
  { desk: 'content', dir: 'in', glyph: '❓' },
]

/** Какой способ ответа подсвечен под экраном: кнопка, текст, голос, фото */
const REPLY = [-1, 0, -1, 0, 2, -1, 1, 3, -1, -1]

const BARS = [5, 9, 14, 8, 17, 11, 6, 15, 10, 19, 7, 12, 16, 8, 13, 6, 10, 4]

function status(id: DeskId, step: number, late: boolean): Status {
  if (id === 'web') return step === 0 ? 'wait' : step < 5 ? 'work' : 'done'
  if (id === 'design') return step === 2 ? 'wait' : 'work'
  if (id === 'content') return step === 9 && !late ? 'wait' : 'work'
  return 'free'
}

/** Заготовка скрина: серые полосы вместо страницы, подпись моно */
function Shot({ label, small }: { label: string; small?: boolean }) {
  return (
    <span className={styles.shot} data-small={small || undefined} aria-hidden="true">
      <i />
      <i />
      <i />
      <Mono className={styles.shotLabel}>{label}</Mono>
    </span>
  )
}

function Wave({ live }: { live: boolean }) {
  return (
    <span className={styles.wave} data-live={live || undefined} aria-hidden="true">
      <span className={styles.mic}>🎤</span>
      {BARS.map((h, i) => (
        <i key={i} style={{ blockSize: h, animationDelay: `${i * 70}ms` }} />
      ))}
    </span>
  )
}

/**
 * Телефон на столе, офис вокруг него. В центре экран Telegram, по краям
 * карточки столов офиса. Вопрос вылетает из стола по линии связи к телефону
 * вместе с кнопками, ответ (кнопкой, текстом, голосом или фото) летит
 * обратно, и стол меняет состояние: ждёт, работает, готово. Под сценой
 * правило тишины и команды бота
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const nstep = play.step
  const m = d.msgs

  // Внутри шага: кнопка нажата, ответ бота. n: сколько меток прошло
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step: nstep, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [nstep, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === nstep ? ph.n : 0
  // Прежний номер шага и «вторая половина»: по ним собираются сообщения и состояние столов
  const step = [n >= 1 ? 1 : 0, n >= 1 ? 3 : 2, 4, 5, n >= 2 ? 7 : 6, 8, 9][nstep]
  const late = n >= 2

  const fly = FLY[step]
  const permKeysOn = (n: number) => step === n || (step === n + 1 && !late)

  /** Сообщения шага i. Классы d1/d2 задерживают появление, пока пакет долетает */
  const msgsOf = (i: number): ReactNode[] => {
    switch (i) {
      case 0:
        return [
          <Msg key="0a" side="in" time={CLOCK[0]} className={styles.d2}>
            {m.ask}
            <span className={styles.hint}>{m.hint}</span>
            {(step === 0 || (step === 1 && !late)) && (
              <>
                <Keys items={[d.keys.yes, d.keys.no]} pressed={step === 1 ? 0 : undefined} />
                <Keys items={[d.keys.own]} stack />
              </>
            )}
          </Msg>,
        ]
      case 1:
        return [
          <Msg
            key="1a"
            side="in"
            time={CLOCK[1]}
            tone={late ? 'ok' : undefined}
            className={styles.d1}
          >
            {m.ack}
            {late && <span className={styles.hint}>{m.read}</span>}
          </Msg>,
        ]
      case 2:
        return [
          <Msg key="2a" side="in" time={CLOCK[2]} className={styles.d2}>
            {m.perm}
            {step >= 3 && (step > 3 || late) && <span className={styles.note}>{m.allowed}</span>}
            {permKeysOn(2) && (
              <Keys items={[d.keys.allow, d.keys.deny]} pressed={step === 3 ? 0 : undefined} />
            )}
          </Msg>,
        ]
      case 3:
        return []
      case 4:
        return [
          <Msg key="4a" side="out" time={CLOCK[4]} status="read" className={styles.d0}>
            <Wave live={step === 4 && !late} />
          </Msg>,
          <Msg key="4b" side="in" time={CLOCK[4]} className={styles.d1}>
            {step === 4 && !late ? m.decoding : m.decoded}
          </Msg>,
        ]
      case 5:
        return [
          <Msg key="5a" side="in" time={CLOCK[5]} className={styles.d2}>
            {m.done}
            <Shot label={m.shot} />
          </Msg>,
        ]
      case 6:
        return [
          <Msg key="6a" side="out" time={CLOCK[6]} status="read" className={styles.d0}>
            {m.text}
          </Msg>,
          <Msg key="6b" side="in" time={CLOCK[6]} tone="ok" className={styles.d1}>
            {m.textAck}
          </Msg>,
        ]
      case 7:
        return [
          <Msg key="7a" side="out" time={CLOCK[7]} status="read" className={styles.d0}>
            <Shot label="" small />
            {m.photoCap}
          </Msg>,
          <Msg key="7b" side="in" time={CLOCK[7]} tone="ok" className={styles.d1}>
            {m.photoAck}
          </Msg>,
        ]
      case 8:
        return [
          <Msg key="8a" side="out" time={CLOCK[8]} status="read" className={styles.d0}>
            <span className={styles.cmd}>{m.office}</span>
          </Msg>,
          <Msg key="8b" side="in" time={CLOCK[8]} className={styles.d1}>
            <span className={styles.board}>
              <b>{m.busy}</b>
              {m.boardBusy.map((r) => (
                <span key={r}>{r}</span>
              ))}
              <b>{m.free}</b>
              <span>{m.boardFree}</span>
            </span>
          </Msg>,
        ]
      default:
        return [
          <Msg key="9a" side="in" time={CLOCK[9]} className={styles.d2}>
            {m.perm}
            {late && <span className={styles.note}>{m.onPc}</span>}
            {!late && <Keys items={[d.keys.allow, d.keys.deny]} />}
          </Msg>,
        ]
    }
  }
  const feed: ReactNode[] = []
  for (let i = 0; i <= step; i++) feed.push(...msgsOf(i))
  const shown = feed.slice(-4)

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage} data-scan={step === 8 || undefined}>
          <Mono className={styles.office}>{d.office}</Mono>

          {d.desks.map((desk) => {
            const s = status(desk.id, step, late)
            const hot = fly?.desk === desk.id
            return (
              <div
                key={desk.id}
                className={styles.desk}
                data-desk={desk.id}
                data-s={s}
                data-hot={hot || undefined}
              >
                <span className={styles.deskName}>{desk.name}</span>
                <span className={styles.deskTask}>{desk.task}</span>
                <span className={styles.deskState}>
                  <i aria-hidden="true" />
                  {d.status[s]}
                </span>
                <span className={styles.bars} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            )
          })}

          {d.desks.map((desk) => {
            const hot = fly?.desk === desk.id
            return (
              <div
                key={desk.id}
                className={styles.link}
                data-link={desk.id}
                data-hot={hot || undefined}
                aria-hidden="true"
              >
                {hot && fly && (
                  <i
                    key={step}
                    className={styles.packet}
                    data-dir={fly.dir}
                    data-side={desk.id === 'web' || desk.id === 'design' ? 'l' : 'r'}
                  >
                    {fly.glyph}
                  </i>
                )}
              </div>
            )
          })}

          <div className={styles.device}>
            <Chat
              title={d.phone.title}
              sub={d.phone.sub}
              tone="tg"
              avatar="LX"
              live={play.playing}
              className={styles.chat}
            >
              {shown}
            </Chat>
            <div className={styles.reply}>
              <Mono>{d.replies.title}</Mono>
              <ul>
                {d.replies.items.map((r, i) => (
                  <li key={r} data-on={REPLY[step] === i || undefined}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.under}>
          <Cap className={styles.cap}>{d.steps[nstep].cap}</Cap>
          <div className={styles.side}>
            <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} />
            <p key={nstep} className={styles.log}>
              {d.steps[nstep].log}
            </p>
            <Note>{t.show.cast.demo}</Note>
          </div>
        </div>

        <div className={styles.rule} data-on={step === 9 || undefined}>
          <div className={styles.num}>
            <Mono>{d.rule.title}</Mono>
            <strong>{d.rule.num}</strong>
          </div>
          <p>{d.rule.text}</p>
          <ul className={styles.cmds}>
            {d.cmds.map((c, i) => (
              <li key={c.c} data-on={(step === 8 && i === 0) || undefined}>
                <code>{c.c}</code>
                <span>{c.t}</span>
              </li>
            ))}
          </ul>
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
