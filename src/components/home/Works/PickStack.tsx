'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { caseColor, type Case } from '@/content/cases'
import type { Flow } from '@/content/flows'
import type { Brief } from '@/content/showcase'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { FlowCard } from '@/components/ui/FlowCard'
import { Shot } from '@/components/ui/Shot'
import { FOCUS } from './pick'
import styles from './PickStack.module.css'

type Props = {
  items: { c: Case; index: number }[]
  flows: Record<string, Flow | null>
  /** Крупные цифры результата по slug — из «коротко» самого кейса */
  nums: Record<string, Brief['nums']>
  href: (c: Case) => string
  read: string
}

const clamp = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Подборка: один проект на экран. Плитки прилипают под шапкой, следующая
 * наезжает на предыдущую, та отступает вглубь и темнеет. Прокрутка обычная,
 * ничего не перехватывается; без движения плитки просто идут друг за другом
 */
export function PickStack({ items, flows, nums, href, read }: Props) {
  const ref = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rows = [...root.children] as HTMLElement[]
    const tiles = rows.map((r) => r.firstElementChild as HTMLElement)
    let raf = 0

    const paint = () => {
      raf = 0
      const vh = innerHeight
      const tops = rows.map((r) => r.getBoundingClientRect().top)
      const sticky = parseFloat(getComputedStyle(rows[0]).top) || 0
      tiles.forEach((tile, i) => {
        const h = tile.offsetHeight
        const next = tops[i + 1]
        // Насколько следующая плитка закрыла эту и насколько эта уже вошла в экран
        const cover = next === undefined ? 0 : clamp(1 - (next - sticky) / h)
        const enter = clamp((vh - tops[i]) / (vh * 0.55))
        tile.style.transform = `scale(${(0.955 + 0.045 * enter - 0.05 * cover).toFixed(4)})`
        tile.style.setProperty('--dim', (cover * 0.6).toFixed(3))
      })
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    // Считаем только пока блок на экране
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        addEventListener('scroll', queue, { passive: true })
        addEventListener('resize', queue)
        queue()
      } else {
        removeEventListener('scroll', queue)
        removeEventListener('resize', queue)
      }
    })
    io.observe(root)
    return () => {
      io.disconnect()
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <ol ref={ref} className={styles.stack}>
      {items.map(({ c, index }) => {
        const color = caseColor(c.slug)
        const media = c.thumb ?? c.shots[0]
        const flow = flows[c.slug]
        return (
          <li
            key={c.slug}
            className={styles.row}
            style={{ '--case-color': color, '--focus': FOCUS[c.slug] } as CSSProperties}
          >
            <Link href={href(c)} className={styles.tile}>
              <div className={styles.copy}>
                <span className={styles.label}>{c.label}</span>
                <div className={styles.head}>
                  <h3 className={styles.title}>{c.title}</h3>
                  <p className={styles.tagline}>{c.tagline}</p>
                </div>
                {(nums[c.slug]?.length ?? 0) > 0 && (
                  <dl className={styles.nums}>
                    {nums[c.slug].map((n) => (
                      <div key={n.l} className={styles.num}>
                        <dd>{n.v}</dd>
                        <dt>{n.l}</dt>
                      </div>
                    ))}
                  </dl>
                )}
                <span className={styles.read}>
                  {read}
                  <Arrow size={16} />
                </span>
              </div>

              <div className={styles.media}>
                {flow ? (
                  <FlowCard flow={flow} size="big" />
                ) : media ? (
                  <Shot shot={{ ...media, caption: c.title }} className={styles.image} />
                ) : (
                  <CasePreview index={index} year={c.year} stack={c.stack.slice(0, 4)} preview={c.preview} />
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
