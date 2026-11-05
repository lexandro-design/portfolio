'use client'

import type { CSSProperties, ReactNode } from 'react'
import styles from './Chat.module.css'

/**
 * Окно мессенджера для сцен: шапка с именем, лента сообщений, пузыри «мне»
 * и «от меня», кнопки под сообщением, строка системы, индикатор набора.
 * tone: tg для Telegram, wa для WhatsApp (цвета исходящих), без логотипов
 */
export function Chat({
  title,
  sub,
  tone = 'tg',
  avatar,
  live,
  className,
  style,
  children,
}: {
  title: string
  sub?: string
  tone?: 'tg' | 'wa'
  /** Буква или эмодзи в аватаре; по умолчанию первая буква названия */
  avatar?: ReactNode
  /** Точка «онлайн» в шапке горит */
  live?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div className={[styles.chat, className].filter(Boolean).join(' ')} data-tone={tone} style={style}>
      <div className={styles.top}>
        <span className={styles.ava} aria-hidden="true">
          {avatar ?? title.slice(0, 1)}
        </span>
        <span className={styles.who}>
          {title}
          {sub && <small>{sub}</small>}
        </span>
        <span className={styles.dot} data-on={live || undefined} aria-hidden="true" />
      </div>
      <ol className={styles.feed}>{children}</ol>
    </div>
  )
}

/** Пузырь. side in — от бота или собеседника (слева), out — от человека (справа) */
export function Msg({
  side,
  name,
  time,
  tone,
  className,
  children,
}: {
  side: 'in' | 'out'
  /** Имя над пузырём в групповом чате */
  name?: string
  time?: string
  /** dim — сообщение помечено (удалено, изменено), ok — подтверждение */
  tone?: 'dim' | 'ok'
  className?: string
  children: ReactNode
}) {
  return (
    <li className={[styles.msg, className].filter(Boolean).join(' ')} data-side={side} data-tone={tone}>
      {name && <span className={styles.name}>{name}</span>}
      <div className={styles.bubble}>{children}</div>
      {time && <span className={styles.time}>{time}</span>}
    </li>
  )
}

/** Кнопки под сообщением бота. pressed подсвечивает нажатую */
export function Keys({ items, pressed, stack }: { items: string[]; pressed?: number; stack?: boolean }) {
  return (
    <span className={styles.keys} data-stack={stack || undefined}>
      {items.map((b, i) => (
        <span key={b} className={styles.key} data-press={pressed === i || undefined}>
          {b}
        </span>
      ))}
    </span>
  )
}

/** Строка системы посреди ленты: «сообщение удалено», «вступил в группу» */
export function Sys({ children }: { children: ReactNode }) {
  return <li className={styles.sys}>{children}</li>
}

/** Три точки: собеседник печатает */
export function Typing({ side = 'in' }: { side?: 'in' | 'out' }) {
  return (
    <li className={styles.msg} data-side={side}>
      <div className={`${styles.bubble} ${styles.typing}`} aria-label="…">
        <i />
        <i />
        <i />
      </div>
    </li>
  )
}
