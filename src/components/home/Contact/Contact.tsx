import { contacts, SECTION_COUNT } from '@/content/site'
import { Arrow } from '@/components/ui/Arrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import styles from './Contact.module.css'

/** Финальный экран: вопрос крупно, почта ссылкой, кнопки и статус */
export function Contact() {
  const n = String(SECTION_COUNT).padStart(2, '0')
  return (
    <Reveal className={styles.contact}>
      <span className={styles.label}>
        {n} / {n} · поговорим
      </span>
      <h2 className={styles.title}>готов обсудить проект?</h2>

      <div className={styles.row}>
        <a href={`mailto:${contacts.email}`} className={styles.email}>
          {contacts.email}
          <span className={styles.arrow}>
            <Arrow size={24} />
          </span>
        </a>
        <div className={styles.actions}>
          <Button href={contacts.github} external variant="ghost">
            github
          </Button>
          <Button href={contacts.telegram} external>
            написать в telegram
          </Button>
        </div>
      </div>

      <div className={styles.foot}>
        <span>telegram {contacts.telegramHandle} · санкт-петербург, мск</span>
        <span className={styles.status}>
          <span className={styles.dot} />
          открыт к проектам
        </span>
      </div>
    </Reveal>
  )
}
