'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Dict } from '@/i18n/dict'
import styles from './Process.module.css'

type Example = { href: string; title: string; text: string }
type Props = { t: Dict['process']; examples: (Example | null)[] }

/** Пять шагов: крупная цифра контуром, открытый шаг показывает, что вы получите, что нужно от вас и как это было в настоящем кейсе */
export function Process({ t, examples }: Props) {
  const [open, setOpen] = useState(0)

  return (
    <ol className={styles.list}>
      {t.steps.map((step, i) => {
        const on = open === i
        const example = examples[i]
        return (
          <li key={step.title} className={styles.step} data-open={on || undefined}>
            <button type="button" className={styles.head} aria-expanded={on} onClick={() => setOpen(on ? -1 : i)}>
              <span className={styles.number} aria-hidden="true">
                0{i + 1}
              </span>
              <span className={styles.body}>
                <span className={styles.label}>
                  {t.step} 0{i + 1}
                </span>
                <span className={styles.title}>{step.title}</span>
              </span>
              <span className={styles.mark} aria-hidden="true" />
            </button>
            <div className={styles.fold}>
              <div className={styles.inner}>
                <p className={styles.text}>{step.text}</p>
                <dl className={styles.facts}>
                  <div>
                    <dt>{t.get}</dt>
                    <dd>{step.get}</dd>
                  </div>
                  <div>
                    <dt>{t.need}</dt>
                    <dd>{step.need}</dd>
                  </div>
                  {example && (
                    <div>
                      <dt>{t.example}</dt>
                      <dd>
                        {example.text} <Link href={example.href}>{example.title}</Link>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
