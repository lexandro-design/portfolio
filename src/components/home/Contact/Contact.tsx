import { contacts, features, SECTION_COUNT } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Brief, type Likes } from './Brief'
import { Ways } from './Ways'
import styles from './Contact.module.css'

type Props = {
  t: Dict['contact']
  label: string
  services: Dict['services']
  steps: Dict['process']['steps']
  likes: Likes
}

/** Финальный экран: вопрос крупно, три пути связи сразу, ниже заявка для тех, кому удобнее собрать задачу */
export function Contact({ t, label, services, steps, likes }: Props) {
  const n = String(SECTION_COUNT).padStart(2, '0')
  return (
    <Reveal className={styles.contact}>
      <span className={styles.label}>
        {n} / {n} · {label}
      </span>
      <h2 className={styles.title}>{t.title}</h2>

      <Ways t={t.ways} hello={t.brief.hello} />

      {features.brief && <Brief t={t.brief} services={services} steps={steps} likes={likes} />}

      <div className={styles.foot}>
        <span>{t.location}</span>
        <span className={styles.links}>
          <a href={contacts.behance} target="_blank" rel="noopener noreferrer">
            {t.behance}
          </a>
          <a href={contacts.github} target="_blank" rel="noopener noreferrer">
            {t.github}
          </a>
        </span>
        <span className={styles.status}>
          <span className={styles.dot} />
          {t.status}
        </span>
      </div>
    </Reveal>
  )
}
