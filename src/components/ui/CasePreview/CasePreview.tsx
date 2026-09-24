import styles from './CasePreview.module.css'

type Props = {
  index: number
  year: string
  stack: string[]
  size?: 'row' | 'cover'
}

/**
 * Превью кейса без скриншотов: плашка с уголками, номер кейса контуром
 * и стек. Проекты под NDA и без картинок стоят в том же ритме, что и
 * с фото, и не выглядят пустыми.
 */
export function CasePreview({ index, year, stack, size = 'row' }: Props) {
  const n = String(index).padStart(2, '0')
  return (
    <div className={styles.preview} data-size={size} aria-hidden="true">
      <span className={styles.corner} data-pos="tl" />
      <span className={styles.corner} data-pos="br" />
      <span className={styles.top}>
        <span>case {n}</span>
        <span>{year}</span>
      </span>
      <span className={styles.number}>{n}</span>
      <span className={styles.stack}>
        {stack.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </span>
    </div>
  )
}
