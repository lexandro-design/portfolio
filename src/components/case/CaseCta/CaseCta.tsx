import { contacts } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import styles from './CaseCta.module.css'

type Props = { title: string; primary: string; write: string; href: string }

/** Конец кейса: прочитал, понравилось, сразу есть куда нажать */
export function CaseCta({ title, primary, write, href }: Props) {
  return (
    <section className={styles.root}>
      <Reveal className={`container ${styles.inner}`}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.actions}>
          <Button href={href}>{primary}</Button>
          <Button href={contacts.telegram} external variant="ghost">
            {write}
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
