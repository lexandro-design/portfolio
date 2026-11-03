import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Case } from '@/content/cases'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { Shot } from '@/components/ui/Shot'
import styles from './WorkCard.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = {
  item: Case
  index: number
  href: string
  /** Ячейка мозаики: hero — крупная, wide — широкая, base — малая. Нет — обычная плитка сетки */
  size?: 'hero' | 'wide' | 'base'
  style?: CSSProperties
  className?: string
}

/**
 * Плитка кейса: картинка или живое превью автоматизации сверху, номер,
 * название и строка «что это» снизу. В мозаике крупная ячейка
 * показывает ещё и лид. Кликается целиком
 */
export function WorkCard({ item, index, href, size, style, className }: Props) {
  const media = item.thumb ?? item.shots[0]
  return (
    <article
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-size={size}
      style={style}
    >
      <Link href={href} className={styles.link}>
        <div className={styles.media}>
          {media ? (
            <Shot shot={{ ...media, caption: item.title }} className={styles.image} />
          ) : (
            <CasePreview
              index={index}
              year={item.year}
              stack={item.stack.slice(0, 4)}
              preview={item.preview}
            />
          )}
        </div>

        <div className={styles.text}>
          <div className={styles.meta}>
            <span>
              {pad(index)} · {item.label}
            </span>
            <span>{item.year}</span>
          </div>
          <h3 className={styles.title}>
            {item.title}
            <span className={styles.tagline}> · {item.tagline}</span>
          </h3>
          {size === 'hero' && <p className={styles.lead}>{item.lead}</p>}
          <span className={styles.arrow} aria-hidden="true">
            <Arrow size={18} />
          </span>
        </div>
      </Link>
    </article>
  )
}
