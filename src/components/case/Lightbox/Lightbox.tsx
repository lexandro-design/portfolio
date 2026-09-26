'use client'

import { useEffect, useRef, useState } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import styles from './Lightbox.module.css'

/** tall — страница целиком: показываем по ширине и листаем внутри, а не ужимаем в экран */
type Item = { src: string; alt: string; tall: boolean }

// Выше этого соотношения картинка в экран не влезает читаемой
const TALL = 1.3

/**
 * Просмотр скриншотов на весь экран. Картинки с data-zoom на странице
 * открываются по клику; листать стрелками, клавишами и свайпом.
 * Список собирается из DOM в порядке страницы: обложка, потом галерея.
 * Скрытые картинки (второй вариант темы у скрина) в список не попадают.
 */
type Labels = { viewer: string; close: string; prev: string; next: string }

export function Lightbox({ labels }: { labels: Labels }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<Item[]>([])
  const [index, setIndex] = useState<number | null>(null)
  const touch = useRef<number | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest<HTMLImageElement>('img[data-zoom]')
      if (!img) return
      const all = [...document.querySelectorAll<HTMLImageElement>('img[data-zoom]')].filter(
        (i) => i.offsetParent !== null,
      )
      setItems(
        all.map((i) => ({
          src: i.currentSrc || i.src,
          alt: i.alt,
          // Размер файла из атрибутов: в галерее картинка обрезана кадром, её
          // отрисованная высота про саму страницу ничего не говорит
          tall: Number(i.getAttribute('height')) / Number(i.getAttribute('width')) > TALL,
        })),
      )
      setIndex(all.indexOf(img))
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (index !== null && !dialog.open) dialog.showModal()
    if (index === null && dialog.open) dialog.close()
  }, [index])

  const step = (d: number) =>
    setIndex((i) => (i === null || items.length === 0 ? i : (i + d + items.length) % items.length))

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const current = index === null ? null : items[index]

  return (
    <dialog
      ref={ref}
      className={styles.box}
      aria-label={labels.viewer}
      onClose={() => setIndex(null)}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIndex(null)
      }}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      {current && (
        <>
          <div className={styles.bar}>
            <span>
              {String((index ?? 0) + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}{' '}
              · {current.alt}
            </span>
            <button type="button" className={styles.close} onClick={() => setIndex(null)}>
              {labels.close}
            </button>
          </div>
          <div className={styles.stage} data-tall={current.tall || undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element -- уже загруженная картинка со страницы */}
            <img key={current.src} className={styles.image} src={current.src} alt={current.alt} />
          </div>
          {items.length > 1 && (
            <div className={styles.nav}>
              <button type="button" aria-label={labels.prev} onClick={() => step(-1)}>
                <Arrow size={20} dir="left" />
              </button>
              <button type="button" aria-label={labels.next} onClick={() => step(1)}>
                <Arrow size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </dialog>
  )
}
