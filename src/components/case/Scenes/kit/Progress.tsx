'use client'

import type { CSSProperties } from 'react'
import styles from './Progress.module.css'

/**
 * Полоса прогресса. value 0-100 плавно тянется через scaleX; indeterminate бегущий
 * отрезок для «обрабатываю»; run (мс) сам набирает 0-100 за это время, перезапуск через key
 */
export function Progress({
  value = 0,
  indeterminate,
  run,
  label,
  className,
  style,
}: {
  value?: number
  indeterminate?: boolean
  /** Набрать от 0 до 100 за столько мс (value игнорируется) */
  run?: number
  /** Подпись для скринридера */
  label?: string
  className?: string
  style?: CSSProperties
}) {
  const v = Math.max(0, Math.min(100, value))
  const auto = run !== undefined && !indeterminate
  return (
    <span
      className={[styles.bar, className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate || auto ? undefined : Math.round(v)}
      style={style}
    >
      <i
        className={styles.fill}
        data-mode={indeterminate ? 'idle' : auto ? 'run' : undefined}
        style={auto ? { animationDuration: `${run}ms` } : indeterminate ? undefined : { transform: `scaleX(${v / 100})` }}
      />
    </span>
  )
}

/** Три точки волной: «обрабатываю…», без подписи */
export function Dots({ className }: { className?: string }) {
  return (
    <span className={[styles.dots, className].filter(Boolean).join(' ')} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}

/** Кольцо-спиннер; size в px */
export function Spinner({ size = 14, label, className }: { size?: number; label?: string; className?: string }) {
  return (
    <span
      className={[styles.spin, className].filter(Boolean).join(' ')}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ inlineSize: size, blockSize: size }}
    />
  )
}
