import Link from 'next/link'
import type { ReactNode } from 'react'
import { Arrow } from '../Arrow'
import styles from './Button.module.css'

type Props = {
  href: string
  children: ReactNode
  /** primary — светлая заливка, ghost — контур, text — подчёркнутая ссылка */
  variant?: 'primary' | 'ghost' | 'text'
  external?: boolean
  arrow?: boolean
  className?: string
}

/** Кнопка-ссылка из макета: моно, стрелка сдвигается на ховере */
export function Button({
  href,
  children,
  variant = 'primary',
  external,
  arrow = true,
  className,
}: Props) {
  const cls = [styles.button, className].filter(Boolean).join(' ')
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <span className={styles.arrow}>
          <Arrow />
        </span>
      )}
    </>
  )
  if (external || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        className={cls}
        data-variant={variant}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={cls} data-variant={variant}>
      {inner}
    </Link>
  )
}
