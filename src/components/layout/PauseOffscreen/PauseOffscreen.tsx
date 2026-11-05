'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Секции вне экрана перестают анимироваться: CSS-анимации, которые двигают шрифт, left или clip-path,
 * иначе пересчитывают вёрстку каждый кадр, даже когда их не видно (на телефоне это съедало главный поток).
 * Метка data-off ставится наблюдателем, а паузу делает правило в styles.css.
 */
export function PauseOffscreen() {
  const path = usePathname()

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.removeAttribute('data-off')
          else e.target.setAttribute('data-off', '')
        }
      },
      { rootMargin: '120px 0px' },
    )
    document.querySelectorAll('main section, footer').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [path])

  return null
}
