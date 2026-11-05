'use client'

import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Line = { k: 'out' | 'in' | 'sys'; text: string; d?: number }
type Step = {
  cap: string
  log: string
  lead: string
  who: 'left' | 'right' | 'both'
  lane: number
  reset?: 'left' | 'right'
  left?: Line[]
  right?: Line[]
}
type Data = {
  left: { title: string; sub: string }
  right: { title: string; sub: string }
  idle: string
  newDialog: string
  head: { title: string; idle: string; all: string }
  lanes: { label: string; out: string; tags: string[]; card?: string }[]
  steps: Step[]
}

/** Шаги: вход клиента, три дорожки для клиента, две для сотрудника, передача человеку, итог */
const SPANS = [3000, 2600, 3800, 3400, 3200, 3600, 3600, 4400, 4000, 4600]

const pad = (n: number) => String(n + 1).padStart(2, '0')

/** Лента окна: с последнего сброса (новый диалог) до текущего шага */
function feed(steps: Step[], step: number, side: 'left' | 'right', fresh: string) {
  let from = 0
  for (let i = 0; i <= step; i++) if (steps[i].reset === side) from = i
  const out: (Line & { key: string; cur: boolean; old: boolean })[] = []
  for (let i = 0; i <= step; i++) {
    if (i === from && from > 0) out.push({ k: 'sys', text: fresh, key: `new-${i}`, cur: i === step, old: false })
    ;(steps[i][side] ?? []).forEach((m, j) => out.push({ ...m, key: `${i}-${j}`, cur: i === step, old: i < from }))
  }
  return out
}

/**
 * Один мозг, два окна. По краям два чата: клиент пишет Андрею, сотрудник
 * пишет Софье. Между ними общий разбор запроса и четыре дорожки: каталог,
 * база знаний, готовый ответ, менеджер. Запрос уезжает из своего окна по
 * рельсе к дорожке, дорожка загорается, ответ возвращается в тот же чат
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play
  const cur = d.steps[step]
  const all = cur.who === 'both'

  // Название ИИ-инструмента в фактах не показываем
  const safeFacts = facts.map((f) => ({ ...f, value: f.value.replace(/\s*[,·/]\s*GigaChat/gi, '').replace(/GigaChat\s*[,·/]\s*/gi, '') }))

  const side = (s: 'left' | 'right') => {
    const dim = !all && cur.who !== s
    return (
      <div className={`${styles.col} ${styles[s]}`}>
      <Chat
        title={d[s].title}
        sub={d[s].sub}
        tone="tg"
        live={play.playing && (all || cur.who === s)}
        className={styles.chat}
        style={{ opacity: dim ? 0.5 : 1 }}
      >
        {feed(d.steps, step, s, d.newDialog).map((m) =>
          m.k === 'sys' ? (
            <li key={m.key} className={`${styles.sys} ${m.cur ? styles[`d${m.d ?? 0}`] : ''} ${m.old ? styles.old : ''}`}>
              {m.text}
            </li>
          ) : (
            <Msg key={m.key} side={m.k} className={[m.cur && m.d ? styles[`d${m.d}`] : '', m.old ? styles.old : ''].filter(Boolean).join(' ') || undefined}>
              {m.text}
            </Msg>
          ),
        )}
      </Chat>
      </div>
    )
  }

  const rail = (i: number, s: 'l' | 'r') => {
    const hot = cur.lane === i && cur.who === (s === 'l' ? 'left' : 'right')
    return (
      <span key={`${s}${i}-${hot ? step : 'x'}`} className={`${styles.rail} ${s === 'l' ? styles.railL : styles.railR}`} data-hot={hot || undefined} data-all={all || undefined} aria-hidden="true">
        <i />
      </span>
    )
  }

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage} data-who={cur.who} data-final={all || undefined}>
          {side('left')}

          <div className={styles.head}>
            <Mono>{d.head.title}</Mono>
            <p key={step} className={styles.log}>
              {all ? d.head.all : cur.log || d.head.idle}
            </p>
            <span className={styles.lead} data-on={cur.lead ? true : undefined}>
              {cur.lead}
            </span>
          </div>

          {d.lanes.map((l, i) => {
            const hot = cur.lane === i
            return (
              <div key={l.label} className={styles.laneRow} style={{ ['--row' as string]: i + 2 }}>
                {rail(i, 'l')}
                <div className={styles.lane} data-hot={hot || undefined} data-all={all || undefined} data-last={i === d.lanes.length - 1 || undefined}>
                  <span className={styles.laneHead}>
                    <b>{pad(i)}</b>
                    {l.label}
                  </span>
                  <span className={styles.out}>{l.out}</span>
                  <span className={styles.tags}>
                    {l.tags.map((g) => (
                      <em key={g}>{g}</em>
                    ))}
                  </span>
                  {l.card && <span className={styles.card}>{l.card}</span>}
                  <i key={hot ? step : 'x'} className={styles.sweep} aria-hidden="true" />
                </div>
                {rail(i, 'r')}
              </div>
            )
          })}

          {side('right')}
        </div>

        <div className={styles.under}>
          <Cap className={styles.cap}>{cur.cap}</Cap>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <Note>{t.show.cast.demo}</Note>
        </div>

        <Reveal className={styles.intro}>
          <Lead item={item} />
          <Facts facts={safeFacts} className={styles.facts} />
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
