'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { asset } from '@/lib/asset'
import styles from './Hero.module.css'

type Props = { href: string; title: string; text: string }

/**
 * Сцена под заголовком: работа стоит в темноте, чёрный фон ролика сливается
 * со страницей, поэтому рамки нет. По прокрутке кадр вырастает на весь экран,
 * прокрутка обычная. Ролик грузится, когда сцена видна; на телефоне и при
 * reduced motion кадр сразу в полный размер
 */
export function Stage({ href, title, text }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = root.current
    const v = video.current
    if (!el || !v) return
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    const paint = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const run = r.height - innerHeight
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1
      el.style.setProperty('--p', p.toFixed(4))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!calm) v.play().catch(() => {})
        addEventListener('scroll', queue, { passive: true })
        addEventListener('resize', queue)
        queue()
      } else {
        v.pause()
        removeEventListener('scroll', queue)
        removeEventListener('resize', queue)
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={root} className={styles.stage}>
      <div className={styles.sticky}>
        <div className={styles.frame}>
          <picture>
            <source media="(max-width: 767px)" srcSet={asset('/cases/parfumeria/hero-mobile.jpg')} />
            <img src={asset('/cases/parfumeria/hero.jpg')} alt="" width={1600} height={780} />
          </picture>
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={(e) => (e.currentTarget.dataset.on = '')}
          >
            <source media="(max-width: 767px)" src={asset('/cases/parfumeria/hero-mobile.mp4')} type="video/mp4" />
            <source src={asset('/cases/parfumeria/hero.mp4')} type="video/mp4" />
          </video>
        </div>

        <Link href={href} className={styles.caption}>
          <span className={styles.captionTitle}>{title}</span>
          <span className={styles.captionText}>{text}</span>
        </Link>
      </div>
    </div>
  )
}
