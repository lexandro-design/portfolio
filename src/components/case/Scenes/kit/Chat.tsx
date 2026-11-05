'use client'

import { useEffect, useRef, useState } from 'react'
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
  fit,
  minHeight,
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
  /**
   * Высота по содержимому: окно растёт вместе с лентой (плавно, block-size),
   * без пустоты сверху. Без fit лента прижата к низу фиксированной высоты, как раньше
   */
  fit?: boolean
  /** Нижняя граница высоты в режиме fit: число в px или любая CSS-длина */
  minHeight?: number | string
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const feedRef = useRef<HTMLOListElement>(null)
  const [h, setH] = useState<number>()

  useEffect(() => {
    if (!fit) return
    const root = rootRef.current
    const top = topRef.current
    const feed = feedRef.current
    if (!root || !top || !feed) return
    const measure = () => {
      const border = root.offsetHeight - root.clientHeight
      setH(Math.ceil(top.offsetHeight + feed.offsetHeight + border))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(feed)
    ro.observe(top)
    return () => ro.disconnect()
  }, [fit])

  const fitStyle: CSSProperties | undefined = fit
    ? { blockSize: h, minBlockSize: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }
    : undefined

  return (
    <div
      ref={rootRef}
      className={[styles.chat, className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-fit={fit || undefined}
      style={fitStyle ? { ...style, ...fitStyle } : style}
    >
      <div ref={topRef} className={styles.top}>
        <span className={styles.ava} aria-hidden="true">
          {avatar ?? title.slice(0, 1)}
        </span>
        <span className={styles.who}>
          {title}
          {sub && <small>{sub}</small>}
        </span>
        <span className={styles.dot} data-on={live || undefined} aria-hidden="true" />
      </div>
      <ol ref={feedRef} className={styles.feed}>
        {children}
      </ol>
    </div>
  )
}

/** Галочки доставки: одна — отправлено, две — прочитано */
function Ticks({ read }: { read: boolean }) {
  return (
    <svg className={styles.ticks} data-read={read || undefined} viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" focusable="false">
      <path className={styles.tickA} d="M1.5 5.4 4.4 8.2 9.6 1.6" />
      <path className={styles.tickB} d="M6.6 6.6 7.4 7.4 13.8 1.6" />
    </svg>
  )
}

/**
 * Пузырь. side in — от бота или собеседника (слева), out — от человека (справа).
 * Хвостик рисуется у последнего пузыря серии подряд от одного автора (как в Telegram),
 * tail принудительно включает или выключает его
 */
export function Msg({
  side,
  name,
  time,
  status,
  tail,
  delay,
  tone,
  className,
  style,
  children,
}: {
  side: 'in' | 'out'
  /** Имя над пузырём в групповом чате */
  name?: string
  /** Время в правом нижнем углу пузыря; без него не рисуется */
  time?: string
  /** Галочки у исходящих: sent — одна, read — две цветом сцены; без него нет */
  status?: 'sent' | 'read'
  /** Принудительно показать или скрыть хвостик; по умолчанию сам: у последнего в серии */
  tail?: boolean
  /** Задержка появления в мс, чтобы серия шла друг за другом */
  delay?: number
  /** dim — сообщение помечено (удалено, изменено), ok — подтверждение */
  tone?: 'dim' | 'ok'
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const hasMeta = Boolean(time) || Boolean(status)
  return (
    <li
      className={[styles.msg, className].filter(Boolean).join(' ')}
      data-side={side}
      data-tone={tone}
      data-named={name ? true : undefined}
      data-tail={tail === undefined ? undefined : String(tail)}
      style={delay ? { ...style, animationDelay: `${delay}ms` } : style}
    >
      {name && <span className={styles.name}>{name}</span>}
      <div className={styles.bubble}>
        {children}
        {hasMeta && (
          <span className={styles.meta}>
            {time && <span className={styles.stamp}>{time}</span>}
            {status && side === 'out' && <Ticks read={status === 'read'} />}
          </span>
        )}
      </div>
    </li>
  )
}

/**
 * Кнопки под сообщением бота. pressed: индекс нажатой (или несколько): короткое
 * нажатие, затем остаётся отмеченной
 */
export function Keys({ items, pressed, stack }: { items: string[]; pressed?: number | number[]; stack?: boolean }) {
  const down = (i: number) => (Array.isArray(pressed) ? pressed.includes(i) : pressed === i)
  return (
    <span className={styles.keys} data-stack={stack || undefined}>
      {items.map((b, i) => (
        <span key={b} className={styles.key} data-press={down(i) || undefined} style={{ '--i': i } as CSSProperties}>
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

/**
 * Собеседник печатает: волна из трёх точек, перед ними необязательный текст
 * («печатает…» подставляет сцена, у kit своих строк нет). leaving плавно гасит
 * индикатор: поставь его на ~200 мс перед тем, как убрать Typing из ленты
 */
export function Typing({ side = 'in', text, leaving, delay }: { side?: 'in' | 'out'; text?: ReactNode; leaving?: boolean; delay?: number }) {
  return (
    <li className={styles.msg} data-side={side} data-leaving={leaving || undefined} style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      <div className={`${styles.bubble} ${styles.typing}`} aria-label={typeof text === 'string' ? text : '…'}>
        {text && <span className={styles.typingText}>{text}</span>}
        <span className={styles.wave} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </li>
  )
}
