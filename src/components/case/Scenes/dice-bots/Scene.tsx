'use client'

import type { SceneProps } from '../types'
import {
  Back,
  Brief,
  Cap,
  Chat,
  Controls,
  Dots,
  Facts,
  Keys,
  Lead,
  Meta,
  Mono,
  Msg,
  Note,
  Progress,
  Reveal,
  Sys,
  Title,
  Typing,
  usePlay,
} from '../kit'
import { Dart, Die, Slot } from './Stickers'
import { usePhase, useRise } from './timers'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Reply = { kind: 'lucky' | 'won'; left?: number; prize: string }
type Throw = {
  at: number
  who: number
  game: 'slot' | 'dice' | 'dart'
  hit: boolean
  reels?: string[]
  value?: number
  rule?: string
  reply?: Reply
}
type Admin = { at: number; who: number; combo: string; time: string; after: number }
type Rule = { id: string; game: string; e: string; rule: string; prize: string }

type Data = {
  chat: { title: string; sub: string; bot: string }
  admin: { title: string; sub: string; empty: string }
  board: { title: string; sub: string; of: string; reset: string }
  rules: { title: string; list: Rule[]; note: string }
  wait: string
  typing: string
  miss: string
  reply: { lucky: string; won: string; keysLucky: string[]; keysWon: string[] }
  adminCard: string
  players: { name: string; id: string }[]
  steps: { cap: string }[]
  counter: number[]
  events: Throw[]
  admins: Admin[]
}

/** Длительность шагов: бросок, пауза бота, «печатает», ответ. Выигрыш держится дольше промаха */
const SPANS = [3000, 4600, 3000, 4600, 4800, 4600, 3400, 4800, 4200]
/** Пауза бота перед ответом: в коде узлы Wait на 3-4 секунды, на сцене нижняя граница */
const WAIT = 3000
/** Сколько «печатает…» видно до ответа; последние 200 мс индикатор гаснет */
const TYPE = 550
const LEAVE = 200
/** Время сообщений бота в чате: условное, но по сценарию растёт; у заявок админу своё из json */
const CLOCK: Record<number, string> = { 1: '17:52', 3: '17:57', 4: '18:01', 5: '18:04', 7: '18:06' }
const GOAL = 3
/** Шаг, на котором счётчик игрока обнуляется */
const BAR_PLAYER = 1

const fill = (s: string, v: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(v[k]))

function Sticker({ ev, settled }: { ev: Throw; settled: boolean }) {
  if (ev.game === 'slot') return <Slot reels={ev.reels ?? []} hit={ev.hit} settled={settled} />
  if (ev.game === 'dice') return <Die value={ev.value ?? 6} settled={settled} />
  return <Dart hit={ev.hit} settled={settled} />
}

/** Один бросок: эмодзи игрока, пауза бота с прогрессом, «печатает…», ответ (только на выигрыш) */
function Play({ ev, live, d }: { ev: Throw; live: boolean; d: Data }) {
  // 0 пауза, 1 печатает, 2 индикатор гаснет, 3 ответ
  const phase = usePhase(live, [WAIT, WAIT + TYPE - LEAVE, WAIT + TYPE])
  const p = d.players[ev.who]
  const r = ev.reply
  return (
    <>
      <Msg side="in" name={p.name} tail={false} className={styles.sticker}>
        <span className={styles.obj}>
          <Sticker ev={ev} settled={!live} />
        </span>
        {ev.hit && live && phase < 3 && (
          <span className={styles.wait} data-done={phase > 0 || undefined}>
            <Dots />
            {d.wait}
            <Progress run={WAIT} label={d.wait} className={styles.progress} />
          </span>
        )}
        {!ev.hit && (
          <span className={styles.verdict} data-late={live || undefined}>
            {d.miss}
          </span>
        )}
      </Msg>
      {r && (phase === 1 || phase === 2) && <Typing text={d.typing} leaving={phase === 2} />}
      {r && phase >= 3 && (
        <Msg side="in" name={d.chat.bot} time={CLOCK[ev.at]}>
          {fill(r.kind === 'lucky' ? d.reply.lucky : d.reply.won, {
            name: p.name,
            left: r.left ?? 0,
            prize: r.prize,
          })}
          <Keys items={r.kind === 'lucky' ? d.reply.keysLucky : d.reply.keysWon} />
        </Msg>
      )}
    </>
  )
}

