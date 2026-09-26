import { contacts, features, SECTION_COUNT } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { Brief } from './Brief'
import styles from './Contact.module.css'

type Props = {
  t: Dict['contact']
  label: string
  services: Dict['services']
  steps: Dict['process']['steps']
}

/** Финальный экран: вопрос крупно, конструктор заявки, почта ссылкой, кнопки и статус */
export function Contact({ t, label, services, steps }: Props) {
  const n = String(SECTION_COUNT).padStart(2, '0')
  return (
    <Reveal className={styles.contact}>
      <span className={styles.label}>
        {n} / {n} · {label}
      </span>
      <h2 className={styles.title}>{t.title}</h2>

      {features.brief && <Brief t={t.brief} services={services} steps={steps} />}

      <div className={styles.row}>
        <a href={`mailto:${contacts.email}`} className={styles.email}>
          {contacts.email}
          <span className={styles.arrow}>
            <Arrow size={24} />
          </span>
        </a>
        <div className={styles.actions}>
          <Button href={contacts.github} external variant="ghost">
            {t.github}
          </Button>
          <Button href={contacts.telegram} external>
            {t.telegram}
          </Button>
        </div>
      </div>

      <div className={styles.foot}>
        <span>
          telegram {contacts.telegramHandle} · {t.location}
        </span>
        <span className={styles.status}>
          <span className={styles.dot} />
          {t.status}
        </span>
      </div>
    </Reveal>
  )
}
