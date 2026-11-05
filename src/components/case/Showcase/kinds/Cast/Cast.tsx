'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Cast as Data, CastBeat, CastMsg } from '@/content/casts'
import { useInView, useReduced } from '../../hooks'
import kit from '../kit.module.css'
import styles from './Cast.module.css'
import { Frame } from './Frame'
import { View } from './Views'

type Labels = { inside: string; demo: string; play: string; pause: string; prev: string; next: string; step: string }

/** Сколько держится шаг: длинную реплику надо успеть прочитать */
const span = (b: CastBeat) => b.ms ?? Math.min(4600, Math.max(1700, 1100 + b.cap.length * 34))

const clock = (ms: number) => {
  const s = Math.round(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Шаги до текущего включительно: нажатие отмечается на сообщении, к которому относится */
function feed(beats: CastBeat[], at: number) {
  const list: { msg: CastMsg; pressed?: number; slide?: number; key: number }[] = []
  beats.slice(0, at + 1).forEach(({ msg }, i) => {
    if (!msg) return
    if (msg.k === 'tap') {
      const last = [...list].reverse().find((m) => 'btns' in m.msg && m.msg.btns)
      if (last) last.pressed = msg.btn
      return
    }
    if (msg.k === 'swipe') {
      const last = [...list].reverse().find((m) => m.msg.k === 'shot' && m.msg.slides)
      if (last) last.slide = msg.to
      return
    }
    list.push({ msg, key: i })
  })
  return list
}

function Item({ m, pressed, slide = 0, turning, fresh }: { m: CastMsg; pressed?: number; slide?: number; turning?: boolean; fresh: boolean }) {
  const btns = 'btns' in m && m.btns && (
    <span className={styles.btns} data-stack={('stack' in m && m.stack) || undefined}>
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
          {m.slides ? (
            <Frame key={slide} media={m.slides[slide]} alt={m.label} />
          ) : m.media ? (
            <Frame media={m.media} alt={m.label} />
          ) : (
            <span className={styles.shot}>
              <span>{m.label}</span>
            </span>
          )}
          {m.text && <p>{m.text}</p>}
          {m.slides && (
            <span className={styles.btns} aria-hidden="true">
              <span className={styles.btn}>⏪</span>
              <span className={styles.btn}>
                {slide + 1}/{m.slides.length}
              </span>
              <span className={styles.btn} data-press={turning || undefined}>
                ⏩
              </span>
            </span>
          )}
          {btns}
        </li>
      )
    case 'photos':
      return (
        <li className={styles.out}>
          {m.media ? (
            <span className={styles.frames} data-n={m.media.length}>
              {m.media.map((f) => (
                <Frame key={f.src} media={f} alt={m.label} />
              ))}
            </span>
          ) : (
            <span className={styles.photos} aria-hidden="true">
              {Array.from({ length: m.n }, (_, i) => (
                <i key={i} style={{ animationDelay: `${i * 70}ms` }} />
              ))}
            </span>
          )}
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
    case 'diff':
      return (
        <li className={styles.in}>
          <p className={styles.was}>{m.was}</p>
          <p>{m.now}</p>
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
  const inSide = Boolean(cast.view) && cast.screen !== 'view'
  // Боковая панель на шаге n: последние строки журнала и крупное число
  const sideAt = (n: number) => ({
    logs: beats
      .slice(0, n + 1)
      .flatMap((b, i) => (b.log ? [{ i, text: b.log }] : []))
      .slice(inSide ? -2 : -5),
    big: beats
      .slice(0, n + 1)
      .reverse()
      .find((b) => b.big)?.big,
  })
  const side = sideAt(shown)
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
  const viewAt = (n: number) => {
    if (!cast.view) return null
    const out = cast.view.rows.map((r) => ({ ...r }))
    beats.slice(0, n + 1).forEach(({ v }) => v?.forEach(({ r, ...patch }) => Object.assign(out[r], patch)))
    return { ...cast.view, rows: out }
  }
  const view = viewAt(shown)
  const talk = cast.screen === 'voice' ? list.slice(-2) : list
  const lastSlides = [...list].reverse().find((m) => m.msg.k === 'shot' && m.msg.slides)?.key

  useLayoutEffect(() => {
    const box = screen.current
    const dot = cursor.current
    if (!box || !dot) return
    const kind = beats[shown].msg?.k
    const tapped = kind === 'tap' || kind === 'swipe' || beats[shown].set
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
    <div ref={ref} className={styles.root} data-screen={cast.screen} data-tall={cast.tall || undefined}>
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
            {cast.screen === 'view' && view && <View view={view} />}
            {cast.screen === 'voice' && (
              <span className={styles.orb} aria-hidden="true">
                {Array.from({ length: 40 }, (_, i) => (
                  <i key={i} style={{ animationDelay: `${(i % 9) * -130}ms`, blockSize: `${24 + Math.abs(Math.sin(i * 0.9)) * 76}%` }} />
                ))}
              </span>
            )}
            {talk.length > 0 && (
              <ol className={styles.feed}>
                {talk.map(({ msg, pressed, slide, key }) => (
                  <Item
                    key={key}
                    m={msg}
                    pressed={pressed}
                    slide={slide}
                    turning={beats[shown].msg?.k === 'swipe' && slide !== undefined && key === lastSlides}
                    fresh={key === shown}
                  />
                ))}
              </ol>
            )}
            {cast.screen === 'term' && (
              // Невидимая полная лента задаёт высоту окна на телефоне: окно сразу по содержимому и не растёт по шагам
              <ol className={styles.ghost} aria-hidden="true">
                {beats.map(({ msg }, i) => msg && <Item key={i} m={msg} fresh={false} />)}
              </ol>
            )}
            <span ref={cursor} className={styles.cursor} data-on="false" aria-hidden="true" />
          </div>
        </div>
        <div className={styles.side}>
          <span className={kit.mono}>{(cast.screen !== 'view' && view?.title) || t.inside}</span>
          {/* Журнал и число лежат стопкой по всем шагам в одной ячейке: панель держит высоту самого полного шага и не двигает страницу */}
          <div className={styles.dyn}>
            <div className={styles.layer}>
              {inSide && view && <View view={view} />}
              <ol className={styles.log}>
                {side.logs.map((l) => (
                  <li key={l.i} data-now={l.i === shown || undefined}>
                    {l.text}
                  </li>
                ))}
              </ol>
              {side.big && (
                <p key={side.big.v} className={styles.big} data-long={side.big.v.length > 8 || undefined}>
                  <b>{side.big.v}</b> {side.big.l}
                </p>
              )}
            </div>
            {beats.map((_, n) => {
              const g = sideAt(n)
              const gv = inSide ? viewAt(n) : null
              return (
                <div key={n} className={styles.layer} data-ghost aria-hidden="true">
                  {gv && <View view={gv} />}
                  <ol className={styles.log}>
                    {g.logs.map((l) => (
                      <li key={l.i}>{l.text}</li>
                    ))}
                  </ol>
                  {g.big && (
                    <p className={styles.big} data-long={g.big.v.length > 8 || undefined}>
                      <b>{g.big.v}</b> {g.big.l}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* Подписи стопкой в одной ячейке: подпись в три строки не двигает шкалу и текст ниже */}
      <div className={styles.cap}>
        {beats.map((b, i) => (
          <p key={i} data-on={i === shown || undefined} aria-hidden={i !== shown}>
            {b.cap}
          </p>
        ))}
      </div>
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
      <p className={styles.demo}>{t.demo}</p>
      {cast.note && <p className={styles.demo}>{cast.note}</p>}
    </div>
  )
}
