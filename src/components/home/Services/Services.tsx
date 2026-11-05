'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import demo from '@/content/data/parfumeria-demo.json'
import { contacts } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { asset } from '@/lib/asset'
import { Arrow } from '@/components/ui/Arrow'
import { useReduced, useReserve } from '@/components/case/Showcase/hooks'
import { BRIEF_EVENT } from '../Contact/Brief/Brief'
import styles from './Services.module.css'

type Props = {
  t: Dict['build']
  services: Dict['services']
  hello: string
  need: string
  titles: Record<string, string>
  base: string
}

type Step = Dict['build']['steps'][number]['code']

/** Настоящие кадры из кейса Parfumeria. Подпись переключателя берётся из словаря в том же порядке */
const SHOTS = ['04.jpg', 'mobile-product.jpg', 'ds-colors.jpg', 'ds-type.jpg']
const REELS = [
  { name: 'Love Hibiscus', file: '3d-hibiscus' },
  { name: "Terre d'Hermès", file: '3d-hermes' },
  { name: 'Issey Miyake', file: '3d-issey' },
  { name: 'HELLO', file: '3d-hello' },
]

const money = (n: number) => n.toFixed(2).replace('.', ',')

/**
 * Что я делаю: один настоящий магазин проходит через анализ, дизайн, 3D и код, и на каждом
 * этапе виден его настоящий материал. Автоматизации в этом проекте не было, она стоит отдельной
 * строкой со своими кейсами. Отмеченные услуги уходят в заявку одной кнопкой
 */
export function Services({ t, services, hello, need, titles, base }: Props) {
  const still = useReduced()
  const [step, setStep] = useState<Step>('analysis')
  const [chip, setChip] = useState(0)
  const [size, setSize] = useState(0)
  const [cart, setCart] = useState(0)
  const [off, setOff] = useState<string[]>([])
  const list = useRef<HTMLOListElement>(null)
  // Пояснение раскрыто у одного этапа: высоту списка держим под самое длинное, страница ниже не прыгает
  useReserve(list)

  const chosen = services.filter((s) => !off.includes(s.code))
  const message = [hello, chosen.length ? `${need}: ${chosen.map((s) => s.title).join(', ')}` : ''].filter(Boolean).join('\n')
  const active = t.steps.find((s) => s.code === step) ?? t.steps[0]
  const chips = step === '3d' ? REELS.map((r) => r.name) : active.chips
  const open = (code: Step) => {
    setStep(code)
    setChip(0)
  }
  const variant = demo.product.variants[size]

  return (
    <div className={styles.grid}>
      <div className={styles.left}>
        <p className={styles.lead}>{t.lead}</p>
        <ol ref={list} className={styles.steps}>
          {t.steps.map((s, i) => (
            <li key={s.code} className={styles.step} data-on={s.code === step || undefined}>
              <button type="button" className={styles.head} aria-expanded={s.code === step} onClick={() => open(s.code)}>
                <span className={styles.index}>{i + 1}</span>
                <span className={styles.title}>{s.title}</span>
              </button>
              <div className={styles.fold}>
                <div className={styles.inner} data-more>
                  <p className={styles.text}>{s.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <Link href={`${base}/cases/parfumeria/`} className={styles.whole}>
          {t.whole}
          <Arrow />
        </Link>
      </div>

      <div className={styles.side}>
        <div className={styles.stage}>
          <div className={styles.bar}>
            <span>{t.project}</span>
            {/* Переключатели всех этапов лежат стопкой в одной ячейке: полоса держит высоту самого длинного ряда */}
            <div className={styles.chipsStack}>
              {t.steps.map((s) => {
                const labels = s.code === '3d' ? REELS.map((r) => r.name) : s.chips
                const on = s.code === step
                return (
                  labels.length > 0 && (
                    <div
                      key={s.code}
                      className={styles.chips}
                      data-on={on || undefined}
                      role="group"
                      aria-label={s.title}
                      aria-hidden={!on}
                    >
                      {labels.map((label, i) => (
                        <button key={label} type="button" aria-pressed={on && i === chip} onClick={() => setChip(i)}>
                          {label}
                        </button>
                      ))}
                    </div>
                  )
                )
              })}
            </div>
          </div>

          <div className={styles.view}>
            {step === 'analysis' && (
              <table className={styles.table}>
                <tbody>
                  {demo.rows[chip].map((r) => (
                    <tr key={r.brand + r.title}>
                      <th scope="row">{r.brand}</th>
                      <td>{r.title}</td>
                      <td>{r.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {step === 'design' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={chip} className={styles.shot} src={asset(`/cases/parfumeria/${SHOTS[chip]}`)} alt={chips[chip]} loading="lazy" />
            )}

            {step === '3d' &&
              (still ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.shot} src={asset(`/cases/parfumeria/${REELS[chip].file}.jpg`)} alt={REELS[chip].name} />
              ) : (
                <video
                  key={chip}
                  className={styles.shot}
                  src={asset(`/cases/parfumeria/${REELS[chip].file}.mp4`)}
                  poster={asset(`/cases/parfumeria/${REELS[chip].file}.jpg`)}
                  muted
                  loop
                  autoPlay
                  playsInline
                  aria-label={REELS[chip].name}
                />
              ))}

            {step === 'code' && (
              <div className={styles.shop}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(demo.product.src)} alt={`${demo.product.brand} ${demo.product.title}`} loading="lazy" />
                <div className={styles.buy}>
                  <p className={styles.brand}>{demo.product.brand}</p>
                  <p className={styles.name}>{demo.product.title}</p>
                  <div className={styles.sizes} role="group" aria-label={t.shop.size}>
                    {demo.product.variants.map((v, i) => (
                      <button key={v.label} type="button" aria-pressed={i === size} onClick={() => setSize(i)}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <p className={styles.price}>{money(variant.price)} BYN</p>
                  <button type="button" className={styles.add} onClick={() => setCart((n) => n + 1)}>
                    {t.shop.add}
                  </button>
                  <pre className={styles.state} aria-live="polite">
                    {`variant: "${variant.label}"\ncart: ${cart}\ntotal: ${money(cart * variant.price)}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className={styles.facts}>
            {t.steps.map((s) => (
              <p key={s.code} className={styles.fact} data-on={s.code === step || undefined} aria-hidden={s.code !== step}>
                {s.fact}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.beyond}>
          <h3 className={styles.beyondTitle}>{t.beyond.title}</h3>
          <p className={styles.text}>{t.beyond.text}</p>
          <div className={styles.links}>
            {t.beyond.cases.map((slug) => (
              <Link key={slug} href={`${base}/cases/${slug}/`}>
                {titles[slug]}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.total}>
          <ul className={styles.prices}>
            {services.map((s) => (
              <li key={s.code}>
                <button
                  type="button"
                  aria-pressed={!off.includes(s.code)}
                  onClick={() => setOff((now) => (now.includes(s.code) ? now.filter((c) => c !== s.code) : [...now, s.code]))}
                >
                  <i aria-hidden="true" />
                  <span>{s.title}</span>
                  <b>{s.price}</b>
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <a
              href="#brief"
              className={styles.primary}
              onClick={() => window.dispatchEvent(new CustomEvent(BRIEF_EVENT, { detail: chosen.map((s) => s.code) }))}
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
    </div>
  )
}
