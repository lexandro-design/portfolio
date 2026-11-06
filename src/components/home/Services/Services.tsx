'use client'

import { useState } from 'react'
import { contacts } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { Arrow } from '@/components/ui/Arrow'
import { BRIEF_EVENT, routeOf } from '../Contact/Brief/Brief'
import { Stack } from './Stack'
import styles from './Services.module.css'

type Props = {
  t: Dict['build']
  services: Dict['services']
  steps: Dict['process']['steps']
  route: string
  hello: string
  need: string
}

/**
 * Что я делаю: три слоя продукта и что заказчик получает от каждого. Отмеченный слой занимает
 * свою плиту в разрезе, маршрут работ пересчитывается, набор уходит в заявку одной кнопкой
 */
export function Services({ t, services, steps, route, hello, need }: Props) {
  const [off, setOff] = useState<string[]>([])
  const [hot, setHot] = useState<string | null>(null)

  const chosen = services.filter((s) => !off.includes(s.code))
  const codes = chosen.map((s) => s.code)
  const path = routeOf(codes, steps.length)
  const message = [hello, chosen.length ? `${need}: ${chosen.map((s) => s.title).join(', ')}` : ''].filter(Boolean).join('\n')
  const toggle = (code: string) => setOff((now) => (now.includes(code) ? now.filter((c) => c !== code) : [...now, code]))

  return (
    <div className={styles.grid}>
      <div className={styles.main}>
        <p className={styles.lead}>{t.lead}</p>
        <ul className={styles.layers}>
          {services.map((s) => {
            const on = !off.includes(s.code)
            return (
              <li
                key={s.code}
                className={styles.layer}
                data-on={on || undefined}
                onPointerEnter={() => setHot(s.code)}
                onPointerLeave={() => setHot(null)}
              >
                <button
                  type="button"
                  className={styles.head}
                  aria-pressed={on}
                  onClick={() => toggle(s.code)}
                  onFocus={() => setHot(s.code)}
                  onBlur={() => setHot(null)}
                >
                  <i className={styles.check} aria-hidden="true" />
                  <span className={styles.title}>{s.title}</span>
                  <b className={styles.price}>{s.price}</b>
                </button>
                <p className={styles.text}>{s.text}</p>
                <ul className={styles.items}>
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>

        <div className={styles.order}>
          <div className={styles.route}>
            <p className={styles.routeLabel}>{route}</p>
            <ol className={styles.path}>
              {steps.map((s, i) => (
                <li key={s.title} data-on={path.includes(i) || undefined}>
                  {s.title}
                </li>
              ))}
            </ol>
            <a href="#process" className={styles.more}>
              {t.more}
            </a>
          </div>

          <div className={styles.actions}>
            <a
              href="#brief"
              className={styles.primary}
              onClick={() => window.dispatchEvent(new CustomEvent(BRIEF_EVENT, { detail: codes }))}
            >
              {t.discuss}
              <Arrow />
            </a>
            <a
              href={`${contacts.telegram}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
            >
              {t.write}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.side}>
        <div className={styles.figure}>
          <Stack codes={services.map((s) => s.code)} on={codes} hot={hot} />
        </div>
      </div>
    </div>
  )
}
