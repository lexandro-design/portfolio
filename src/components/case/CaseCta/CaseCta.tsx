import { contacts } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import styles from './CaseCta.module.css'

type Props = {
  title: string
  /** Подпись главной кнопки: «заказать такой же сайт» */
  order: string
  write: string
  /** Заявка на главной, уже заполненная под этот кейс */
  href: string
  /** Готовый текст для Telegram */
  message: string
}

/** Конец кейса: прочитал, понравилось, сразу можно заказать такой же проект. Форма и Telegram открываются с готовым текстом */
export function CaseCta({ title, order, write, href, message }: Props) {
  return (
    <section className={styles.root}>
      <Reveal className={`container ${styles.inner}`}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.actions}>
          <Button href={href}>{order}</Button>
          <Button href={`${contacts.telegram}?text=${encodeURIComponent(message)}`} external variant="ghost">
            {write}
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
