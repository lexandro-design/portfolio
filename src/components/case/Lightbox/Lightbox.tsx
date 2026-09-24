'use client'

import { useEffect, useRef, useState } from 'react'
import { Arrow } from '@/components/ui/Arrow'
import styles from './Lightbox.module.css'

type Item = { src: string; alt: string }

/**
 * Просмотр скриншотов на весь экран. Картинки с data-zoom на странице
 * открываются по клику; листать стрелками, клавишами и свайпом.
 * Список собирается из DOM в порядке страницы: обложка, потом галерея.
 */
export function Lightbox() {
  const ref = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<Item[]>([])
  const [index, setIndex] = useState<number | null>(null)
  const touch = useRef<number | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest<HTMLImageElement>('img[data-zoom]')
      if (!img) return
      const all = [...document.querySelectorAll<HTMLImageElement>('img[data-zoom]')]
      setItems(all.map((i) => ({ src: i.currentSrc || i.src, alt: i.alt })))
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
      aria-label="Просмотр скриншота"
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
              закрыть
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- уже загруженная картинка со страницы */}
          <img key={current.src} className={styles.image} src={current.src} alt={current.alt} />
          {items.length > 1 && (
            <div className={styles.nav}>
              <button type="button" aria-label="Предыдущий" onClick={() => step(-1)}>
                <Arrow size={20} dir="left" />
              </button>
              <button type="button" aria-label="Следующий" onClick={() => step(1)}>
                <Arrow size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </dialog>
  )
}
