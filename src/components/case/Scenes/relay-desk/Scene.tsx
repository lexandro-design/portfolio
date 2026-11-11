'use client'

import '@fontsource-variable/geist-mono'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import type { SceneProps } from '../types'
import { Back, Brief, Facts, Lead, Meta, Note, Reveal, Title, useInView, useReduced } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'
import { cellsOf, paint, taskAt, R_SLIM, R_WIDE, TICK } from './grain'
import { THEMES, type ThemeId } from './tokens'
import copy from './copy.json'

type Lang = 'en' | 'ru'
type Copy = {
  shift: string
  nav: string[]
  signIn: string
  request: string
  label: string
  lead: string
  open: string
  manual: string
  facts: string[][]
  caption: string
  now: string
  levels: string[]
  line1: string
  line2: string
  hint: string
  theme: string
}
type Data = {
  note: string
  lang: Lang
  labels: { screen: string; theme: string; lang: string; replay: string }
}

/** Строки самого макета на двух его языках, из коллекции Copy. От языка страницы не зависят */
const COPY: Record<Lang, Copy> = copy

/** Часы смены у пяти уровней, как на макете */
const TIMES = ['00:00', '01:00', '03:00', '05:00', '07:00']
/** Метка NOW встаёт на первый уровень, когда стопка собрана, и идёт вниз по уровню за шаг */
const NOW_AT = 2400
const NOW_STEP = 1600
/** Заголовок набирается по буквам после сборки стопки; при смене языка сразу */
const HEAD_AT = 1100
const SAVE = 'relay-desk'

/** Выбор темы и языка переживает перезагрузку, как описано в передаче макета. Если хранилище закрыто, держится до ухода со страницы */
let memory: string | null = null
const listen = (cb: () => void) => {
  window.addEventListener(SAVE, cb)
  return () => window.removeEventListener(SAVE, cb)
}
const readChoice = () => {
  if (memory !== null) return memory
  try {
    return localStorage.getItem(SAVE) ?? ''
  } catch {
    return ''
  }
}
const writeChoice = (next: { theme: ThemeId; lang: Lang }) => {
  memory = JSON.stringify(next)
  try {
    localStorage.setItem(SAVE, memory)
  } catch {}
  window.dispatchEvent(new Event(SAVE))
}

/** Сетка точек на верхнем уровне: 11 × 11 в плоскости изометрии */
const RASTER = Array.from({ length: 121 }, (_, n) => {
  const i = (n % 11) + 1
  const j = Math.floor(n / 11) + 1
  return [336 + (i - j) * 16, 8 + (i + j) * 8] as const
})

