'use client'

import { useSyncExternalStore } from 'react'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
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

/** Живая спецификация токенов этого сайта: цвет, типографика, отступы, движение */
export function System({ t }: { t: Dict['system'] }) {
  const values = useSyncExternalStore(subscribe, readValues, () => '').split('|')

  return (
    <>
      <Reveal as="p" className={styles.intro}>
        {t.intro}
      </Reveal>

      <div className={styles.grid}>
        <Reveal className={`${styles.cell} ${styles.colors}`}>
          <span className={styles.label}>01 / {t.colors}</span>
          <ul className={styles.swatches}>
            {SWATCHES.map(([key, variable], i) => (
              <li key={key} className={styles.swatch}>
                <span className={styles.chip} style={{ background: `var(${variable})` }} />
                <span className={styles.name}>{t.swatches[key]}</span>
                <code className={styles.code}>{values[i] || variable}</code>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.cell} delay={80}>
          <span className={styles.label}>02 / {t.type}</span>
          <ul className={styles.type}>
            {TYPE.map((row) => (
              <li key={row.token}>
                <span
                  className={styles.sample}
                  style={{
                    fontSize: row.sample,
                    fontFamily: row.mono ? 'var(--font-mono)' : undefined,
                  }}
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
            {SPACING.map((s) => (
              <li key={s}>
                <code className={styles.code}>{s}</code>
                <span className={styles.bar} style={{ inlineSize: s }} />
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
