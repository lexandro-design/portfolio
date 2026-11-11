'use client'

import { useEffect, useRef, useState } from 'react'
import { asset, srcSet } from '@/lib/asset'
import { useReduced } from '../kit'
import styles from './Extra.module.css'
import { SCREENS, START, type Screen } from './screens'

/**
 * Экраны прототипа с его картой кликов. Кадры настоящие, из макета; области клика стоят там же,
 * где в прототипе. Переход между экранами: растворение 300 мс. Оглавление регламента прокручивает
 * к главе за 600 мс. Клик мимо области подсвечивает все области, как в плеере макета
 */

type Labels = { label: string; back: string; to: string; scroll: string }

const DISSOLVE = 300
const SCROLL = 600
const BY_ID = new Map(SCREENS.map((s) => [s.id, s]))
const src = (file: string) => asset(`/cases/relay-desk/${file}.webp`)
const set = (file: string) => srcSet(`/cases/relay-desk/${file}.webp`, 1440)

/** Кадры экрана должны быть готовы до перехода, иначе растворяться не во что. Ждём недолго */
function preload(screen: Screen) {
  const all = screen.parts.slice(0, 1).map(
    ([file]) =>
      new Promise<void>((done) => {
        const img = new Image()
        img.onload = img.onerror = () => done()
        const s = set(file)
        if (s) img.srcset = s
        img.src = src(file)
      }),
  )
  return Promise.race([Promise.all(all), new Promise((done) => window.setTimeout(done, 1500))])
}

function Layer({ screen, entering, flash, labels, go }: { screen: Screen; entering: boolean; flash: boolean; labels: Labels; go: (to: string, el: HTMLElement) => void }) {
  return (
    <div className={styles.layer} data-enter={entering || undefined} data-flash={flash || undefined}>
      <div className={styles.sheet} style={{ aspectRatio: `1440 / ${screen.h}` }}>
        {screen.parts.map(([file, top, height], i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={file}
            src={src(file)}
            srcSet={set(file)}
            alt={i === 0 ? `RELAY/DESK, ${screen.name}` : ''}
            width={1440}
            height={height}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            style={{ top: `${(top / screen.h) * 100}%` }}
          />
        ))}
        {screen.hot.map((a) => {
          const scroll = a.to.startsWith('y')
          const name = scroll ? labels.scroll : `${labels.to}: ${BY_ID.get(a.to)?.name ?? a.to}`
          return (
            <button
              key={`${a.x}-${a.y}-${a.to}`}
              type="button"
              className={styles.hot}
              aria-label={name}
              title={name}
              style={{
                left: `${(a.x / 1440) * 100}%`,
                top: `${(a.y / screen.h) * 100}%`,
                width: `${(a.w / 1440) * 100}%`,
                height: `${(a.h / screen.h) * 100}%`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                go(a.to, e.currentTarget)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export function Flow({ labels }: { labels: Labels }) {
  const still = useReduced()
  const [cur, setCur] = useState(START)
  const [prev, setPrev] = useState<string | null>(null)
  const [trail, setTrail] = useState<string[]>([])
  const [flash, setFlash] = useState(false)
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const open = async (id: string, back = false) => {
    const next = BY_ID.get(id)
    if (!next || id === cur || busy.current) return
    busy.current = true
    await preload(next)
    setTrail((t) => (back ? t.slice(0, -1) : [...t, cur]))
    setPrev(still ? null : cur)
    setCur(id)
    later(
      () => {
        setPrev(null)
        busy.current = false
      },
      still ? 0 : DISSOLVE,
    )
  }

  /** Прокрутка внутри экрана к якорю: 600 мс, плавный разгон и остановка */
  const scrollTo = (y: number, el: HTMLElement) => {
    const layer = el.closest<HTMLElement>(`.${styles.layer}`)
    const sheet = el.parentElement
    if (!layer || !sheet) return
    const from = layer.scrollTop
    const to = Math.min((y / 1440) * sheet.clientWidth, layer.scrollHeight - layer.clientHeight)
    if (still) {
      layer.scrollTop = to
      return
    }
    const t0 = performance.now()
    const frame = () => {
      const p = Math.min(1, (performance.now() - t0) / SCROLL)
      const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2
      layer.scrollTop = from + (to - from) * e
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  const go = (to: string, el: HTMLElement) => {
    if (to.startsWith('y')) scrollTo(Number(to.slice(1)), el)
    else void open(to)
  }

  const hint = () => {
    if (flash) return
    setFlash(true)
    later(() => setFlash(false), 480)
  }

  return (
    <div className={styles.flow}>
      <div className={styles.tabs} role="group" aria-label={labels.label}>
        <button type="button" className={styles.back} disabled={!trail.length} onClick={() => void open(trail[trail.length - 1], true)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M14 8H2M7 3 2 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          {labels.back}
        </button>
        {SCREENS.map((s) => (
          <button key={s.id} type="button" className={styles.tab} aria-pressed={s.id === cur} onClick={() => void open(s.id)}>
            {s.name}
          </button>
        ))}
      </div>
      {/* Клик мимо области подсвечивает области: подсказка мышью, с клавиатуры области и так в порядке обхода */}
      <div className={styles.stage} onClick={hint}>
        {[prev, cur].map((id) => {
          const screen = id ? BY_ID.get(id) : null
          return screen ? <Layer key={screen.id} screen={screen} entering={id === cur && prev !== null} flash={flash && id === cur} labels={labels} go={go} /> : null
        })}
      </div>
    </div>
  )
}
