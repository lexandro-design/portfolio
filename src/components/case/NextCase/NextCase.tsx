import Link from 'next/link'
import { type Case } from '@/content/cases'
import { Shot } from '@/components/ui/Shot'
import styles from './NextCase.module.css'

type Props = { item: Case; href: string; label: string }

/** Переход к следующему кейсу по кругу: название крупно и его кадр */
export function NextCase({ item, href, label }: Props) {
  const media = item.thumb ?? item.shots[0]
  return (
    <div className="container">
      <Link href={href} className={styles.next}>
        <div className={styles.copy}>
          <span className={styles.label}>{label}</span>
          <span className={styles.title}>{item.title}</span>
          <span className={styles.tagline}>{item.tagline}</span>
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
