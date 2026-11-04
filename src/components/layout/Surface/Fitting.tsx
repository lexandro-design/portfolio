'use client'

import { useState, useSyncExternalStore } from 'react'
import { GROUPS, MATERIALS, TINTS } from './materials'
import { EMPTY, readChoice, saveChoice, subscribeChoice } from './store'
import styles from './Fitting.module.css'

/** Примерочная: кнопка «Фон» в углу, материал и оттенок применяются сразу и запоминаются.
    Панель рабочая, для выбора фона, поэтому подписи только по-русски. Убрать: features.fitting */
export function Fitting() {
  const [open, setOpen] = useState(false)
  const choice = useSyncExternalStore(subscribeChoice, readChoice, () => EMPTY)
  const current = MATERIALS.find((m) => m.id === choice.material)
  const tint = TINTS.find((t) => t.id === choice.tint) ?? TINTS[0]

  return (
    <div className={styles.root}>
      {open && (
        <div id="fitting" className={styles.panel} data-lenis-prevent role="dialog" aria-label="Примерочная фона">
          <div className={styles.head}>
            <span>{current ? `${current.name}, ${tint.name.toLowerCase()}` : 'Фон темы'}</span>
            <button type="button" className={styles.reset} disabled={!current} onClick={() => saveChoice(EMPTY)}>
              как в теме
            </button>
          </div>

          {GROUPS.map((group) => (
            <section key={group} className={styles.group}>
              <h2 className={styles.label}>{group}</h2>
              <ul className={styles.list}>
                {MATERIALS.filter((m) => m.group === group).map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className={styles.item}
                      aria-pressed={choice.material === m.id}
                      onClick={() => saveChoice({ ...choice, material: m.id })}
                    >
                      <i style={{ background: m.chip }} aria-hidden="true" />
                      <span>{m.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className={styles.group}>
            <h2 className={styles.label}>Оттенок</h2>
            <ul className={styles.tints}>
              {TINTS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={styles.tint}
                    aria-pressed={choice.tint === t.id}
                    aria-label={t.name}
                    title={t.name}
                    onClick={() => saveChoice({ ...choice, tint: t.id })}
                  >
                    <i style={{ background: `rgb(${t.color.map((c) => Math.round(c * 255)).join(' ')})` }} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      <button type="button" className={styles.open} aria-expanded={open} aria-controls="fitting" onClick={() => setOpen(!open)}>
        <i style={{ background: current?.chip ?? 'var(--fg-secondary)' }} aria-hidden="true" />
        {open ? 'закрыть' : 'фон'}
      </button>
    </div>
  )
}
