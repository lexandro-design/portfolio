import Link from 'next/link'
import type { ReactNode } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import { ClientLogo } from '@/components/ui/ClientLogo'
import type { SceneProps } from '../types'
import hero from '@/components/case/CaseHero/CaseHero.module.css'
import styles from './Head.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Детали шапки кейса для сцен. Та же типографика и те же линии, что у общей
 * шапки, но сцена сама решает, где им стоять и в каком порядке
 */

export function Back({ meta }: Pick<SceneProps, 'meta'>) {
  return (
    <Link href={meta.back.href} className={hero.back}>
      <Arrow dir="left" />
      {meta.back.label}
    </Link>
  )
}

export function Meta({ item, meta, className }: Pick<SceneProps, 'item' | 'meta'> & { className?: string }) {
  return (
    <div className={[hero.meta, className].filter(Boolean).join(' ')}>
      <span>
        case {pad(meta.index)} / {pad(meta.total)} · {item.label}
      </span>
      <span className={hero.metaEnd}>
        {item.logo && <ClientLogo logo={item.logo} label={item.client} className={hero.logo} />}
        {item.year}
      </span>
    </div>
  )
}

export function Title({ item, className }: Pick<SceneProps, 'item'> & { className?: string }) {
  return (
    <h1 className={[hero.title, className].filter(Boolean).join(' ')}>
      {item.title}
      <span className={hero.tagline}>{item.tagline}</span>
    </h1>
  )
}

export function Lead({ item, className, children }: Pick<SceneProps, 'item'> & { className?: string; children?: ReactNode }) {
  return (
    <div className={[hero.lead, className].filter(Boolean).join(' ')}>
      <p>{item.lead}</p>
      {children}
    </div>
  )
}

export function Facts({ facts, className }: Pick<SceneProps, 'facts'> & { className?: string }) {
  return (
    <dl className={[hero.facts, className].filter(Boolean).join(' ')}>
      {facts.map((f) => (
        <div key={f.label} className={hero.fact}>
          <dt>{f.label}</dt>
          <dd>
            {f.href ? (
              <a href={f.href} target="_blank" rel="noreferrer" className={hero.site}>
                {f.value}
                <Arrow size={12} dir="up-right" />
              </a>
            ) : (
              f.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Подпись моно капителью: ярлык над блоком, «внутри», «пример» */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={[styles.mono, className].filter(Boolean).join(' ')}>{children}</span>
}

/** Подпись под сценой: имитация экрана, примеры условные */
export function Note({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={[styles.note, className].filter(Boolean).join(' ')}>{children}</p>
}

/** Подпись текущего шага: что сейчас произошло. Высота держится, чтобы страница не прыгала */
export function Cap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p key={String(children)} className={[styles.cap, className].filter(Boolean).join(' ')}>
      {children}
    </p>
  )
}
