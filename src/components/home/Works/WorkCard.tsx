import Link from 'next/link'
import type { CSSProperties } from 'react'
import { caseColor, type Case } from '@/content/cases'
import type { Flow } from '@/content/flows'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { ClientLogo } from '@/components/ui/ClientLogo'
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
  /** Подпись к иллюстрации: у карточек с card */
  note?: string
  /** Ячейка мозаики: hero — крупная, wide — широкая, base — малая. Нет — обычная плитка сетки */
  size?: 'hero' | 'wide' | 'base'
  /** Цифры кейса из блока «Коротко»: показывает только крупная плитка на широком экране */
  facts?: { v: string; l: string }[]
  style?: CSSProperties
  className?: string
}

/**
 * Плитка кейса: картинка или живая схема автоматизации сверху, на ней
 * метка направления; снизу номер, название и строка «что это». В мозаике крупная ячейка
 * показывает ещё и лид. Кликается целиком
 */
export function WorkCard({ item, index, href, flow, note, size, facts, style, className }: Props) {
  const media = item.card ?? item.thumb ?? item.shots[0]
  const color = caseColor(item.slug)
  const shown = size === 'hero' && facts && facts.length > 0 ? facts : null
  return (
    <article
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-size={size}
      data-facts={shown ? '' : undefined}
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
          {item.card && item.logo && <ClientLogo logo={item.logo} className={styles.logo} />}
          {item.card?.illustration && note && <span className={styles.note}>{note}</span>}
        </div>

        <div className={styles.text}>
          <div className={styles.meta}>
            <span>{pad(index)}</span>
            <span>{item.year}</span>
          </div>
          {shown && (
            <ul className={styles.facts}>
              {shown.map((f) => (
                <li key={f.l}>
                  <b>{f.v}</b>
                  <span>{f.l}</span>
                </li>
              ))}
            </ul>
          )}
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
