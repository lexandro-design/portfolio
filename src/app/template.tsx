import type { ReactNode } from 'react'
import styles from './template.module.css'

/** Шаблон пересоздаётся при каждом переходе: новая страница проявляется, а не появляется рывком */
export default function Template({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>
}
