'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { Case } from '@/content/cases'
import type { Flow } from '@/content/flows'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { FlowCard } from '@/components/ui/FlowCard'
import { Shot } from '@/components/ui/Shot'
import styles from './WorkList.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = {
  items: { c: Case; index: number }[]
  flows: Record<string, Flow | null>
  href: (c: Case) => string
  where: Dict['works']['where']
}

/**
 * Кейсы списком: строка на проект — номер, название, что это, где и год.
 * На устройствах с мышью под курсором плывёт превью кейса: позиция
 * догоняет курсор с затуханием (rAF), смена кейса — проявлением.
 */
export function WorkList({ items, flows, href, where }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (active === null) return
    let raf = 0
    const tick = () => {
      const p = pos.current
      const t = target.current
      p.x += (t.x - p.x) * 0.18
      p.y += (t.y - p.y) * 0.18
      if (box.current) box.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    target.current = { x: e.clientX + 28, y: e.clientY - 120 }
    // Первое появление — сразу на месте, без проезда из угла
    if (active === null) pos.current = { ...target.current }
  }

  const hover = active === null ? undefined : items[active]
  const current = hover?.c
  const media = current ? (current.thumb ?? current.shots[0]) : undefined

  return (
    <div className={styles.root} onPointerLeave={() => setActive(null)}>
      <ul className={styles.list}>
        {items.map(({ c, index }, i) => (
          <li key={c.slug} className={styles.row} style={{ '--i': Math.min(i, 16) } as CSSProperties}>
            <Link
              href={href(c)}
              className={styles.link}
              onPointerMove={onMove}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return
                onMove(e)
                setActive(i)
              }}
              data-active={active === i || undefined}
            >
              <span className={styles.n}>{pad(index)}</span>
              <span className={styles.title}>{c.title}</span>
              <span className={styles.tagline}>{c.tagline}</span>
              <span className={styles.label}>{c.label}</span>
              <span className={styles.where}>{where[c.group]}</span>
              <span className={styles.year}>{c.year}</span>
              <span className={styles.arrow}>
                <Arrow size={16} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div ref={box} className={styles.float} data-on={current ? '' : undefined} aria-hidden="true">
        {hover && current && (
          <div key={current.slug} className={styles.floatInner}>
            {flows[current.slug] ? (
              <FlowCard flow={flows[current.slug]!} />
            ) : media ? (
              <Shot shot={{ ...media, caption: current.title }} className={styles.floatImg} />
            ) : (
              <CasePreview
                index={hover.index}
                year={current.year}
                stack={current.stack.slice(0, 4)}
                preview={current.preview}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
