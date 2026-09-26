'use client'

import { useState } from 'react'
import { contacts } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import styles from './Brief.module.css'

/** Какой этап процесса добавляет услуга. Анализ и передача есть всегда */
const STEP_FOR: Record<string, number> = { design: 1, web: 2, automation: 3 }

type Props = {
  t: Dict['contact']['brief']
  services: Dict['services']
  steps: Dict['process']['steps']
}

/**
 * Конструктор заявки вместо «напишите мне». Посетитель отмечает услуги
 * (с ценами «от …» из того же словаря), видит маршрут работ, выбирает срок
 * и пишет пару слов. На выходе — готовое сообщение: в Telegram (текст
 * копируется и подставляется в чат, если клиент это умеет) или письмом.
 * Цены не складываем: «от» плюс «от» — это не честная сумма.
 */
export function Brief({ t, services, steps }: Props) {
  const [picked, setPicked] = useState<string[]>([])
  const [deadline, setDeadline] = useState<number | null>(null)
  const [about, setAbout] = useState('')
  const [note, setNote] = useState('')

  const chosen = services.filter((s) => picked.includes(s.code))
  const route = [
    0,
    ...chosen.map((s) => STEP_FOR[s.code]).filter((i) => i !== undefined),
    steps.length - 1,
  ]
    .filter((i, n, all) => steps[i] && all.indexOf(i) === n)
    .sort((a, b) => a - b)

  const message = [
    t.hello,
    chosen.length ? `${t.need}: ${chosen.map((s) => s.title.toLowerCase()).join(', ')}` : '',
    deadline !== null ? `${t.when}: ${t.deadlines[deadline]}` : '',
    about.trim() ? `${t.task}: ${about.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const toggle = (code: string) =>
    setPicked((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]))

  const send = async () => {
    if (!chosen.length) return setNote(t.empty)
    try {
      await navigator.clipboard.writeText(message)
      setNote(t.copied)
    } catch {
      setNote('')
    }
    window.open(`${contacts.telegram}?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
  }

  const mail = `mailto:${contacts.email}?subject=${encodeURIComponent(t.hello)}&body=${encodeURIComponent(message)}`

  return (
    // id — якорь для палитры команд («Собрать заявку»)
    <div id="brief" className={styles.anchor}>
      <Reveal className={styles.brief}>
        <div className={styles.form}>
          <span className={styles.label}>{t.label}</span>
          <h3 className={styles.title}>{t.title}</h3>

          <div className={styles.group}>
            <span className={styles.label}>{t.pick}</span>
            <div className={styles.services}>
              {services.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  className={styles.service}
                  aria-pressed={picked.includes(s.code)}
                  onClick={() => toggle(s.code)}
                >
                  <span className={styles.check} aria-hidden="true" />
                  <span className={styles.serviceTitle}>{s.title}</span>
                  <span className={styles.price}>{s.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>{t.deadline}</span>
            <div className={styles.seg} role="radiogroup" aria-label={t.deadline}>
              {t.deadlines.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={deadline === i}
                  onClick={() => setDeadline(deadline === i ? null : i)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.group}>
            <span className={styles.label}>{t.about}</span>
            <textarea
              className={styles.textarea}
              rows={3}
              value={about}
              placeholder={t.aboutPlaceholder}
              onChange={(e) => setAbout(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.side}>
          <div className={styles.group}>
            <span className={styles.label}>{t.route}</span>
            <ol className={styles.route}>
              {route.map((i, n) => (
                <li key={i} className={styles.step} style={{ animationDelay: `${n * 60}ms` }}>
                  <span className={styles.stepN}>{String(n + 1).padStart(2, '0')}</span>
                  <span>
                    <span className={styles.stepTitle}>{steps[i].title}</span>
                    <span className={styles.stepText}>{steps[i].text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>{t.preview}</span>
            <pre className={styles.message}>{message}</pre>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={send}
              aria-disabled={!chosen.length}
            >
              {t.telegram}
            </button>
            <a
              className={styles.secondary}
              href={chosen.length ? mail : undefined}
              onClick={() => !chosen.length && setNote(t.empty)}
              role="button"
            >
              {t.email}
            </a>
          </div>
          <p className={styles.note} aria-live="polite">
            {note}
          </p>
        </div>
      </Reveal>
    </div>
  )
}
