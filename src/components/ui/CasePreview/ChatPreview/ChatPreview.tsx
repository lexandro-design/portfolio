'use client'

import { useEffect, useState } from 'react'
import type { Preview } from '@/content/cases'
import { PHOTO } from '@/content/site'
import { asset } from '@/lib/asset'
import styles from './ChatPreview.module.css'

type Line = Extract<Preview, { kind: 'chat' }>['lines'][number]
type Props = { lines: Line[] }

// Шаг сценария и сколько шагов переписка висит целиком перед новым кругом
const STEP = 900
const HOLD = 4

type Phase = { count: number; typing: boolean }

/** Сценарий: перед каждым ответом бота — фаза «печатает», в конце пауза */
const script = (lines: Line[]): Phase[] => {
  const phases: Phase[] = [{ count: 0, typing: false }]
  lines.forEach((line, i) => {
    if (line.from === 'bot') phases.push({ count: i, typing: true })
    phases.push({ count: i + 1, typing: false })
  })
  const last = phases[phases.length - 1]
  for (let i = 0; i < HOLD; i++) phases.push(last)
  return phases
}

/**
 * Переписка в превью кейса. Сообщения приходят по одному, бот сначала
 * «печатает», а в конце круга вся переписка исчезает разом, как при
 * новом диалоге: на CSS-задержках сообщения таяли по очереди сверху
 * вниз, и это выглядело неживым. Сообщение с media — фото от бота:
 * оно проявляется из размытого, как при генерации.
 *
 * До гидратации и при reduced motion показывается вся переписка сразу.
 */
export function ChatPreview({ lines }: Props) {
  const [phases] = useState(() => script(lines))
  const [step, setStep] = useState(phases.length - 1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setStep((s) => (s + 1) % phases.length), STEP)
    return () => window.clearInterval(timer)
  }, [phases])

  const { count, typing } = phases[step]

  return (
    <span className={styles.thread}>
      {lines.slice(0, count).map((line) => (
        <span key={line.text} className={styles.bubble} data-from={line.from}>
          {line.media === 'photo' && (
            <span className={styles.photo}>
              {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
              <img src={asset(PHOTO.formats[0].src)} alt="" width={PHOTO.w} height={PHOTO.h} />
            </span>
          )}
          {line.text}
        </span>
      ))}
      {typing && (
        <span className={`${styles.bubble} ${styles.typing}`} data-from="bot">
          <span />
          <span />
          <span />
        </span>
      )}
    </span>
  )
}
