import { Button } from '@/components/ui/Button'
import styles from './not-found.module.css'

export const metadata = { title: 'Страница не найдена' }

export default function NotFound() {
  return (
    <section className={`container ${styles.page}`}>
      <span className={styles.ghost} aria-hidden="true">
        404
      </span>
      <div className={styles.content}>
        <span className={styles.label}>ошибка 404 · страница не найдена</span>
        <h1 className={styles.title}>
          такой страницы нет.
          <br />
          но кейсы есть.
        </h1>
        <div className={styles.actions}>
          <Button href="/#works">к кейсам</Button>
          <Button href="/" variant="ghost">
            на главную
          </Button>
        </div>
      </div>
    </section>
  )
}
