import Link from 'next/link'
import type { CSSProperties } from 'react'
import { caseColor, type Case } from '@/content/cases'
import type { Flow } from '@/content/flows'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { FlowCard } from '@/components/ui/FlowCard'
import { Shot } from '@/components/ui/Shot'
import styles from './WorkCard.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = {
  item: Case
  index: number
  href: string
  /** Как работает автоматизация — живая схема вместо картинки */
  flow?: Flow | null
  /** Ячейка мозаики: hero — крупная, wide — широкая, base — малая. Нет — обычная плитка сетки */
  size?: 'hero' | 'wide' | 'base'
  style?: CSSProperties
  className?: string
}

/**
 * Плитка кейса: картинка или живая схема автоматизации сверху, на ней
 * метка направления; снизу номер, название и строка «что это». В мозаике крупная ячейка
 * показывает ещё и лид. Кликается целиком
 */
export function WorkCard({ item, index, href, flow, size, style, className }: Props) {
  const media = item.card ?? item.thumb ?? item.shots[0]
  const color = caseColor(item.slug)
  return (
    <article
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-size={size}
      style={color ? ({ ...style, '--case-color': color } as CSSProperties) : style}
    >
      <Link href={href} className={styles.link}>
        <div className={styles.media}>
          {flow ? (
            <FlowCard flow={flow} />
          ) : media ? (
            <Shot shot={{ ...media, caption: item.title }} className={styles.image} />
          ) : (
            <CasePreview
              index={index}
              year={item.year}
              stack={item.stack.slice(0, 4)}
              preview={item.preview}
            />
          )}
          <span className={styles.chip}>{item.label}</span>
        </div>

        <div className={styles.text}>
          <div className={styles.meta}>
            <span>{pad(index)}</span>
            <span>{item.year}</span>
          </div>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.tagline}>{item.tagline}</p>
          {size === 'hero' && <p className={styles.lead}>{item.lead}</p>}
          <span className={styles.arrow} aria-hidden="true">
            <Arrow size={18} />
          </span>
        </div>
      </Link>
    </article>
  )
}
