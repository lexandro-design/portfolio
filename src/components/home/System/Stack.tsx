import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import styles from './Stack.module.css'

type Props = { t: Dict['system']['stack']; numbers: { v: number; l: string }[] }

/** Из чего собран сайт: слои стека и цифры из данных сайта */
export function Stack({ t, numbers }: Props) {
  return (
    <Reveal className={styles.stack}>
      <div className={styles.head}>
        <h3 className={styles.title}>{t.title}</h3>
        <p className={styles.lead}>{t.lead}</p>
      </div>

      <ol className={styles.layers}>
        {t.layers.map((l) => (
          <li key={l.title}>
            <b>{l.title}</b>
            <span>{l.text}</span>
          </li>
        ))}
      </ol>

      <ul className={styles.numbers}>
        {numbers.map((n) => (
          <li key={n.l}>
            <b>{n.v}</b>
            <span>{n.l}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}
