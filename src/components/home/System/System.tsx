'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { useInView } from '@/components/case/Showcase/hooks'
import { THEMES, type Theme } from '@/content/site'
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
  { token: 'h1', size: 196, sample: 60, serif: true },
  { token: 'h2', size: 128, sample: 44, serif: true },
  { token: 'h3', size: 56, sample: 30, serif: true },
  { token: 'body', size: 17, sample: 17 },
  { token: 'small', size: 15, sample: 15 },
]

const SPACING = [4, 8, 16, 24, 32, 48, 64, 96, 128]

type Props = {
  t: Dict['system']
  /** Названия палитр */
  labels: Dict['nav']['themes']
}

/**
 * Живая спецификация токенов этого сайта: цвет, типографика, отступы,
 * движение. Палитру можно переключить прямо здесь: меняются значения
 * токенов внутри панели, подписи под образцами читаются из CSS. Цвет
 * копируется по клику, шкала отступов вырастает при появлении, по кривой
 * out-expo бежит точка в такт шару на дорожке.
 */
export function System({ t, labels }: Props) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [values, setValues] = useState<string[]>([])
  const panel = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [gridRef, live] = useInView<HTMLDivElement>()

  useEffect(() => {
    if (!panel.current) return
    const css = getComputedStyle(panel.current)
    setValues(SWATCHES.map(([, v]) => css.getPropertyValue(v).trim()))
  }, [theme])

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
        <div className={styles.try} role="radiogroup" aria-label={t.tryTheme}>
          {THEMES.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={theme === id}
              className={styles.pick}
              onClick={() => setTheme(id)}
            >
              {labels[id]}
            </button>
          ))}
        </div>
      </Reveal>

      <div ref={panel} className={styles.panel} data-theme={theme}>
      <div ref={gridRef} className={styles.grid} data-live={live || undefined}>
        <Reveal className={`${styles.cell} ${styles.colors}`}>
          <span className={styles.label}>{t.colors}</span>
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
          <span className={styles.label}>{t.type}</span>
          <ul className={styles.type}>
            {TYPE.map((row, i) => (
              <li key={row.token}>
                <span
                  className={styles.sample}
                  style={
                    {
                      fontSize: row.sample,
                      fontFamily: row.serif ? 'var(--font-heading)' : undefined,
                      '--i': i,
                    } as CSSProperties
                  }
                >
                  {row.serif ? 'Aa' : t.specimen}
                </span>
                <code className={styles.code}>
                  {row.token}, {row.size}
                </code>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.cell} delay={160}>
          <span className={styles.label}>{t.spacing}</span>
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
          <span className={styles.label}>{t.motion}</span>
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

      </div>
    </>
  )
}
