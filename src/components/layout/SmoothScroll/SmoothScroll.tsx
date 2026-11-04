'use client'

import { useEffect } from 'react'

/**
 * Мягкая прокрутка колесом мыши: на Windows колесо шагает рывками, и всё, что
 * привязано к прокрутке, дёргается вместе с ним. На тачскрине и при
 * prefers-reduced-motion ничего не включается, остаётся родная прокрутка.
 * Библиотека подгружается после первого экрана и в начальный бандл не входит
 */
export function SmoothScroll() {
  useEffect(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still || !matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let stop = () => {}
    let cancelled = false
    const start = async () => {
      const { default: Lenis } = await import('lenis')
      if (cancelled) return
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        allowNestedScroll: true,
        anchors: { offset: 0 },
        prevent: (node) => node.closest('dialog') !== null,
      })
      // Якорь на этой же странице ведёт только Lenis: прыжок роутера посреди анимации сбивает цель
      const own = (e: MouseEvent) => {
        const a = (e.target as Element).closest('a')
        if (!a?.hash || a.pathname !== location.pathname || e.ctrlKey || e.metaKey || e.shiftKey) return
        e.preventDefault()
        history.pushState(null, '', a.hash)
      }
      addEventListener('click', own, true)
      stop = () => {
        removeEventListener('click', own, true)
        lenis.destroy()
      }
    }
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))
    idle(() => void start())
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  return null
}
