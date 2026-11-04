import Link from 'next/link'
import type { CSSProperties } from 'react'
import { caseColor, type Case } from '@/content/cases'
import { Arrow } from '@/components/ui/Arrow'
import { Shot } from '@/components/ui/Shot'
import styles from './NextCase.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type Props = { item: Case; index: number; total: number; href: string; label: string }

/** Переход к следующему кейсу по кругу: плитка с его кадром и цветом */
export function NextCase({ item, index, total, href, label }: Props) {
  const media = item.thumb ?? item.shots[0]
  return (
    <div className="container">
      <Link
        href={href}
        className={styles.next}
        data-media={media ? '' : undefined}
        style={{ '--case-color': caseColor(item.slug) } as CSSProperties}
      >
        <div className={styles.copy}>
          <span className={styles.label}>
            {label} · {pad(index)} / {pad(total)}
          </span>
          <span className={styles.title}>
            {item.title}
            <span className={styles.tagline}> · {item.tagline}</span>
          </span>
          <span className={styles.arrow}>
            <Arrow size={28} />
          </span>
        </div>
        {media && (
          <div className={styles.media}>
            <Shot shot={{ ...media, caption: item.title }} className={styles.image} />
          </div>
        )}
      </Link>
    </div>
  )
}
