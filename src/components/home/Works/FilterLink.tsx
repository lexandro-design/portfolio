'use client'

import type { ReactNode } from 'react'
import type { Direction } from '@/content/cases'

export const FILTER_EVENT = 'works:filter'

/** Ссылка из карточки услуги: включает фильтр кейсов и прокручивает к ним */
export function FilterLink({
  direction,
  className,
  children,
}: {
  direction: Direction
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href="#works"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: direction }))}
    >
      {children}
    </a>
  )
}
