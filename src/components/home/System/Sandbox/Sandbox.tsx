'use client'

import { useState, useSyncExternalStore, type CSSProperties } from 'react'
import { SANDBOX_ACCENTS, THEMES, type Theme } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { ThemeIcon, readTheme, subscribeTheme } from '@/components/layout/ThemeSwitch'
import styles from './Sandbox.module.css'

type Density = 'compact' | 'normal' | 'airy'
type Font = 'sans' | 'display' | 'mono'

/** Множитель шкалы отступов: весь интерфейс ужимается или дышит от одного числа */
const DENSITY: Record<Density, number> = { compact: 0.72, normal: 1, airy: 1.4 }
const FONTS: [Font, string, string][] = [
  ['sans', 'Inter', 'var(--font-sans)'],
  ['display', 'Unbounded', 'var(--font-display)'],
  ['mono', 'JetBrains Mono', 'var(--font-mono)'],
]
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00']
const BUSY = [1, 4]
const INITIAL = { radius: 12, density: 'normal' as Density, accent: 0, font: 'sans' as Font }

/** Чёрный или белый текст на акценте — по яркости цвета */
function onAccent(hex: string) {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#0a0a0a' : '#ffffff'
}

type Props = { t: Dict['system']['sandbox']; themeLabels: Dict['nav']['themes']; copied: string }

/**
 * Песочница дизайн-системы. Ручки меняют не элементы, а токены — CSS-переменные
 * на корне мини-экрана. Экран собран только из них, поэтому от одной ручки
 * перестраивается целиком. Тему экрана можно выбрать свою: те же data-theme,
 * что у сайта, только на вложенном элементе. Остальной сайт не меняется.
 */
