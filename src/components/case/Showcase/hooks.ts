'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'
const reduced = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches

/** Просил ли человек меньше движения. На сервере — нет, в браузере следит за настройкой */
export function useReduced() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(QUERY)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    reduced,
    () => false,
  )
}

/**
 * Виден ли блок сейчас. В отличие от Reveal следит постоянно: анимации
 * демо крутятся, только пока блок на экране, и встают на паузу, когда
 * его пролистали
 */
export function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView]
}

/**
 * Вкладки, которые листаются сами раз в ms, пока блок виден. Клик по
 * вкладке выбирает её и запускает таймер заново. При prefers-reduced-motion
 * сами не листаются
 */
export function useAuto(total: number, ms: number, active: boolean) {
  const [step, setStep] = useState(0)
  const [nonce, setNonce] = useState(0)
  useEffect(() => {
    if (!active || total < 2 || reduced()) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % total), ms)
    return () => window.clearInterval(id)
  }, [active, total, ms, nonce])
  const set = (i: number) => {
    setStep(((i % total) + total) % total)
    setNonce((n) => n + 1)
  }
  return [step, set] as const
}

/**
 * Сценарий демо: шаги 0…total-1 по кругу, шаг раз в ms, последний держится
 * hold шагов. При prefers-reduced-motion сразу последний шаг — всё видно
 * без движения
 */
export function useScript(total: number, ms: number, active: boolean, hold = 3) {
  const [step, setStep] = useState(0)
  const still = useReduced()
  useEffect(() => {
    if (!active || still) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % (total + hold)), ms)
    return () => window.clearInterval(id)
  }, [active, still, total, hold, ms])
  return still ? total - 1 : Math.min(step, total - 1)
}
