'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import type { SceneProps } from '../types'
import { Back, Brief, Cap, Chat, Controls, Facts, Keys, Lead, Meta, Mono, Msg, Note, Progress, Reveal, Title, usePlay } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

/** Готовый кадр есть только у шаблона из сценария: остальные на стене просто шаблоны. tall: кадр 9:16 целиком */
type Tile = { id: string; src: string; you?: string; tall?: boolean }
type Data = {
  chat: { title: string; sub: string; typing: string; menu: string; field: string }
  note: string
  wall: { title: string; note: string }
  tiles: Tile[]
  cols: string[][]
  fill: string[][]
  tag: { look: string; pick: string; gen: string; you: string }
  selfies: string[]
  start: { time: string; text: string[]; pager: string[]; keys: string[]; more: { row: string[]; keys: string[] } }
  demo: { text: string[]; pager: string[]; keys: string[] }
  upload: { text: string[]; keys: string[] }
  gen: { text: string[]; pager: string[]; eta: string }
  done: { text: string[]; keys: string[] }
  menu: { text: string; keys: string[] }
  speed: { title: string; rows: { label: string; value: string; ms: number }[] }
  steps: { cap: string; log: string }[]
}

type State = 'idle' | 'look' | 'pick' | 'gen' | 'you'

/** Шаги: старт, листание, выбор, селфи, генерация, готовый кадр, меню. Последний держится */
const SPANS = [3600, 3000, 3000, 3200, 3000, 3200]

/** Метки внутри шага, мс: «печатает» гаснет, ответ, продолжение, нажатие кнопки */
const MARKS = [400, 600, 1300, 1800]

/** Условное время сообщений: идёт вперёд по сценарию */
const CLOCK = ['12:01', '12:02', '12:03', '12:03', '12:05', '12:06']

/** Проезд ленты, как в Telegram: новое снизу, старое уезжает вверх */
const GLIDE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Какой плитке стены что происходит на каком шаге */
function stateOf(id: string, step: number): State {
  if (id === 'red') return step === 0 ? 'idle' : step === 1 ? 'look' : step === 2 ? 'pick' : step === 3 ? 'gen' : 'you'
  return 'idle'
}

/** Ширина плитки стены: четверть экрана на телефоне, восьмая на планшете, шестая на компьютере */
const WALL_SIZES = '(max-width: 599px) 25vw, (max-width: 1099px) 13vw, 18vw'

/** Кадр в чате и на стене. Пустой alt: подпись и смысл несёт текст рядом. У кадров стены два размера */
function Pic({ src, className, style, lazy }: { src: string; className?: string; style?: CSSProperties; lazy?: boolean }) {
  const set = src.endsWith('-960.webp') ? `${asset(src.replace('-960.webp', '-480.webp'))} 480w, ${asset(src)} 960w` : undefined
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img
      className={className}
      src={asset(src)}
      srcSet={set}
      sizes={set ? WALL_SIZES : undefined}
      alt=""
      width={600}
      height={800}
      style={style}
      decoding="async"
      loading={lazy ? 'lazy' : undefined}
    />
  )
}

/** Тире подставляется здесь: в json его держать нельзя (tools/check-content.mjs) */
const DASH = '—'

/** Настоящие кадры бота: обложка и логотип. Надписи уже на обложке, поверх ничего не кладём */
const COVER = '/cases/mimimibot/real/cover.webp'
const LOGO = '/cases/mimimibot/real/avatar.webp'
/** Тот же шаблон без белой рамки: квадрат в чате обрезает её, полосы по бокам смотрятся случайно */
const TEMPLATE = '/cases/mimimibot/real/tpl-red-crop.webp'

/** Логотип бота в шапке чата */
function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img className={styles.logo} src={asset(LOGO)} alt="" width={320} height={320} decoding="async" />
  )
}

/** Кнопки под сообщением бота, как у настоящего: отдельными рядами под пузырём */
function Pad({ rows }: { rows: { items: string[]; stack?: boolean; pressed?: number }[] }) {
  return (
    <li className={styles.real}>
      {rows.map((r, i) => (
        <Keys key={i} items={r.items} stack={r.stack} pressed={r.pressed} />
      ))}
    </li>
  )
}

/** Высота всей ленты без учёта идущих анимаций: offsetTop transform не считает */
function feedOf(box: HTMLElement | null) {
  const ol = box?.querySelector('ol')
  const items = ol ? ([...ol.children] as HTMLElement[]) : []
  if (!ol || !items.length) return null
  const end = items[items.length - 1]
  return { ol, items, height: end.offsetTop + end.offsetHeight - items[0].offsetTop }
}

