import type { CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import styles from './ClientLogo.module.css'

type Props = {
  logo: { src: string; w: number; h: number }
  /** Для экранного диктора. Рядом уже есть название: не задаём, логотип молчит */
  label?: string
  className?: string
}

/**
 * Логотип клиента одним цветом: файл без фона работает маской, цвет берётся из color.
 * Поэтому знак подстраивается под любую тему и цветное поле, плашка не нужна.
 * Широкие логотипы ниже, высокие выше: на глаз все одного веса
 */
export function ClientLogo({ logo, label, className }: Props) {
  const ratio = logo.w / logo.h
  const k = Math.min(1.25, Math.max(0.6, (2.6 / ratio) ** 0.5))
  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ '--logo': `url(${asset(logo.src)})`, '--ratio': ratio, '--k': k } as CSSProperties}
    />
  )
}
