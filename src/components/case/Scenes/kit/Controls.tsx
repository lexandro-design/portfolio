'use client'

import type { Play } from './usePlay'
import styles from './Controls.module.css'

type Labels = { play: string; pause: string; step: string; prev?: string; next?: string }

const clock = (ms: number) => {
  const s = Math.round(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Панель сцены: стрелки, пауза, шкала по шагам и время. Одна на все сцены,
 * чтобы управление читалось одинаково, какой бы ни была сама сцена
 */
export function Controls({ play, t, className }: { play: Play; t: Labels; className?: string }) {
  const { step, last, spans, stopped, playing, go, toggle } = play
  const total = spans.reduce((s, b) => s + b, 0)
  const passed = spans.slice(0, step).reduce((s, b) => s + b, 0)
  return (
    <div className={[styles.controls, className].filter(Boolean).join(' ')}>
      <button type="button" className={styles.ctl} onClick={() => go(step - 1)} aria-label={t.prev ?? '←'} disabled={step === 0}>
        ←
      </button>
      <button type="button" className={styles.ctl} onClick={toggle} aria-label={stopped ? t.play : t.pause} data-wide>
        {stopped ? '▶' : '❙❙'}
      </button>
      <button type="button" className={styles.ctl} onClick={() => go(step + 1)} aria-label={t.next ?? '→'} disabled={step === last}>
        →
      </button>
      <ol className={styles.track}>
        {spans.map((ms, i) => (
          <li key={i} style={{ flexGrow: ms }}>
            <button
              type="button"
              aria-label={`${t.step} ${i + 1}`}
              aria-current={i === step || undefined}
              data-done={i < step || undefined}
              onClick={() => go(i)}
            >
              <i key={i === step ? `${step}-${stopped}` : undefined} data-run={(i === step && playing) || undefined} style={{ animationDuration: `${ms}ms` }} />
            </button>
          </li>
        ))}
      </ol>
      <span className={styles.time}>
        {clock(passed)} / {clock(total)}
      </span>
    </div>
  )
}
