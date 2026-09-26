'use client'

import { useEffect, useState } from 'react'
import type { ChatLine } from '@/content/cases'
import { PHOTO } from '@/content/site'
import { asset } from '@/lib/asset'
import styles from './ChatPreview.module.css'

type Props = { lines: ChatLine[] }

// Шаг сценария и сколько шагов переписка висит целиком перед новым кругом
const STEP = 950
const HOLD = 4

type Phase = { count: number; typing: boolean }

/** Сценарий: перед каждым ответом бота — фаза «печатает», в конце пауза */
const script = (lines: ChatLine[]): Phase[] => {
  const phases: Phase[] = [{ count: 0, typing: false }]
  lines.forEach((line, i) => {
    if (line.from === 'bot') phases.push({ count: i, typing: true })
    phases.push({ count: i + 1, typing: false })
  })
  const last = phases[phases.length - 1]
  for (let i = 0; i < HOLD; i++) phases.push(last)
  return phases
}

const DAYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']

/** Вложение в сообщении — то, что показывает суть конкретного бота */
function Media({ line }: { line: ChatLine }) {
  switch (line.media) {
    case 'photo':
      // Фото от бота проявляется из размытого, как при генерации
      return (
        <span className={styles.photo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка */}
          <img src={asset(PHOTO.formats[0].src)} alt="" width={PHOTO.w} height={PHOTO.h} />
        </span>
      )
    case 'products':
      // Карточки товаров из каталога: превью-заглушка, название, наличие
      return (
        <span className={styles.products}>
          {line.items?.map((item, i) => (
            <span key={item} className={styles.product} style={{ animationDelay: `${i * 120}ms` }}>
              <span className={styles.thumb} />
              <span className={styles.productName}>{item}</span>
              <span className={styles.stock}>in stock</span>
            </span>
          ))}
        </span>
      )
    case 'booking':
      // Неделя, выходные выбраны, домик свободен
      return (
        <span className={styles.booking}>
          <span className={styles.days}>
            {DAYS.map((d, i) => (
              <span key={d} className={styles.day} data-picked={i > 4 || undefined}>
                {d}
              </span>
            ))}
          </span>
          <span className={styles.free}>
            <span className={styles.dot} />
            {line.items?.[0]}
          </span>
        </span>
      )
    case 'drawing':
      // Рисунок ученика: контур фигуры, поверх проступают пометки бота
      return (
        <svg className={styles.drawing} viewBox="0 0 120 90" aria-hidden="true">
          <circle cx="44" cy="30" r="12" className={styles.sketch} />
          <path
            d="M44 42 L44 70 M30 52 L58 52 M44 70 L34 86 M44 70 L54 86"
            className={styles.sketch}
          />
          <path d="M70 80 Q88 70 110 80" className={styles.sketch} />
          <circle cx="44" cy="30" r="17" className={styles.note} />
          <circle
            cx="92"
            cy="76"
            r="11"
            className={styles.note}
            style={{ animationDelay: '0.45s' }}
          />
        </svg>
      )
    default:
      return null
  }
}

/**
 * Переписка в превью кейса. Сообщения приходят по одному, бот сначала
 * «печатает», а в конце круга вся переписка исчезает разом, как при
 * новом диалоге: на CSS-задержках сообщения таяли по очереди сверху
 * вниз, и это выглядело неживым. У ответов бота бывают вложения — фото,
 * карточки товаров, календарь, рисунок с пометками — чтобы по превью
 * было понятно, что именно делает этот бот.
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
        <span
          key={line.text}
          className={styles.bubble}
          data-from={line.from}
          data-wide={line.media === 'products' || line.media === 'booking' || undefined}
        >
          <Media line={line} />
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