/**
 * MiMiMi AI. Сцена: стена шаблонов, как доска, живёт вокруг и позади чата.
 * Человек листает карусель, выбирает кадр, шлёт три селфи, идёт генерация,
 * и готовый кадр с лицом встаёт на место шаблона. Стена откликается на
 * каждый шаг: подсвечивает кадр из чата, показывает ожидание и результат.
 * Лента как в настоящем Telegram: переписка копится, старое уезжает вверх
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS, { hold: 1400 })
  const { step } = play
  const byId = Object.fromEntries(d.tiles.map((x) => [x.id, x])) as Record<string, Tile>

  // Внутри шага: набор бота, ответ, продолжение, нажатие кнопки. Пауза и reduced-motion показывают итог
  const [ph, setPh] = useState({ step: -1, n: 0 })
  useEffect(() => {
    if (!play.inView || play.stopped) return
    const ids = MARKS.map((ms, i) => window.setTimeout(() => setPh({ step, n: i + 1 }), ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, play.inView, play.stopped])
  const n = play.stopped ? MARKS.length : ph.step === step ? ph.n : 0
  // Первый экран и листание не ждут: сообщение бота уже на месте, обложка и кнопки видны с первой секунды
  const quiet = step === 0
  const typing = !quiet && n < 2
  // Как в настоящем Telegram: пока бот печатает (это видно в шапке), прошлое сообщение стоит на месте, окно не пустеет
  const shown = typing ? step - 1 : step
  const past = shown < step
  const follow = past || n >= 3
  const press = past || n >= 4 ? 0 : undefined
  const said = (l: string[]) => l.map((x) => x.replace('{d}', DASH)).join('\n')
  const now = (i: number) => (shown === i ? press : undefined)

  // Лента прижата к низу: новое сообщение сдвигает старые мгновенно, проезд возвращает им плавность
  const phone = useRef<HTMLDivElement>(null)
  const was = useRef(0)
  useLayoutEffect(() => {
    const feed = feedOf(phone.current)
    if (!feed) return
    const grew = feed.height - was.current
    const first = was.current === 0
    was.current = feed.height
    if (first || grew <= 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    feed.items.forEach((el) => el.animate([{ transform: `translateY(${grew}px)` }, { transform: 'none' }], { duration: 460, easing: GLIDE }))
  }, [shown, follow])

  // Первое сообщение выше окна: сначала видна обложка, потом лента сама едет к кнопкам, как при открытии чата. На паузе стоит на обложке
  const atStart = step === 0 && (play.inView || play.stopped)
  useEffect(() => {
    if (!atStart) return
    const feed = feedOf(phone.current)
    if (!feed) return
    const over = feed.height - feed.ol.clientHeight + 24
    if (over <= 0) return
    const frames = [{ transform: `translateY(${over}px)` }, { transform: 'none' }]
    const hold = play.stopped || matchMedia('(prefers-reduced-motion: reduce)').matches
    const runs = feed.items.map((el) =>
      hold
        ? el.animate([frames[0], frames[0]], { duration: 1, fill: 'forwards' })
        : el.animate(frames, { duration: 1300, delay: 1500, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'backwards' }),
    )
    return () => runs.forEach((a) => a.cancel())
  }, [atStart, play.stopped])

  const wall: { ids: string[]; hide?: boolean }[] = [
    { ids: d.cols[0] },
    { ids: d.cols[1] },
    { ids: d.fill[0], hide: true },
    { ids: d.fill[1], hide: true },
    { ids: d.cols[2] },
    { ids: d.cols[3] },
  ]

  const cur = d.steps[step]

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />

        <div className={styles.stage} data-live={play.inView || undefined}>
          <div className={styles.wall} aria-hidden="true">
            {wall.map((col, ci) => (
              <div key={ci} className={styles.col} data-hide={col.hide || undefined} data-i={ci}>
                {col.ids.map((id, ti) => {
                  const tile = byId[id]
                  const s: State = col.hide ? 'idle' : stateOf(id, step)
                  const extra = ti > 1
                  return (
                    <div key={id} className={styles.tile} data-s={s} data-tall={tile.tall || undefined} data-extra={extra || undefined}>
                      <Pic src={tile.src} className={styles.base} lazy={extra || col.hide} />
                      {tile.you && <Pic src={tile.you} className={styles.you} />}
                      {s === 'gen' && (
                        <span className={styles.gen}>
                          <i className={styles.sweep} />
                          <b>{d.gen.eta}</b>
                          <i key={step} className={styles.fill} style={{ animationDuration: `${SPANS[4]}ms` }} />
                        </span>
                      )}
                      {s !== 'idle' && <span className={styles.tag}>{d.tag[s]}</span>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div ref={phone} className={styles.phone}>
            <Chat
              skin="tg"
              title={d.chat.title}
              sub={typing ? d.chat.typing : d.chat.sub}
              busy={typing}
              bar={{ menu: d.chat.menu, field: d.chat.field, hint: shown === 2 && !follow }}
              avatar={<Logo />}
              live={play.playing}
              className={styles.chat}
            >
              {shown >= 0 && (
                <>
                  <Msg side="in" time={d.start.time} tail={false} className={styles.first}>
                    <span className={styles.cover}>
                      <Pic src={COVER} className={styles.coverPic} />
                    </span>
                    <span className={styles.said}>{said(d.start.text)}</span>
                  </Msg>
                  <Pad rows={[{ items: d.start.pager }, { items: d.start.keys, stack: true }, { items: d.start.more.row }, { items: d.start.more.keys, stack: true }]} />
                </>
              )}
              {shown >= 1 && (
                <>
                  <Msg side="in" time={CLOCK[1]} tail={false} className={styles.first}>
                    <span className={styles.media} data-low>
                      <Pic src={TEMPLATE} className={styles.shot} />
                    </span>
                    <span className={styles.said}>{said(d.demo.text)}</span>
                  </Msg>
                  <Pad rows={[{ items: d.demo.pager }, { items: d.demo.keys, stack: true, pressed: now(1) }]} />
                </>
              )}
              {shown >= 2 && (
                <>
                  <Msg side="in" time={CLOCK[2]} tail={false} className={styles.first}>
                    <span className={styles.said}>{said(d.upload.text)}</span>
                  </Msg>
                  <Pad rows={[{ items: d.upload.keys, stack: true, pressed: now(2) }]} />
                  {(shown > 2 || follow) && (
                    <Msg side="out" time={CLOCK[2]} status={shown > 2 || press === 0 ? 'read' : 'sent'} className={styles.selfies}>
                      <span className={styles.shots}>
                        {d.selfies.map((x, i) => (
                          <Pic key={x} src={x} className={styles.selfie} style={{ animationDelay: `${i * 320}ms` }} />
                        ))}
                      </span>
                    </Msg>
                  )}
                </>
              )}
              {shown >= 3 && (
                <>
                  <Msg side="in" time={CLOCK[3]} tail={false} className={styles.first}>
                    <span className={styles.said}>{said(d.gen.text)}</span>
                    {shown === 3 && <Progress run={SPANS[3] - MARKS[1]} label={d.gen.eta} className={styles.prog} />}
                  </Msg>
                  <Pad rows={[{ items: d.gen.pager }]} />
                </>
              )}
              {shown >= 4 && (
                <>
                  <Msg side="in" tone="ok" time={CLOCK[4]} tail={false} className={styles.first}>
                    <span className={styles.media} data-glint>
                      <Pic src={byId.red.you ?? byId.red.src} className={styles.shot} />
                    </span>
                    <span className={styles.said}>{said(d.done.text)}</span>
                  </Msg>
                  <Pad rows={[{ items: d.done.keys, stack: true, pressed: now(4) }]} />
                </>
              )}
              {shown >= 5 && (
                <>
                  <Msg side="in" time={CLOCK[5]} tail={false} className={styles.first}>
                    <span className={styles.said}>{d.menu.text}</span>
                  </Msg>
                  <Pad rows={[{ items: d.menu.keys, stack: true, pressed: now(5) }]} />
                </>
              )}
            </Chat>

            <div key={step} className={styles.dock} aria-hidden="true">
              {step === 0 ? <Mono>{d.speed.title}</Mono> : (
                <ul className={styles.log}>
                  {d.steps.slice(Math.max(1, step - 2), step + 1).map((x) => (
                    <li key={x.log} data-now={x === cur || undefined}>
                      <Mono>{x.log}</Mono>
                    </li>
                  ))}
                </ul>
              )}
              {step === 0 && (
                <ul className={styles.speed}>
                  {d.speed.rows.map((r) => (
                    <li key={r.label}>
                      <span>{r.label}</span>
                      <i style={{ inlineSize: `${Math.max(3, (r.ms / 2000) * 100)}%` }} />
                      <b>{r.value}</b>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.under}>
            <Cap className={styles.cap}>{cur.cap}</Cap>
            <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
            <div className={styles.notes}>
              <Note>{t.show.cast.demo}</Note>
              <Note>{d.note}</Note>
            </div>
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