export function Sandbox({ t, themeLabels, copied }: Props) {
  const accents = SANDBOX_ACCENTS.length ? SANDBOX_ACCENTS : ['#dddec7']
  const [radius, setRadius] = useState(INITIAL.radius)
  const [density, setDensity] = useState<Density>(INITIAL.density)
  const [accentIndex, setAccent] = useState(INITIAL.accent)
  const [font, setFont] = useState<Font>(INITIAL.font)
  const [ownTheme, setTheme] = useState<Theme | null>(null)
  const [slot, setSlot] = useState(2)
  const [equipment, setEquipment] = useState(true)
  const [booked, setBooked] = useState(false)
  const [done, setDone] = useState(false)

  // Пока тему экрана не трогали, он повторяет тему сайта
  const siteTheme = useSyncExternalStore(subscribeTheme, readTheme, () => THEMES[0])
  const theme = ownTheme ?? siteTheme
  const accent = accents[Math.min(accentIndex, accents.length - 1)]
  const space = Math.round(16 * DENSITY[density])
  const fontName = FONTS.find(([id]) => id === font)![1]

  const vars = {
    '--sb-radius': `${radius}px`,
    '--sb-space': `${space}px`,
    '--sb-accent': accent,
    '--sb-on-accent': onAccent(accent),
    '--sb-font': FONTS.find(([id]) => id === font)![2],
  } as CSSProperties

  const code = [
    `--radius: ${radius}px;`,
    `--space: ${space}px;`,
    `--accent: ${accent};`,
    `--font: ${fontName};`,
    `theme: ${theme};`,
  ].join('\n')

  const reset = () => {
    setRadius(INITIAL.radius)
    setDensity(INITIAL.density)
    setAccent(INITIAL.accent)
    setFont(INITIAL.font)
    setTheme(null)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setDone(true)
      window.setTimeout(() => setDone(false), 1400)
    } catch {
      // Без доступа к буферу просто ничего не копируем
    }
  }

  const book = () => {
    setBooked(true)
    window.setTimeout(() => setBooked(false), 1800)
  }

  return (
    <Reveal className={styles.sandbox}>
      <div className={styles.head}>
        <span className={styles.label}>05 / {t.label}</span>
        <h3 className={styles.title}>{t.title}</h3>
        <p className={styles.lead}>{t.lead}</p>
      </div>

      <div className={styles.body}>
        <div className={styles.controls}>
          <label className={styles.control}>
            <span className={styles.label}>
              {t.radius} <code className={styles.value}>{radius}px</code>
            </span>
            <input
              type="range"
              min={0}
              max={24}
              step={2}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className={styles.range}
            />
          </label>

          <div className={styles.control}>
            <span className={styles.label}>{t.density}</span>
            <div className={styles.seg} role="radiogroup" aria-label={t.density}>
              {(Object.keys(DENSITY) as Density[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={density === id}
                  onClick={() => setDensity(id)}
                >
                  {t.densities[id]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.control}>
            <span className={styles.label}>{t.accent}</span>
            <div className={styles.swatches} role="radiogroup" aria-label={t.accent}>
              {accents.map((color, i) => (
                <button
                  key={color + i}
                  type="button"
                  role="radio"
                  aria-checked={accentIndex === i}
                  aria-label={color}
                  title={color}
                  className={styles.swatch}
                  style={{ background: color }}
                  onClick={() => setAccent(i)}
                />
              ))}
            </div>
          </div>

          <div className={styles.control}>
            <span className={styles.label}>{t.font}</span>
            <div className={styles.seg} role="radiogroup" aria-label={t.font}>
              {FONTS.map(([id, name, family]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={font === id}
                  style={{ fontFamily: family }}
                  onClick={() => setFont(id)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.control}>
            <span className={styles.label}>{t.theme}</span>
            <div className={styles.seg} role="radiogroup" aria-label={t.theme}>
              {THEMES.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={theme === id}
                  aria-label={themeLabels[id]}
                  title={themeLabels[id]}
                  onClick={() => setTheme(id)}
                >
                  <ThemeIcon id={id} />
                </button>
              ))}
            </div>
          </div>

          <pre className={styles.code} aria-live="polite">
            {code}
          </pre>
          <div className={styles.buttons}>
            <button type="button" className={styles.button} onClick={copy}>
              {done ? copied : t.copy}
            </button>
            <button type="button" className={styles.button} onClick={reset}>
              {t.reset}
            </button>
          </div>
        </div>

        {/* Мини-сайт: размеры, цвет и шрифт внутри берутся только из токенов --sb-* и темы */}
        <div className={styles.stage}>
          <div className={styles.browser}>
            <div className={styles.chrome} aria-hidden="true">
              <i />
              <i />
              <i />
              <span>{t.ui.url}</span>
            </div>
            <div className={styles.site} data-theme={theme} style={vars}>
              <header className={styles.nav}>
                <span className={styles.brand}>
                  <span className={styles.mark} />
                  {t.ui.brand}
                </span>
                <nav className={styles.links}>
                  {t.ui.nav.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </nav>
                <button type="button" className={styles.primary} onClick={book}>
                  {t.ui.cta}
                </button>
              </header>

              <section className={styles.hero}>
                <span className={styles.badge}>
                  <span className={styles.live} />
                  {t.ui.badge}
                </span>
                <h4 className={styles.heroTitle}>{t.ui.title}</h4>
                <p className={styles.heroText}>{t.ui.text}</p>
                <div className={styles.search}>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <circle
                      cx="6"
                      cy="6"
                      r="4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path d="M9.5 9.5 13 13" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  <input placeholder={t.ui.search} aria-label={t.ui.search} />
                  <button type="button" className={styles.primary}>
                    {t.ui.primary}
                  </button>
                </div>
              </section>

              <section className={styles.features}>
                {t.ui.features.map((f, i) => (
                  <div key={f.title} className={styles.feature}>
                    <span className={styles.icon} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <strong>{f.title}</strong>
                    <span>{f.text}</span>
                  </div>
                ))}
              </section>

              <section className={styles.rooms}>
                <div className={styles.roomsTitle}>{t.ui.roomsTitle}</div>
                <div className={styles.roomGrid}>
                  {t.ui.rooms.map((room, r) => (
                    <div key={room.name} className={styles.card}>
                      <div className={styles.cardHead}>
                        <div>
                          <div className={styles.room}>{room.name}</div>
                          <div className={styles.meta}>{room.meta}</div>
                        </div>
                        <span className={styles.badge}>
                          <span className={styles.live} />
                          {t.ui.free}
                        </span>
                      </div>
                      <div className={styles.slots}>
                        {SLOTS.slice(r * 3, r * 3 + 3).map((time, k) => {
                          const i = r * 3 + k
                          return (
                            <button
                              key={time}
                              type="button"
                              className={styles.slot}
                              disabled={BUSY.includes(i)}
                              aria-pressed={slot === i}
                              onClick={() => setSlot(i)}
                            >
                              {time}
                            </button>
                          )
                        })}
                      </div>
                      {r === 0 && (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={equipment}
                          className={styles.toggle}
                          onClick={() => setEquipment((v) => !v)}
                        >
                          <span className={styles.knob} />
                          {t.ui.equipment}
                        </button>
                      )}
                      <button
                        type="button"
                        className={r === 0 ? styles.primary : styles.secondary}
                        onClick={book}
                      >
                        {booked && Math.floor(slot / 3) === r
                          ? t.ui.booked
                          : Math.floor(slot / 3) === r
                            ? `${t.ui.book} · ${SLOTS[slot]}`
                            : t.ui.book}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <footer className={styles.footer}>
                <span className={styles.brand}>
                  <span className={styles.mark} />
                  {t.ui.brand}
                </span>
                <span>{t.ui.footer}</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
