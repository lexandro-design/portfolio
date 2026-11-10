import type { CSSProperties } from 'react'
import type { Dict } from '@/i18n/dict'
import { CountUp } from '@/components/case/Brief/CountUp'
import { Reveal } from '@/components/ui/Reveal'
import styles from './About.module.css'

export type NumberItem = { v: number; l: string }

type Props = {
  t: Dict['about']['numbers']
  items: NumberItem[]
  langs: { name: string; share: number }[]
  /** Дата обновления чисел на языке страницы */
  date: string
}

/** Разряды через неразрывный пробел на всех языках: так число читается одинаково и набегает от нуля */
const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/\s/g, ' ')

/**
 * Работа в цифрах. Числа не вписаны руками: работа приходит из content/data/stats.json,
 * изображения считаются из кейсов при сборке. Плиток пять: первая шире, чтобы сетка была без пустой ячейки.
 * Полоса языков в настоящих пропорциях
 */
export function Numbers({ t, items, langs, date }: Props) {
  return (
    <Reveal className={styles.numbers}>
      <div className={styles.sourcesHead}>
        <h3 className={styles.sourcesTitle}>{t.title}</h3>
        <p className={styles.p}>{t.note.replace('{date}', date)}</p>
      </div>
      <ul className={styles.numbersGrid}>
        {items.map((it) => (
          <li key={it.l}>
            <CountUp value={fmt(it.v)} className={styles.numbersValue} />
            <span>{it.l}</span>
          </li>
        ))}
      </ul>
      <div className={styles.langs}>
        <span className={styles.langsLabel}>{t.langs}</span>
        <ul className={styles.langsBar}>
          {langs.map((l) => (
            <li key={l.name} style={{ '--n': l.share } as CSSProperties}>
              <b>{l.share}%</b>
              <span>{l.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}
