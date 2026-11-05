'use client'

import type { CSSProperties } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Controls, Facts, Lead, Meta, Note, Reveal, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Data = {
  cols: { t: string; s: string }[]
  total: string
  files: { name: string; chunks: number; chunksNew?: number }[]
  tags: { skip: string; same: string; changed: string; new: string }
  wait: string
  chunksLabel: string
  steps: { cap: string }[]
}

/** Шаги: файл идёт по дорожке, потом ночная сверка по md5 и перезаливка изменённого */
const SPANS = [2800, 2200, 3600, 2400, 3000, 4000, 3800]

/** До какой стадии дошёл файл на каждом шаге (-1 нет в папке, 0 папка ... 4 в базе) */
const STAGE: number[][] = [
  [0, 1, 2, 3, 4, 4, 4], // договор.docx
  [0, 1, 2, 3, 4, 4, 4], // прайс.pdf
  [0, 0, 0, 0, 0, 0, 0], // схема.png: формат не берётся
  [0, 1, 2, 3, 4, 4, 4], // заметки.txt
  [-1, -1, -1, -1, -1, 4, 4], // регламент.docx: новый файл
]

const SKIPPED = 2
const NEW_FILE = 4
const CHANGED = 1

/** Какой файл в работе на ночных шагах 5 и 6 */
const WORKING: Record<number, number> = { 5: NEW_FILE, 6: CHANGED }

/**
 * Папка на Диске превращается в базу знаний. Пять колонок-стадий: папка,
 * текст, куски, векторы, база. Файлы идут по строкам-дорожкам, куски
 * отщепляются от файла и ложатся в базу, счётчик растёт. Новый файл
 * проходит дорожку сам, у изменённого куски заменяются
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS)
  const { step } = play

  const stageOf = (i: number) => STAGE[i][step]
  const worked = WORKING[step]
  const isNow = (i: number, c: number) => {
    if (i === SKIPPED) return false
    if (worked !== undefined) return i === worked
    return stageOf(i) === c
  }
  const count = (i: number) => (step >= 6 && d.files[i].chunksNew ? d.files[i].chunksNew! : d.files[i].chunks)
  const total = d.files.reduce((s, _f, i) => (stageOf(i) >= 4 ? s + count(i) : s), 0)

  const tagOf = (i: number): string | null => {
    if (i === SKIPPED) return d.tags.skip
    if (step === 5) return i === NEW_FILE ? d.tags.new : d.tags.same
    if (step === 6) return i === CHANGED ? d.tags.changed : i === NEW_FILE ? null : d.tags.same
    return null
  }

  const cell = (i: number, c: number) => {
    const f = d.files[i]
    const n = count(i)
    const fresh = i === NEW_FILE && step >= 5
    const delay = fresh ? c * 220 : i * 140
    const ver = i === CHANGED && step >= 6 ? 'b' : 'a'
    const tiles = (kind: 'raw' | 'vec' | 'db') =>
      Array.from({ length: n }, (_, k) => <i key={k} data-kind={kind} style={{ '--k': k } as CSSProperties} />)
    let body = null
    if (c === 0) {
      const dot = f.name.lastIndexOf('.')
      const tag = tagOf(i)
      body = (
        <>
          <span className={styles.name}>
            {f.name.slice(0, dot)}
            <b>{f.name.slice(dot)}</b>
          </span>
          {tag && (
            <span className={styles.tag} data-tone={i === SKIPPED ? 'skip' : step === 5 && i !== NEW_FILE ? 'same' : 'hot'}>
              {tag}
            </span>
          )}
        </>
      )
    } else if (c === 1) {
      body = (
        <span className={styles.lines}>
          <i />
          <i />
          <i />
          <i />
        </span>
      )
    } else if (c === 2) {
      body = <span className={styles.tiles}>{tiles('raw')}</span>
    } else if (c === 3) {
      body = <span className={styles.tiles}>{tiles('vec')}</span>
    } else {
      body = (
        <>
          <span className={styles.tiles}>{tiles('db')}</span>
          <span className={styles.num} aria-label={`${n} ${d.chunksLabel}`}>
            {i === CHANGED && step >= 6 ? `${f.chunks}→${n}` : n}
          </span>
        </>
      )
    }
    return (
      <li
        key={`${f.name}-${c}-${c > 1 ? ver : ''}`}
        className={styles.cell}
        data-now={isNow(i, c) || undefined}
        data-next={(c < 4 && stageOf(i) > c && i !== SKIPPED) || undefined}
        data-name={c > 0 ? f.name : undefined}
        style={{ '--d': `${delay}ms` } as CSSProperties}
      >
        {body}
      </li>
    )
  }

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.board} aria-hidden="true">
          {d.cols.map((col, c) => {
            const lit = d.files.some((_f, i) => stageOf(i) >= 0 && isNow(i, c))
            return (
              <section key={col.t} className={styles.col} data-lit={lit || undefined}>
                <header className={styles.head}>
                  <span className={styles.ttl}>
                    <i className={styles.dot} />
                    {col.t}
                  </span>
                  <span className={styles.sub}>{col.s}</span>
                </header>
                <ol className={styles.cells}>
                  {d.files.map((f, i) =>
                    stageOf(i) >= c && !(i === SKIPPED && c > 0) ? (
                      cell(i, c)
                    ) : (
                      <li key={`${f.name}-${c}-e`} className={styles.cell} data-empty>
                        {c === 0 && i !== NEW_FILE ? d.wait : null}
                      </li>
                    ),
                  )}
                </ol>
              </section>
            )
          })}
        </div>

        <div className={styles.total}>
          <span>{d.total}</span>
          <b key={total}>{total}</b>
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
