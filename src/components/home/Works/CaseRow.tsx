import Link from 'next/link'
import type { Case } from '@/content/cases'
import { Arrow } from '@/components/ui/Arrow'
import { CasePreview } from '@/components/ui/CasePreview'
import { Reveal } from '@/components/ui/Reveal'
import { Shot } from '@/components/ui/Shot'
import styles from './CaseRow.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/** Строка кейса: обложка или превью с номером слева, текст справа. Кликается целиком */
export function CaseRow({ item, index, total }: { item: Case; index: number; total: number }) {
  const cover = item.shots[0]
  return (
    <Reveal as="article" className={styles.row}>
      <Link href={`/cases/${item.slug}/`} className={styles.link}>
        <div className={styles.media}>
          {cover ? (
            <Shot shot={cover} className={styles.image} />
          ) : (
            <CasePreview index={index} year={item.year} stack={item.stack.slice(0, 4)} />
          )}
        </div>

        <div className={styles.text}>
          <div className={styles.meta}>
            <span>
              {pad(index)} / {pad(total)} · {item.label}
            </span>
            <span>{item.year}</span>
          </div>

          <h3 className={styles.title}>
            {item.title}
            <span className={styles.tagline}> · {item.tagline}</span>
          </h3>
          <p className={styles.lead}>{item.lead}</p>

          <ul className={styles.tags}>
            {item.stack.slice(0, 5).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <span className={styles.more}>
            читать кейс
            <span className={styles.arrow}>
              <Arrow />
            </span>
          </span>
        </div>
      </Link>
    </Reveal>
  )
}
