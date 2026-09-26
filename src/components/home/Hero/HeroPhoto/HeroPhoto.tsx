'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { PHOTO } from '@/content/site'
import { asset } from '@/lib/asset'
import styles from './HeroPhoto.module.css'

type Props = { alt: string; caption: string }

// Сколько кадр держится и сколько длится сбой при смене формата.
// Длительность сбоя уходит в CSS переменной --glitch
const HOLD = 2600
const GLITCH = 620

/**
 * Фото на первом экране меняет «формат» через короткий сбой, как у
 * барахлящего сигнала: кадр рвётся на полосы, сдвигается, и из обрывков
 * собирается другая техника — гравюра, точки, символы, полутон, пиксели,
 * снова обычное фото. Все форматы
 * нарезаны заранее из одного снимка (public/me/*). Монохромные хранятся
 * масками, поэтому красятся цветом текста темы и не требуют трёх копий.
 *
 * Новый слой лежит поверх текущего и проступает полосами clip-path,
 * старый в это время дёргается (см. CSS). Пока вкладка скрыта, смена стоит: иначе после
 * возвращения кадры пролистывались бы пачкой.
 */
export function HeroPhoto({ alt, caption }: Props) {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState<number | null>(null)
  // Лишний «тик», чтобы перезапустить ожидание, пока вкладка скрыта
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (next !== null) {
      const done = window.setTimeout(() => {
        setCurrent(next)
        setNext(null)
      }, GLITCH)
      return () => window.clearTimeout(done)
    }

    const wait = window.setTimeout(() => {
      if (document.visibilityState === 'visible') setNext((current + 1) % PHOTO.formats.length)
      else setTick((t) => t + 1)
    }, HOLD)
    return () => window.clearTimeout(wait)
  }, [current, next, tick])

  const shownIndex = next ?? current

  return (
    <figure className={styles.photo}>
      <div
        className={styles.frame}
        style={{ '--glitch': `${GLITCH}ms` } as CSSProperties}
        data-glitch={next !== null || undefined}
      >
        {PHOTO.formats.map((format, i) => {
          const state = i === next ? 'in' : i === current ? 'on' : undefined
          const src = asset(format.src)

          return format.mask ? (
            <span
              key={format.id}
              className={styles.layer}
              data-state={state}
              data-mask
              style={{ '--mask': `url(${src})` } as CSSProperties}
              aria-hidden="true"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
            <img
              key={format.id}
              className={styles.layer}
              data-state={state}
              src={src}
              alt={i === 0 ? alt : ''}
              width={PHOTO.w}
              height={PHOTO.h}
            />
          )
        })}
        {next !== null && <span key={next} className={styles.noise} aria-hidden="true" />}
      </div>

      <figcaption className={styles.caption}>
        <span>{caption}</span>
        <span className={styles.format}>
          {String(shownIndex + 1).padStart(2, '0')} / {PHOTO.formats[shownIndex].id}
        </span>
      </figcaption>
    </figure>
  )
}
