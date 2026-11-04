'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { contacts } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { useInView, useReduced } from '@/components/case/Showcase/hooks'
import { BRIEF_EVENT } from '../Contact/Brief/Brief'
import { FilterLink } from '../Works'
import styles from './Services.module.css'

type Props = {
  t: Dict['build']
  services: Dict['services']
  hello: string
  need: string
  titles: Record<string, string>
  base: string
}

type Code = Dict['build']['layers'][number]['code']

/** Куда дошла бронь: 1 кнопка, 2 база, 3 уведомление, 4 ассистент */
const STEP = { back: 2, flow: 3, ai: 4 } as const
const WALK = 620
const BUILD = 420

/** Какую фразу показать под сборкой: чего в этом наборе не хватает */
function verdict(on: Set<Code>, notes: Dict['build']['notes']) {
  if (!on.size) return notes.none
  if (!on.has('web') && !on.has('ux')) return notes.noScreen
  if (!on.has('web')) return notes.mock
  if (!on.has('ux')) return notes.plain
  if (!on.has('back')) return notes.noBack
  if (!on.has('flow')) return notes.noFlow
  if (!on.has('ai')) return notes.noAi
  return notes.all
}

/**
 * Что я делаю: продукт собирается на глазах из пяти слоёв. Посетитель
 * включает слои и жмёт кнопку в примере: бронь проходит через всё, что
 * включено, а строка снизу говорит, чего в наборе не хватает. Набор уходит
 * в заявку одной кнопкой. Сборка идёт сама один раз, первое нажатие её отменяет
 */
export function Services({ t, services, hello, need, titles, base }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const still = useReduced()
  const all = t.layers.map((l) => l.code)
  const [picked, setPicked] = useState<Code[]>([])
  const [touched, setTouched] = useState(false)
  const [walked, setWalked] = useState(0)
  const timers = useRef<number[]>([])
  const played = useRef(false)

  const whole = still && !touched
  const on = new Set<Code>(whole ? all : picked)
  const step = whole ? 4 : walked

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  /* Бронь идёт только по включённым слоям */
  const walk = (layers: Set<Code>) => {
    clear()
    setWalked(1)
    const next = (['back', 'flow', 'ai'] as const).filter((c) => layers.has(c))
    next.forEach((c, i) => later(() => setWalked(STEP[c]), WALK * (i + 1)))
  }

  useEffect(() => {
    if (!inView || touched || still || played.current) return
    played.current = true
    all.forEach((_, i) => later(() => setPicked(all.slice(0, i + 1)), BUILD * (i + 1)))
    later(() => walk(new Set(all)), BUILD * (all.length + 1))
    // Сборка идёт один раз, all и walk пересоздаются на каждом рендере
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, touched, still])

  useEffect(() => clear, [])

  const toggle = (code: Code) => {
    clear()
    setTouched(true)
    setWalked(0)
    const now = [...on]
    setPicked(now.includes(code) ? now.filter((c) => c !== code) : [...now, code])
  }

  const chosen = services.filter((s) => t.layers.some((l) => on.has(l.code) && l.service === s.code))
  const list = t.layers.filter((l) => on.has(l.code)).map((l) => l.title)
  const message = [hello, list.length ? `${need}: ${list.join(', ')}` : ''].filter(Boolean).join('\n')

  const screen = on.has('web') ? (on.has('ux') ? 'site' : 'plain') : on.has('ux') ? 'mock' : 'empty'
  const d = t.demo
  const live = screen === 'site' || screen === 'plain'
  const done = live && step > 0

  return (
    <div ref={ref} className={styles.grid}>
      <div className={styles.left}>
        <p className={styles.lead}>{t.lead}</p>
        <ul className={styles.layers}>
          {t.layers.map((l) => (
            <li key={l.code} className={styles.layer} data-on={on.has(l.code) || undefined}>
              <button type="button" className={styles.toggle} aria-pressed={on.has(l.code)} onClick={() => toggle(l.code)}>
                <span className={styles.check} aria-hidden="true" />
                <span className={styles.title}>{l.title}</span>
              </button>
              <p className={styles.text}>{l.text}</p>
              <div className={styles.links}>
                {l.cases.map((slug) => (
                  <Link key={slug} href={`${base}/cases/${slug}/`}>
                    {titles[slug]}
                  </Link>
                ))}
                <FilterLink direction={l.filter} className={styles.more}>
                  {t.more}
                </FilterLink>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.side}>
        <div className={styles.stage}>
          <div className={styles.browser} data-look={screen}>
            <div className={styles.bar}>
              <i aria-hidden="true" />
              <span>{screen === 'mock' ? d.mock : live ? d.url : ''}</span>
            </div>
            {screen === 'empty' ? (
              <p className={styles.blank}>{d.empty}</p>
            ) : (
              <div className={styles.page}>
                <p className={styles.brand}>{d.brand}</p>
                <p className={styles.room}>{d.room}</p>
                <p className={styles.meta}>{d.meta}</p>
                <button
                  type="button"
                  className={styles.book}
                  disabled={!live}
                  data-done={done || undefined}
                  onClick={() => {
                    setTouched(true)
                    walk(on)
                  }}
                >
                  {done ? d.booked : d.book}
                </button>
              </div>
            )}
          </div>

          <div className={styles.parts}>
            <div className={styles.part} data-on={on.has('back') || undefined} data-hit={(on.has('back') && step >= 2) || undefined}>
              <span className={styles.name}>{d.db}</span>
              {on.has('back') && (
                <ul className={styles.table}>
                  <li>{d.dbOld}</li>
                  {live && step >= 2 && <li data-new>{d.dbNew}</li>}
                </ul>
              )}
            </div>
            <div className={styles.part} data-on={on.has('flow') || undefined} data-hit={(on.has('flow') && step >= 3) || undefined}>
              <span className={styles.name}>{d.bot}</span>
              {on.has('flow') && live && step >= 3 && <p key="bot">{d.botText}</p>}
            </div>
            <div className={styles.part} data-on={on.has('ai') || undefined} data-hit={(on.has('ai') && step >= 4) || undefined}>
              <span className={styles.name}>{d.ai}</span>
              {on.has('ai') && <p className={styles.ask}>{d.aiAsk}</p>}
              {on.has('ai') && live && step >= 4 && <p key="ai">{d.aiAnswer}</p>}
            </div>
          </div>
        </div>

        <p className={styles.verdict} aria-live="polite">
          {verdict(on, t.notes)}
        </p>

        <div className={styles.total}>
          <ul className={styles.prices}>
            {chosen.map((s) => (
              <li key={s.code}>
                <span>{s.title}</span>
                <b>{s.price}</b>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <a
              href="#brief"
              className={styles.primary}
              onClick={() => window.dispatchEvent(new CustomEvent(BRIEF_EVENT, { detail: chosen.map((s) => s.code) }))}
            >
              {t.discuss}
              <Arrow />
            </a>
            <a
              href={`${contacts.telegram}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
            >
              {t.write}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