function Arrow() {
  return (
    <svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

/** Строка заголовка по буквам: слова не рвутся, у каждой буквы своя задержка */
function Letters({ text, from }: { text: string; from: number }) {
  const words = text.split(' ')
  const starts = words.map((_, i) => from + words.slice(0, i).reduce((n, w) => n + w.length + 1, 0))
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className={styles.word}>
          {[...w].map((ch, k) => (
            <span key={k} style={{ '--c': starts[i] + k } as CSSProperties}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </>
  )
}

/**
 * RELAY/DESK. Сцена: первый экран макета, собранный в коде. Стопка из пяти уровней смены,
 * под ней кольцо зерна на холсте, по орбите идёт метка задачи, метка NOW проходит уровни.
 * Пять тем меняют одни и те же переменные, язык EN/RU переключается одной настройкой
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, inView] = useInView<HTMLElement>('-20% 0px')
  const still = useReduced()
  const raw = useSyncExternalStore(listen, readChoice, () => '')
  const choice = useMemo(() => {
    try {
      return JSON.parse(raw || '{}') as { theme?: string; lang?: string }
    } catch {
      return {}
    }
  }, [raw])
  const theme = THEMES.find((x) => x.id === choice.theme) ?? THEMES[0]
  const lang: Lang = choice.lang === 'en' || choice.lang === 'ru' ? choice.lang : d.lang
  const [run, setRun] = useState(0)
  const [started, setStarted] = useState(false)
  const [now, setNow] = useState(0)
  const [headAt, setHeadAt] = useState(HEAD_AT)
  const [slim, setSlim] = useState(false)
  const [size, setSize] = useState(0)
  const screen = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const task = useRef<SVGRectElement>(null)
  const elapsed = useRef(0)

  const c = COPY[lang]
  const region = slim ? R_SLIM : R_WIDE
  const cells = useMemo(() => cellsOf(region, slim), [region, slim])
  const live = inView && !still

  // Размер холста и вид сцены: на узком экране остаются стопка и кольцо, без выносок
  useEffect(() => {
    const el = screen.current
    const cv = canvas.current
    if (!el || !cv) return
    const ro = new ResizeObserver(() => {
      setSlim(el.clientWidth < 700)
      const w = Math.round(cv.clientWidth * Math.min(window.devicePixelRatio || 1, 2))
      setSize(w)
    })
    ro.observe(el)
    ro.observe(cv)
    return () => ro.disconnect()
  }, [run])

  // Один такт на всё живое: кадр зерна, шаг метки по орбите, уровень метки NOW
  useEffect(() => {
    const cv = canvas.current
    if (!cv || !size) return
    cv.width = size
    cv.height = Math.round((size * region.h) / region.w)
    const frame = (ms: number, frozen: boolean) => {
      paint(cv, cells, region, theme, ms, frozen)
      const [x, y] = taskAt(ms)
      task.current?.setAttribute('transform', `translate(${x} ${y})`)
    }
    if (!live) {
      frame(elapsed.current, still)
      return
    }
    const t0 = performance.now() - elapsed.current
    frame(elapsed.current, false)
    const tick = () => {
      const ms = performance.now() - t0
      elapsed.current = ms
      frame(ms, false)
      setStarted(true)
      const level = ms < NOW_AT ? 0 : Math.floor((ms - NOW_AT) / NOW_STEP) % 5
      setNow((was) => (was === level ? was : level))
    }
    const id = window.setInterval(tick, TICK)
    return () => window.clearInterval(id)
  }, [live, still, size, region, cells, theme, run])

  const pickTheme = (id: ThemeId) => writeChoice({ theme: id, lang })
  const pickLang = (l: Lang) => {
    if (l === lang) return
    setHeadAt(0)
    writeChoice({ theme: theme.id, lang: l })
  }
  const replay = () => {
    elapsed.current = 0
    setNow(0)
    setHeadAt(HEAD_AT)
    setRun((n) => n + 1)
  }

  const vars = {
    '--rd-bg': theme.bg,
    '--rd-raised': theme.raised,
    '--rd-sunken': theme.sunken,
    '--rd-line': theme.line,
    '--rd-line-strong': theme.lineStrong,
    '--rd-text': theme.text,
    '--rd-text-2': theme.text2,
    '--rd-muted': theme.muted,
    '--rd-on-accent': theme.onAccent,
    '--rd-accent': theme.accent,
    // На бумаге мелкий акцентный текст набирается мягким акцентом: основной не проходит по контрасту
    '--rd-accent-text': theme.id === 'paper' ? theme.accentSoft : theme.accent,
    '--rd-signal': theme.signal,
    '--head-at': `${headAt}ms`,
  } as CSSProperties

  const tagW = c.now.length * 8 + 64
  const langs = (cls: string) => (
    <span className={cls} role="group" aria-label={d.labels.lang}>
      {(['en', 'ru'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={l === lang} onClick={() => pickLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </span>
  )

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />
      </div>

      <div className={styles.band}>
        <div className={styles.under}>
          <div className={styles.pick} role="group" aria-label={d.labels.theme}>
            <span>{d.labels.theme}</span>
            {THEMES.map((th) => (
              <button
                key={th.id}
                type="button"
                className={styles.chip}
                aria-pressed={th.id === theme.id}
                style={{ '--sw-bg': th.bg, '--sw': th.accent } as CSSProperties}
                onClick={() => pickTheme(th.id)}
              >
                <i />
                {th.name}
              </button>
            ))}
          </div>
          <div className={styles.pick}>
            <span>{d.labels.lang}</span>
            {langs(styles.langOut)}
            <button type="button" className={styles.replay} onClick={replay}>
              {d.labels.replay}
            </button>
          </div>
        </div>
        <div
          ref={screen}
          className={styles.screen}
          style={vars}
          lang={lang}
          role="group"
          aria-label={d.labels.screen}
          data-theme={theme.id}
          data-run={started ? run : 'idle'}
          data-still={still || undefined}
          data-slim={slim || undefined}
        >
          <div className={styles.inner} key={run}>
            <div className={styles.bar}>
              <span className={styles.logo}>
                <i />
                <i />
                <span>
                  RELAY<b>/</b>DESK
                </span>
              </span>
              <span className={styles.clock}>
                <i />
                {c.shift} {TIMES[now]} / 08:00
              </span>
              <span className={styles.nav} aria-hidden="true">
                {c.nav.map((n, i) => (
                  <span key={n}>
                    <em>0{i + 1}</em>
                    {n}
                  </span>
                ))}
              </span>
              {langs(styles.lang)}
              <span className={styles.signin} aria-hidden="true">
                <b>[</b>
                {c.signIn}
                <b>]</b>
              </span>
              <span className={styles.request} aria-hidden="true">
                {c.request}
                <Arrow />
              </span>
            </div>

            <p className={`${styles.tag} ${styles.in}`} style={{ '--at': 3 } as CSSProperties}>
              <b>[</b>
              {c.label}
              <b>]</b>
            </p>
            <p className={`${styles.lead} ${styles.in}`} style={{ '--at': 4 } as CSSProperties}>
              {c.lead}
            </p>
            <div className={`${styles.actions} ${styles.in}`} style={{ '--at': 5 } as CSSProperties} aria-hidden="true">
              <span className={styles.cta}>
                {c.open}
                <Arrow />
              </span>
              <span className={styles.ghost}>
                <b>[</b>
                {c.manual}
                <b>]</b>
              </span>
            </div>
            <dl className={`${styles.facts} ${styles.in}`} style={{ '--at': 6 } as CSSProperties}>
              {c.facts.map(([value, label]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.floor}>
              <canvas ref={canvas} className={styles.grain} aria-hidden="true" />
              <svg className={styles.iso} viewBox={`${region.x} ${region.y} ${region.w} ${region.h}`} aria-hidden="true">
                <ellipse className={styles.orbit} cx="336" cy="316" rx="296" ry="148" />
                <rect ref={task} className={styles.task} x="-4" y="-4" width="8" height="8" transform="translate(336 464)" />
                {[4, 3, 2, 1, 0].map((k) => (
                  <g key={k} transform={`translate(0 ${k * 56})`}>
                    <g className={styles.level} data-on={k === now || undefined} style={{ '--n': 4 - k } as CSSProperties}>
                      <path className={styles.side} d="M144 104 336 200v8L144 112Z" />
                      <path className={styles.side} d="M336 200 528 104v8L336 208Z" />
                      <path className={styles.top} d="M336 8 528 104 336 200 144 104Z" />
                    </g>
                  </g>
                ))}
                <g className={styles.sheet}>
                  {RASTER.map(([x, y]) => (
                    <rect key={`${x}-${y}`} className={styles.dot} x={x - 1} y={y - 1} width="2" height="2" />
                  ))}
                  <path className={styles.paper} d="M352 64 416 96 320 144 256 112Z" />
                  <path className={styles.ink} d="M352 80l32 16M336 88l32 16M320 96l16 8" />
                </g>
                <g className={styles.wide}>
                  {c.levels.map((name, k) => (
                    <g key={name} className={styles.out} data-on={k === now || undefined} style={{ '--n': k } as CSSProperties}>
                      <path className={styles.leader} d={`M528 ${104 + k * 56}h88`} pathLength="1" />
                      <text className={styles.name} x="624" y={96 + k * 56}>
                        0{k + 1} {name}
                      </text>
                      <text className={styles.time} x="624" y={114 + k * 56}>
                        {TIMES[k]}
                      </text>
                    </g>
                  ))}
                  <text className={styles.caption} x="736" y="20">
                    [ {c.caption} ]
                  </text>
                  <g className={styles.now} style={{ transform: `translateY(${now * 56}px)` }} data-back={now === 0 || undefined}>
                    <path className={styles.nowLine} d={`M${16 + tagW} 104H144`} />
                    <rect className={styles.nowEdge} x="12" y="88" width={tagW + 8} height="32" />
                    <rect className={styles.nowTag} x="16" y="92" width={tagW} height="24" />
                    <text className={styles.nowText} x={16 + tagW / 2} y="104">
                      {c.now} {TIMES[now]}
                    </text>
                  </g>
                  <path className={styles.corners} d="M1 9V1h8M743 1h8v8M751 443v8h-8M9 451H1v-8" />
                </g>
              </svg>
            </div>

            <p className={styles.headline} key={`${run}-${lang}`} aria-label={`${c.line1}. ${c.line2}`}>
              <span aria-hidden="true">
                <Letters text={c.line1} from={0} />
              </span>
              <span aria-hidden="true">
                <Letters text={c.line2} from={c.line1.length} />
              </span>
            </p>

            <div className={`${styles.strip} ${styles.in}`} style={{ '--at': 12 } as CSSProperties}>
              <span>{c.hint}</span>
              <span>[ SELF-INITIATED CONCEPT ]</span>
            </div>

            <div className={styles.rail} role="group" aria-label={d.labels.theme}>
              <span>{c.theme}</span>
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  aria-label={th.name}
                  aria-pressed={th.id === theme.id}
                  style={{ '--sw-bg': th.bg, '--sw': th.accent } as CSSProperties}
                  onClick={() => pickTheme(th.id)}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="container">
        <Note className={styles.note}>{d.note}</Note>
        <Reveal className={styles.intro}>
          <Lead item={item} />
          <Facts facts={facts} className={styles.caseFacts} />
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
