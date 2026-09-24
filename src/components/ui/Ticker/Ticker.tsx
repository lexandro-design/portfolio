import styles from './Ticker.module.css'

/** Бегущая строка «сейчас в работе:». Список продублирован, чтобы не было видно шва */
export function Ticker({ label, items }: { label: string; items: string[] }) {
  const row = (hidden?: boolean) => (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className={styles.item}>
          {item}
        </span>
      ))}
    </div>
  )
  return (
    <div className={styles.ticker}>
      <span className={styles.label}>{label}</span>
      <div className={styles.viewport}>
        <div className={styles.track}>
          {row()}
          {row(true)}
        </div>
      </div>
    </div>
  )
}
