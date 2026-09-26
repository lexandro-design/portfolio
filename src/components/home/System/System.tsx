'use client'

import { useState, useSyncExternalStore, type CSSProperties } from 'react'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { ThemeSwitch } from '@/components/layout/ThemeSwitch'
import { THEME_EVENT } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import styles from './System.module.css'

const SWATCHES = [
  ['base', '--bg-base'],
  ['elevated', '--bg-elevated'],
  ['primary', '--fg-primary'],
  ['secondary', '--fg-secondary'],
  ['tertiary', '--fg-tertiary'],
  ['live', '--signal-live'],
] as const

const TYPE = [
  { token: 'h1', size: 120, sample: 56 },
  { token: 'h2', size: 72, sample: 40 },
  { token: 'h3', size: 32, sample: 28 },
  { token: 'body', size: 17, sample: 17 },
  { token: 'mono', size: 12, sample: 12, mono: true },
]

const SPACING = [4, 8, 16, 24, 32, 48, 64, 96, 128]

/* Значения токенов читаются из CSS прямо сейчас: переключили тему —
   подписи под образцами сменились вместе с цветом */
const subscribe = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb)
  return () => window.removeEventListener(THEME_EVENT, cb)
}
const readValues = () => {
  const css = getComputedStyle(document.documentElement)
  return SWATCHES.map(([, v]) => css.getPropertyValue(v).trim()).join('|')
}

type Props = {
  t: Dict['system']
  /** Подписи переключателя тем — те же, что в шапке */
  themes: { label: string; labels: Dict['nav']['themes'] }
}

/**
 * Живая спецификация токенов этого сайта: цвет, типографика, отступы,
 * движение. Тему можно переключить прямо здесь — значения под образцами
 * меняются на глазах. Цвет копируется по клику, «Aa» показывает ось
 * толщины переменного шрифта, шкала отступов вырастает при появлении,
 * по кривой out-expo бежит точка в такт шару на дорожке.
 */
export function System({ t, themes }: Props) {
  const values = useSyncExternalStore(subscribe, readValues, () => '').split('|')
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400)
    } catch {
      // Без доступа к буферу (http, старый браузер) просто ничего не копируем
    }
  }

  return (
    <>
      <Reveal className={styles.introRow}>
        <p className={styles.intro}>{t.intro}</p>
        <div className={styles.try}>
          <span className={styles.label}>{t.tryTheme}</span>
          <ThemeSwitch label={themes.label} labels={themes.labels} />
        </div>
      </Reveal>

      <div className={styles.grid}>
        <Reveal className={`${styles.cell} ${styles.colors}`}>
          <span className={styles.label}>01 / {t.colors}</span>
          <ul className={styles.swatches}>
            {SWATCHES.map(([key, variable], i) => (
              <li key={key}>
                <button
                  type="button"
                  className={styles.swatch}
                  onClick={() => copy(key, values[i] || variable)}
                >
                  <span className={styles.chip} style={{ background: `var(${variable})` }} />
                  <span className={styles.name}>{t.swatches[key]}</span>
                  <code className={styles.code} aria-live="polite">
                    {copied === key ? t.copied : values[i] || variable}
                  </code>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.cell} delay={80}>
          <span className={styles.label}>02 / {t.type}</span>
          <ul className={styles.type}>
            {TYPE.map((row, i) => (
              <li key={row.token}>
                <span
                  className={styles.sample}
                  style={
                    {
                      fontSize: row.sample,
                      fontFamily: row.mono ? 'var(--font-mono)' : undefined,
                      '--i': i,
                    } as CSSProperties
                  }
                >
                  {row.mono ? 'MONO 0123' : row.token === 'body' ? t.specimen : 'Aa'}
                </span>
                <code className={styles.code}>
                  {row.token} · {row.size}
                </code>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.cell} delay={160}>
          <span className={styles.label}>03 / {t.spacing}</span>
          <ul className={styles.spacing}>
            {SPACING.map((s, i) => (
              <li key={s}>
                <code className={styles.code}>{s}</code>
                <span className={styles.bar} style={{ inlineSize: s, '--i': i } as CSSProperties} />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.cell} delay={240}>
          <span className={styles.label}>04 / {t.motion}</span>
          <div className={styles.motion}>
            <svg viewBox="0 0 200 120" className={styles.curve} aria-hidden="true">
              <path d="M0 120 L200 0" className={styles.linear} />
              <path d="M0 120 C32 0 60 0 200 0" className={styles.ease} />
              {/* Точка идёт по кривой за то же время, что шар по дорожке */}
              <circle r="4" className={styles.dot}>
                <animateMotion dur="2.6s" repeatCount="indefinite" path="M0 120 C32 0 60 0 200 0" />
              </circle>
            </svg>
            <div className={styles.track}>
              <span className={styles.ball} />
            </div>
            <code className={styles.code}>cubic-bezier(0.16, 1, 0.3, 1)</code>
            <span className={styles.note}>{t.motionNote}</span>
          </div>
        </Reveal>
      </div>
    </>
  )
}