function Request({ a, live, d }: { a: Admin; live: boolean; d: Data }) {
  const phase = usePhase(live, [Math.max(0, a.after - TYPE), a.after - LEAVE, a.after])
  if (phase < 1) return null
  if (phase < 3) return <Typing text={d.typing} leaving={phase === 2} />
  const p = d.players[a.who]
  const stamp = /(\d{2}:\d{2}):\d{2}$/.exec(a.time)?.[1]
  return (
    <Msg side="in" name={d.chat.bot} time={stamp} className={styles.card}>
      {fill(d.adminCard, { name: p.name, id: p.id, combo: a.combo, time: a.time })}
    </Msg>
  )
}

/**
 * Игры на эмодзи в групповом чате. Игровой стол: в центре чат, где игроки
 * бросают слот, кубик и дартс, слева счётчик побед за день и правила
 * выигрыша, справа чат админа, куда приходит «Новый победитель»
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play

  const throws = d.events.filter((e) => e.at <= step)
  const requests = d.admins.filter((a) => a.at <= step)
  const now = throws[throws.length - 1]

  // Счётчик игрока растёт, когда бот уже ответил, и обнуляется сразу
  const count = useRise(d.counter[step], WAIT + TYPE)
  const resetting = step === 6
  const idle = step === play.last

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.table}>
          <div className={styles.stage}>
            <section className={styles.board} aria-label={d.board.title}>
              <Mono>{d.board.title}</Mono>
              <p className={styles.sub}>{d.board.sub}</p>
              <ul className={styles.players}>
                {d.players.map((p, i) => {
                  const mine = i === BAR_PLAYER
                  const n = mine ? count : 0
                  const hot = mine && (step === 1 || step === 3 || step === 5 || resetting)
                  return (
                    <li
                      key={p.name}
                      className={styles.player}
                      data-hot={hot || undefined}
                      data-max={(mine && n >= GOAL) || undefined}
                    >
                      <span className={styles.pname}>{p.name}</span>
                      <span className={styles.pips} aria-hidden="true">
                        {Array.from({ length: GOAL }, (_, k) => (
                          <i key={k} data-on={k < n || undefined} />
                        ))}
                      </span>
                      <span className={styles.num}>
                        {resetting && mine ? d.board.reset : `${n} ${d.board.of}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className={styles.rules} aria-label={d.rules.title}>
              <Mono>{d.rules.title}</Mono>
              <ul className={styles.list} data-all={idle || undefined}>
                {d.rules.list.map((r) => (
                  <li
                    key={r.id}
                    data-on={now?.game === r.game || undefined}
                    data-hit={now?.rule === r.id || undefined}
                  >
                    <span className={styles.em}>{r.e}</span>
                    <span className={styles.rule}>{r.rule}</span>
                    <span className={styles.prize}>{r.prize}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.fine}>{d.rules.note}</p>
            </section>

            <Chat
              title={d.chat.title}
              sub={d.chat.sub}
              avatar="🎲"
              live={play.playing}
              className={styles.chat}
            >
              {throws.map((ev) => (
                <Play key={ev.at} ev={ev} live={ev.at === step} d={d} />
              ))}
            </Chat>

            <Chat
              title={d.admin.title}
              sub={d.admin.sub}
              live={play.playing}
              className={styles.admin}
            >
              {requests.length === 0 && <Sys>{d.admin.empty}</Sys>}
              {requests.map((a) => (
                <Request key={a.at} a={a} live={a.at === step} d={d} />
              ))}
            </Chat>
          </div>

          <div className={styles.under}>
            <Cap className={styles.cap}>{d.steps[step].cap}</Cap>
            <Controls
              play={play}
              t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }}
              className={styles.controls}
            />
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
