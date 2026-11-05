'use client'

import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Lead, Meta, Mono, Msg, Note, Reveal, Sheet, Sys, Title, usePlay, type SheetRow } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Data = {
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
const SPANS = [2600, 3000, 3200, 3000, 2800, 4200]

/**
 * Отчёты из WhatsApp в таблицу. Сцена: слева рабочая группа, в которую
 * пишут сотрудники, справа лист Google Sheets, куда бот кладёт строки.
 * Между ними сам бот: какие поля он вытащил из сообщения. Правка и
 * удаление в чате меняют таблицу, в конце месяца из строк собирается сводка
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play

  // Чат: какие сообщения уже написаны, какое исправлено, какое удалено
  const msgs = d.messages.slice(0, step >= 2 ? 3 : step >= 0 ? 1 : 0)
  const edited = step >= 3
  const deleted = step >= 4

  // Таблица: строки по состоянию шага
  const rows: SheetRow[] = []
  if (step >= 1) rows.push(...d.rows.slice(0, 2).map((c, i) => ({ c, s: step === 1 ? ('on' as const) : undefined, key: `r${i}` })))
  if (step >= 2) {
    rows.push({ c: d.rows[2], s: step === 2 ? 'on' : undefined, key: 'r2' })
    rows.push({
      c: edited ? d.edit : d.rows[3],
      s: step === 2 ? 'on' : step === 3 ? 'edit' : undefined,
      key: 'r3',
    })
    rows.push({ c: d.rows[4], s: deleted ? 'dim' : step === 2 ? 'on' : undefined, key: 'r4' })
  }
  const final = step === 5

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage} data-final={final || undefined}>
          <Chat title={d.chat.title} sub={d.chat.sub} tone="wa" live={play.playing} className={styles.chat}>
            {msgs.map((m, i) => {
              const isEdited = i === 1 && edited
              const isDeleted = i === 2 && deleted
              return (
                <Msg key={`${i}-${isEdited}-${isDeleted}`} side="in" name={m.who} time={m.time} tone={isDeleted ? 'dim' : undefined}>
                  {isEdited ? d.edited : m.text}
                </Msg>
              )
            })}
            {edited && <Sys>{d.sys.edited}</Sys>}
            {deleted && <Sys>{d.sys.deleted}</Sys>}
          </Chat>

          <div className={styles.parser} aria-hidden="true">
            <Mono>{d.parser.title}</Mono>
            <ul className={styles.fields} data-on={step >= 1 || undefined}>
              {d.parser.fields.map((f, i) => (
                <li key={f} style={{ animationDelay: `${i * 90}ms` }}>
                  {f}
                </li>
              ))}
            </ul>
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

        <Reveal className={styles.intro}>
          <Lead item={item} />
          <Facts facts={facts} className={styles.facts} />
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
