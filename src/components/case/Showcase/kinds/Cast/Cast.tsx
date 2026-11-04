'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Cast as Data, CastBeat, CastMsg } from '@/content/casts'
import { useInView, useReduced } from '../../hooks'
import kit from '../kit.module.css'
import styles from './Cast.module.css'

type Labels = { inside: string; play: string; pause: string; prev: string; next: string; step: string }

/** Сколько держится шаг: длинную реплику надо успеть прочитать */
const span = (b: CastBeat) => b.ms ?? Math.min(4600, Math.max(1700, 1100 + b.cap.length * 34))

const clock = (ms: number) => {
  const s = Math.round(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Шаги до текущего включительно: нажатие отмечается на сообщении, к которому относится */
function feed(beats: CastBeat[], at: number) {
  const list: { msg: CastMsg; pressed?: number; key: number }[] = []
  beats.slice(0, at + 1).forEach(({ msg }, i) => {
    if (!msg) return
    if (msg.k === 'tap') {
      const last = [...list].reverse().find((m) => 'btns' in m.msg && m.msg.btns)
      if (last) last.pressed = msg.btn
      return
    }
    list.push({ msg, key: i })
  })
  return list
}

function Item({ m, pressed, fresh }: { m: CastMsg; pressed?: number; fresh: boolean }) {
  const btns = 'btns' in m && m.btns && (
    <span className={styles.btns}>
      {m.btns.map((b, i) => (
        <span key={b} className={styles.btn} data-press={pressed === i || undefined}>
          {b}
        </span>
      ))}
    </span>
  )
  switch (m.k) {
    case 'in':
      return (
        <li className={styles.in}>
          <p>{m.text}</p>
          {btns}
        </li>
      )
    case 'out':
      return (
        <li className={styles.out}>
          <p>{m.text}</p>
        </li>
      )
    case 'voice':
      return (
        <li className={styles.out}>
          <span className={styles.wave} aria-hidden="true">
            {Array.from({ length: 22 }, (_, i) => (
              <i key={i} style={{ blockSize: `${28 + Math.abs(Math.sin(i * 1.7)) * 72}%` }} />
            ))}
          </span>
          <p>{m.text}</p>
        </li>
      )
    case 'shot':
      return (
        <li className={styles.in}>
          <span className={styles.shot}>
            <span>{m.label}</span>
          </span>
          {btns}
        </li>
      )
    case 'photos':
      return (
        <li className={styles.out}>
          <span className={styles.photos} aria-hidden="true">
            {Array.from({ length: m.n }, (_, i) => (
              <i key={i} style={{ animationDelay: `${i * 70}ms` }} />
            ))}
          </span>
          <p>{m.label}</p>
        </li>
      )
    case 'bar':
      return (
        <li className={styles.in}>
          <p>{m.label}</p>
          <span className={styles.bar} data-run={fresh || undefined} />
        </li>
      )
    case 'line':
      return (
        <li className={styles.line} data-tone={m.tone}>
          {m.text}
        </li>
      )
    default:
      return null
  }
}

/**
 * Управляемая запись экрана: шаги идут сами, пока блок на экране, у каждого
 * свой отрезок на шкале. Нажатие на шкалу или стрелки ставит на паузу, чтобы
 * спокойно прочитать. Курсор доезжает до кнопки перед нажатием. Без движения
 * сразу последний шаг, шкала работает
 */
export function Cast({ cast, t }: { cast: Data; t: Labels }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const still = useReduced()
  const { beats } = cast
  const last = beats.length - 1
  const [at, setAt] = useState(0)
  const [paused, setPaused] = useState(false)
  const screen = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLSpanElement>(null)

  const stopped = paused || still
  const shown = still && !paused ? last : at

  useEffect(() => {
    if (!inView || stopped) return
    const id = window.setTimeout(() => setAt((i) => (i >= last ? 0 : i + 1)), span(beats[at]) + (at === last ? 3200 : 0))
    return () => window.clearTimeout(id)
  }, [at, inView, stopped, beats, last])

  const list = useMemo(() => feed(beats, shown), [beats, shown])
  const logs = useMemo(() => beats.slice(0, shown + 1).flatMap((b, i) => (b.log ? [{ i, text: b.log }] : [])), [beats, shown])
  const big = useMemo(() => beats.slice(0, shown + 1).reverse().find((b) => b.big)?.big, [beats, shown])
  const rows = useMemo(() => {
    const out = (cast.rows ?? []).map((r) => ({ ...r }))
    beats.slice(0, shown + 1).forEach(({ set }) => {
      if (!set || !out[set.row]) return
      out[set.row].state = set.state
      if (set.note) out[set.row].note = set.note
    })
    return out
  }, [beats, cast.rows, shown])
  const hot = beats[shown].set?.row

  useLayoutEffect(() => {
    const box = screen.current
    const dot = cursor.current
    if (!box || !dot) return
    const tapped = beats[shown].msg?.k === 'tap' || beats[shown].set
    const el = tapped ? [...box.querySelectorAll<HTMLElement>('[data-press], [data-hot]')].pop() : null
    dot.dataset.on = el ? 'true' : 'false'
    if (!el) return
    const a = box.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    dot.style.transform = `translate(${b.left - a.left + b.width * 0.7}px, ${b.top - a.top + b.height * 0.6}px)`
  }, [shown, beats])

  const go = (i: number) => {
    setPaused(true)
    setAt(Math.max(0, Math.min(last, i)))
  }
  const toggle = () => {
    if (paused && at === last) setAt(0)
    setPaused(!paused)
  }
  const total = beats.reduce((s, b) => s + span(b), 0)
  const passed = beats.slice(0, shown).reduce((s, b) => s + span(b), 0)

  return (
    <div ref={ref} className={styles.root} data-screen={cast.screen}>
      <div className={styles.stage}>
        <div className={kit.win}>
          <div className={styles.top}>
            <span className={styles.ava} aria-hidden="true">
              {cast.app.slice(0, 1)}
            </span>
            <span className={styles.who}>
              {cast.app}
              <small>{cast.sub}</small>
            </span>
            <span className={styles.rec} data-on={(inView && !stopped) || undefined}>
              {clock(passed)}
            </span>
          </div>
          <div ref={screen} className={styles.screen}>
            {cast.screen === 'rows' && (
              <ul className={styles.rows}>
                {rows.map((r, i) => (
                  <li key={r.name} className={styles.row} data-state={r.state} data-hot={hot === i || undefined}>
                    <span className={styles.rowName}>{r.name}</span>
                    <span className={styles.rowNote}>{r.note}</span>
                    <span className={styles.rowState} aria-hidden="true" />
                  </li>
                ))}
              </ul>
            )}
            {list.length > 0 && (
              <ol className={styles.feed}>
                {list.map(({ msg, pressed, key }) => (
                  <Item key={key} m={msg} pressed={pressed} fresh={key === shown} />
                ))}
              </ol>
            )}
            <span ref={cursor} className={styles.cursor} data-on="false" aria-hidden="true" />
          </div>
        </div>
        <div className={styles.side}>
          <span className={kit.mono}>{t.inside}</span>
          <ol className={styles.log}>
            {logs.slice(-5).map((l) => (
              <li key={l.i} data-now={l.i === shown || undefined}>
                {l.text}
              </li>
            ))}
          </ol>
          {big && (
            <p key={big.v} className={styles.big}>
              <b>{big.v}</b> {big.l}
            </p>
          )}
        </div>
      </div>
      <p className={styles.cap}>{beats[shown].cap}</p>
      <div className={styles.controls}>
        <button type="button" className={styles.ctl} onClick={() => go(shown - 1)} aria-label={t.prev} disabled={shown === 0}>
          ←
        </button>
        <button type="button" className={styles.ctl} onClick={toggle} aria-label={stopped ? t.play : t.pause} data-wide>
          {stopped ? '▶' : '❙❙'}
        </button>
        <button type="button" className={styles.ctl} onClick={() => go(shown + 1)} aria-label={t.next} disabled={shown === last}>
          →
        </button>
        <ol className={styles.track}>
          {beats.map((b, i) => (
            <li key={i} style={{ flexGrow: span(b) }}>
              <button
                type="button"
                aria-label={`${t.step} ${i + 1}`}
                aria-current={i === shown || undefined}
                data-done={i < shown || undefined}
                onClick={() => go(i)}
              >
                <i
                  key={i === shown ? `${at}-${stopped}` : undefined}
                  data-run={(i === shown && inView && !stopped) || undefined}
                  style={{ animationDuration: `${span(b)}ms` }}
                />
              </button>
            </li>
          ))}
        </ol>
        <span className={styles.time}>
          {clock(passed)} / {clock(total)}
        </span>
      </div>
    </div>
  )
}
