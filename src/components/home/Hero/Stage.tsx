'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { asset } from '@/lib/asset'
import { THEME_EVENT, readTheme } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import styles from './Hero.module.css'

type Props = { href: string; title: string; text: string }

/**
 * Сцена под заголовком. Ночью флакон стоит в темноте, чёрный фон ролика
 * растворяется в странице, рамки нет; днём на его месте солнечный кадр той
 * же работы. По прокрутке кадр вырастает на весь экран, прокрутка обычная.
 * Ролик грузится после страницы; на телефоне и при reduced motion кадр сразу
 * в полный размер
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
    let seen = false
    const source = () => {
      if (readTheme() === 'light') return asset('/cases/parfumeria/3d-issey.mp4')
      return asset(`/cases/parfumeria/hero${innerWidth < 768 ? '-mobile' : ''}.mp4`)
    }
    // Ролик ждёт, пока страница загрузится: постер уже стоит, первому экрану он не мешает
    const start = () => {
      if (calm || !seen) return
      const src = source()
      if (v.getAttribute('src') !== src) {
        delete v.dataset.on
        v.src = src
      }
      v.play().catch(() => {})
    }
    const ready = () => {
      if (document.readyState === 'complete') window.setTimeout(start, 600)
      else addEventListener('load', ready, { once: true })
    }

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
        seen = true
        ready()
        addEventListener('scroll', queue, { passive: true })
        addEventListener('resize', queue)
        queue()
      } else {
        seen = false
        v.pause()
        removeEventListener('scroll', queue)
        removeEventListener('resize', queue)
      }
    })
    io.observe(el)
    addEventListener(THEME_EVENT, start)
    return () => {
      io.disconnect()
      removeEventListener(THEME_EVENT, start)
      removeEventListener('load', ready)
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={root} className={styles.stage}>
      <div className={styles.sticky}>
        <div className={styles.frame}>
          <picture className={styles.night}>
            <source media="(max-width: 767px)" srcSet={asset('/cases/parfumeria/hero-mobile.jpg')} />
            <img src={asset('/cases/parfumeria/hero.jpg')} alt="" width={1600} height={780} fetchPriority="high" />
          </picture>
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
          <img className={styles.day} src={asset('/cases/parfumeria/3d-issey.jpg')} alt="" width={1600} height={900} loading="lazy" />
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={(e) => (e.currentTarget.dataset.on = '')}
          />
        </div>

        <Link href={href} className={styles.caption}>
          <span className={styles.captionTitle}>{title}</span>
          <span className={styles.captionText}>{text}</span>
        </Link>
      </div>
    </div>
  )
}
