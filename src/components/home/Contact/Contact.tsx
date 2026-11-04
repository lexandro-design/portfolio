import { contacts, features } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Brief } from './Brief'
import styles from './Contact.module.css'

type Props = {
  t: Dict['contact']
  services: Dict['services']
  steps: Dict['process']['steps']
}

/** Финальный экран: вопрос на всю ширину, конструктор заявки, прямые контакты */
export function Contact({ t, services, steps }: Props) {
  return (
    <Reveal className={styles.contact}>
      <h2 className={styles.title}>{t.title}</h2>

      {features.brief && <Brief t={t.brief} services={services} steps={steps} />}

      <div className={styles.row}>
        <a href={`mailto:${contacts.email}`} className={styles.email}>
          {contacts.email}
        </a>
        <ul className={styles.links}>
          <li>
            <a href={contacts.telegram} target="_blank" rel="noreferrer">
              {t.telegram}
            </a>
          </li>
          <li>
            <a href={contacts.behance} target="_blank" rel="noreferrer">
              {t.behance}
            </a>
          </li>
          <li>
            <a href={contacts.github} target="_blank" rel="noreferrer">
              {t.github}
            </a>
          </li>
        </ul>
      </div>
    </Reveal>
  )
}
