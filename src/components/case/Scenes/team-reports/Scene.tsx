'use client'

import { useEffect, useState } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Progress, Reveal, Sheet, Sys, Title, Typing, usePlay, type SheetRow } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Data = {
  typing: string
  chat: { title: string; sub: string }
  parser: { title: string; fields: string[] }
  sheet: { title: string; cols: string[] }
  summary: { title: string; cols: string[] }
  steps: { cap: string; log: string }[]
  messages: { who: string; text: string; time: string }[]
  edited: string
  sys: { edited: string; deleted: string }
  rows: string[][]
  edit: string[]
  totals: string[][]
}

/** Длительность шагов: сообщение читается, строки въезжают, сводка держится */
const SPANS = [3200, 3800, 2600, 2400, 3600]

/**
 * Метки внутри шага, мс. Шаг 0: «прочитано» (n=1), строки в таблице (n=2). Шаг 1 по номеру n:
 * 0 печатает Петров, 1 индикатор гаснет, 2 его сообщение, 3 печатает Сидоров, 4 индикатор гаснет, 5 сообщение Сидорова
 */
const MARKS = [600, 900, 1500, 1900, 2100]

/**
 * Отчёты из WhatsApp в таблицу. Сцена: слева рабочая группа, в которую
 * пишут сотрудники, справа лист Google Sheets, куда бот кладёт строки.
 * Между ними сам бот: какие поля он вытащил из сообщения. Правка и
 * удаление в чате меняют таблицу, в конце месяца из строк собирается сводка
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS, { hold: 1800 })
  const { step } = play

  // Внутри шага: отметки времени. Пауза и reduced-motion показывают итог
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === step ? ph.n : 0

  // Чат: кто уже написал, какое сообщение исправлено, какое удалено
  const second = step > 1 || (step === 1 && n >= 2)
  const third = step > 1 || (step === 1 && n >= 5)
  const typingWho = step !== 1 ? 0 : n < 2 ? 1 : n >= 3 && n < 5 ? 2 : 0
  const leaving = step === 1 && (n === 1 || n === 4)
  const read = step > 0 || n >= 1
  const edited = step >= 2
  const deleted = step >= 3
  const msgs = d.messages.slice(0, third ? 3 : second ? 2 : 1)

  // Таблица: строки появляются вслед за сообщениями, по одной с задержкой
  const rows: SheetRow[] = []
  if (step >= 1 || n >= 2) rows.push(...d.rows.slice(0, 2).map((c, i) => ({ c, s: step === 0 ? ('on' as const) : undefined, key: `r${i}` })))
  if (second) {
    rows.push({ c: d.rows[2], s: step === 1 ? 'on' : undefined, key: 'r2' })
    rows.push({ c: edited ? d.edit : d.rows[3], s: step === 1 ? 'on' : step === 2 ? 'edit' : undefined, key: 'r3' })
  }
  if (third) rows.push({ c: d.rows[4], s: deleted ? 'dim' : step === 1 ? 'on' : undefined, key: 'r4' })
  const final = step === 4
  const sub = typingWho > 0 ? `${d.messages[typingWho].who} ${d.typing}` : d.chat.sub

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.table}>
          <div className={styles.stage} data-final={final || undefined}>
            <Chat title={d.chat.title} sub={sub} tone="wa" live={play.playing} className={styles.chat}>
              {msgs.map((m, i) => {
                const isEdited = i === 1 && edited
                const isDeleted = i === 2 && deleted
                if (i === 0) {
                  // Первый отчёт виден с телефона самого сотрудника: свой пузырь с галочками
                  return (
                    <Msg key="mine" side="out" time={m.time} status={read ? 'read' : 'sent'}>
                      {m.text}
                    </Msg>
                  )
                }
                return (
                  <Msg key={`${i}-${isEdited}-${isDeleted}`} side="in" name={m.who} time={m.time} tone={isDeleted ? 'dim' : undefined}>
                    {isEdited ? d.edited : m.text}
                  </Msg>
                )
              })}
              {typingWho > 0 && <Typing text={d.typing} leaving={leaving} />}
              {edited && <Sys>{d.sys.edited}</Sys>}
              {deleted && <Sys>{d.sys.deleted}</Sys>}
            </Chat>

            <div className={styles.parser} aria-hidden="true">
              <Mono>{d.parser.title}</Mono>
              <ul className={styles.fields} data-on={rows.length > 0 || undefined}>
                {d.parser.fields.map((f, i) => (
                  <li key={f} style={{ animationDelay: `${i * 110}ms` }}>
                    {f}
                  </li>
                ))}
              </ul>
              {rows.length > 0 && step <= 2 && <Progress key={`${step}:${rows.length}`} run={1100} className={styles.parse} />}
              <p key={step} className={styles.log}>
                {d.steps[step].log}
              </p>
            </div>

            <div className={styles.sheets}>
              <Sheet title={d.sheet.title} cols={d.sheet.cols} rows={rows} blank={5} className={styles.sheet} />
              <div className={styles.summary} data-on={final || undefined}>
                <Sheet title={d.summary.title} cols={d.summary.cols} rows={final ? d.totals.map((c, i) => ({ c, s: 'on' as const, key: `t${i}` })) : []} blank={2} />
              </div>
            </div>
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
