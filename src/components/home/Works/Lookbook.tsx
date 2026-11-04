'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { caseColor, type Case } from '@/content/cases'
import type { Flow } from '@/content/flows'
import type { Brief } from '@/content/showcase'
import { FlowCard } from '@/components/ui/FlowCard'
import { Shot } from '@/components/ui/Shot'
import { LOOK } from './pick'
import styles from './Lookbook.module.css'

type Props = {
  items: { c: Case; index: number }[]
  flows: Record<string, Flow | null>
  /** Цифры результата по slug — из «коротко» самого кейса */
  nums: Record<string, Brief['nums']>
  href: (c: Case) => string
  read: string
}

/**
 * Подборка как лукбук: у работ с кадром большая картинка без рамок, у
 * автоматизаций вместо картинки главная цифра и живая схема. Фон страницы
 * подсвечен цветом работы на середине экрана: свет на сайте только от работ
 */
export function Lookbook({ items, flows, nums, href, read }: Props) {
  const root = useRef<HTMLOListElement>(null)
  const light = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    const glow = light.current
    if (!el || !glow) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) glow.style.setProperty('--light', (e.target as HTMLElement).dataset.color ?? '')
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    // Вне подборки свет гаснет
    const out = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) glow.style.removeProperty('--light')
      glow.toggleAttribute('data-on', e.isIntersecting)
    })
    for (const row of el.children) io.observe(row)
    out.observe(el)
    return () => {
      io.disconnect()
      out.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={light} className={styles.light} aria-hidden="true" />
      <ol ref={root} className={styles.book}>
        {items.map(({ c }) => {
          const flow = flows[c.slug]
          const media = LOOK[c.slug] ?? c.thumb ?? c.shots[0]
          const figures = nums[c.slug] ?? []
          const color = caseColor(c.slug)
          return (
            <li
              key={c.slug}
              className={styles.row}
              data-color={color}
              data-kind={flow ? 'flow' : 'media'}
              style={{ '--case-color': color } as CSSProperties}
            >
              <Link href={href(c)} className={styles.piece}>
                {flow ? (
                  <>
                    <div className={styles.lead}>
                      {figures[0] && (
                        <p className={styles.big}>
                          <span>{figures[0].v}</span>
                          <span className={styles.bigLabel}>{figures[0].l}</span>
                        </p>
                      )}
                    </div>
                    <div className={styles.flow}>
                      <FlowCard flow={flow} size="big" />
                    </div>
                  </>
                ) : (
                  media && (
                    <div className={styles.media}>
                      <Shot shot={{ ...media, caption: c.title }} className={styles.image} />
                    </div>
                  )
                )}

                <div className={styles.caption}>
                  <h3 className={styles.title}>{c.title}</h3>
                  <div className={styles.about}>
                    <p className={styles.tagline}>{c.tagline}</p>
                    {!flow && figures.length > 0 && (
                      <dl className={styles.nums}>
                        {figures.map((n) => (
                          <div key={n.l} className={styles.num}>
                            <dd>{n.v}</dd>
                            <dt>{n.l}</dt>
                          </div>
                        ))}
                      </dl>
                    )}
                    <span className={styles.read}>{read}</span>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </>
  )
}
