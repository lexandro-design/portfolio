'use client'

import { useEffect, useRef, useState } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Controls, Facts, Lead, Meta, Mono, Note, Progress, Reveal, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Kind = 'customer' | 'supplier' | 'spam'
type Part = { k: 'tag' | 'text' | 'cut'; v: string }
type Letter = { subject: string; preview: string; type: Kind; parts: Part[] }
type Data = {
  inbox: { title: string; sub: string; badge: string }
  board: { title: string; cols: string[]; type: string; none: string; done: string; empty: string }
  panel: { title: string; subject: string; idle: string; chain: string[]; answer: string; final: string[] }
  types: Record<Kind, string>
  steps: { cap: string; log: string }[]
  letters: Letter[]
}

/** Шаги: четыре разбора по одному письму (письма приходят в первом), итог */
const SPANS = [4000, 3400, 3400, 3000, 3600]
/** Через сколько после начала разбора ответ модели доходит до сделки, мс */
const SETTLE = 1500

/**
 * Почта сама раскладывается в CRM. Сцена: сверху лента входящих писем, под ней
 * слева открытое письмо (HTML и цитата срезаются, модель отвечает одним словом),
 * справа доска сделок Bitrix24. Карточки получают тип и отметку, спам
 * переезжает в стадию отказа
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS, { hold: 1800 })
  const { step } = play

  // Ответ модели доходит до сделки не сразу: карточка меняется после разбора письма
  const [settled, setSettled] = useState(-1)
  useEffect(() => {
    const id = window.setTimeout(() => setSettled(step), SETTLE)
    return () => window.clearTimeout(id)
  }, [step])
  const late = settled === step

  // На узком экране лента листается: активное письмо подкатываем в поле зрения
  const ribbon = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const el = ribbon.current
    const tile = el?.children[Math.min(step, 3)] as HTMLElement | undefined
    if (!el || !tile || el.scrollWidth <= el.clientWidth) return
    el.scrollTo({ left: tile.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  }, [step])

  const active = step <= 3 ? step : -1
  const final = step === 4
  // Письмо i разобрано, когда прошёл его шаг (или ответ уже дошёл до сделки)
  const known = (i: number) => step > i || (step === i && late)
  const cards = d.letters.map((l, i) => ({ ...l, i, typed: known(i), out: known(i) && l.type === 'spam' }))
  const open = active >= 0 ? d.letters[active] : null

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.table}>
        <div className={styles.stage} data-final={final || undefined}>
          {/* Лента входящих: письма приходят по одному */}
          <section className={styles.inbox} aria-label={d.inbox.title}>
            <div className={styles.bar}>
              <Mono>{d.inbox.title}</Mono>
              <span className={styles.sub}>{d.inbox.sub}</span>
            </div>
            <ol ref={ribbon} className={styles.ribbon}>
              {d.letters.map((l, i) => (
                <li
                  key={l.subject}
                  className={styles.mail}
                  data-active={active === i || undefined}
                  data-done={known(i) || undefined}
                  data-kind={known(i) ? l.type : undefined}
                  style={{ animationDelay: `${i * 160}ms` }}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <strong>{l.subject}</strong>
                  <span className={styles.preview}>{l.preview}</span>
                  <em className={styles.tag} data-kind={l.type}>
                    {d.types[l.type]}
                  </em>
                </li>
              ))}
            </ol>
          </section>

          {/* Открытое письмо и три шага разбора */}
          <section className={styles.panel} aria-label={d.panel.title}>
            <div className={styles.bar}>
              <Mono>{d.panel.title}</Mono>
              {open && <span className={styles.sub}>{d.inbox.badge}</span>}
            </div>
            {open ? (
              <div key={step} className={styles.letter}>
                <p className={styles.subject}>
                  <span>{d.panel.subject}</span>
                  {open.subject}
                </p>
                <p className={styles.body}>
                  {open.parts.map((p, i) => (
                    <span key={i} className={styles.part} data-k={p.k}>
                      {p.v}
                    </span>
                  ))}
                </p>
                <ol className={styles.chain} aria-hidden="true">
                  {d.panel.chain.map((c, i) => (
                    <li key={c} style={{ animationDelay: `${300 + i * 450}ms` }}>
                      {c}
                    </li>
                  ))}
                </ol>
                <span className={styles.wait} data-off={late || undefined}>
                  <Progress run={SETTLE - 200} label={d.panel.chain[2]} />
                </span>
                <p className={styles.answer} data-kind={open.type}>
                  <span>{d.panel.answer}</span>
                  <b>{d.types[open.type].toUpperCase()}</b>
                </p>
                <p className={styles.log}>{d.steps[step].log}</p>
              </div>
            ) : final ? (
              <ul key="final" className={styles.final}>
                {d.panel.final.map((f, i) => (
                  <li key={f} style={{ animationDelay: `${i * 160}ms` }}>
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p key="idle" className={styles.idle}>
                <i aria-hidden="true" />
                {d.panel.idle}
              </p>
            )}
          </section>

          {/* Доска сделок: колонки-стадии, карточки переезжают */}
          <section className={styles.board} aria-label={d.board.title}>
            <div className={styles.bar}>
              <Mono>{d.board.title}</Mono>
            </div>
            <div className={styles.cols}>
              {d.board.cols.map((col, ci) => {
                const list = cards.filter((c) => (ci === 1 ? c.out : !c.out))
                return (
                  <div key={col} className={styles.col} data-out={ci === 1 || undefined}>
                    <h3>
                      {col}
                      <span>{step === 0 && ci === 0 ? '' : list.length}</span>
                    </h3>
                    <ul>
                      {list.map((c) => (
                        <li
                          key={`${c.i}-${c.out}`}
                          className={styles.card}
                          data-hot={active === c.i || undefined}
                          data-kind={c.typed ? c.type : undefined}
                          style={{ animationDelay: c.out ? '0ms' : `${c.i * 160 + 200}ms` }}
                        >
                          <b>{c.subject}</b>
                          <span className={styles.field}>
                            {d.board.type}
                            <i data-kind={c.typed ? c.type : undefined}>{c.typed ? d.types[c.type] : d.board.none}</i>
                          </span>
                          {c.typed && c.type !== 'spam' && <span className={styles.flag}>{d.board.done}</span>}
                        </li>
                      ))}
                      {list.length === 0 && <li className={styles.void}>{d.board.empty}</li>}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
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
