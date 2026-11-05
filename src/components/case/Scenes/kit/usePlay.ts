'use client'

import { useEffect, useState } from 'react'
import { useInView, useReduced } from '@/components/case/Showcase/hooks'

export type Play = {
  inView: boolean
  /** Текущий шаг. При prefers-reduced-motion сразу последний, если человек не листает сам */
  step: number
  last: number
  spans: number[]
  /** Идёт ли воспроизведение прямо сейчас */
  playing: boolean
  stopped: boolean
  go: (i: number) => void
  toggle: () => void
}

/**
 * Сценарий сцены по шагам: у каждого шага своя длительность в мс, последний
 * держится дольше и всё начинается заново. Клик по шкале или стрелкам ставит
 * на паузу, чтобы прочитать. Без движения показывается последний шаг.
 * ref вешается на корень сцены: шаги идут, только пока сцена на экране
 */
export function usePlay(spans: number[], { hold = 3200, loop = true } = {}): [ReturnType<typeof useInView<HTMLElement>>[0], Play] {
  // Шапка сцены на телефоне выше 4 экранов: доля видимого там меньше порога, поэтому смотрим, заходит ли она в середину окна
  const [ref, inView] = useInView<HTMLElement>('-30% 0px')
  const still = useReduced()
  const last = spans.length - 1
  const [at, setAt] = useState(0)
  const [paused, setPaused] = useState(false)
  const stopped = paused || still
  const step = still && !paused ? last : at

  useEffect(() => {
    if (!inView || stopped) return
    const id = window.setTimeout(
      () => setAt((i) => (i >= last ? (loop ? 0 : i) : i + 1)),
      spans[at] + (at === last ? hold : 0),
    )
    return () => window.clearTimeout(id)
  }, [at, inView, stopped, spans, last, hold, loop])

  const go = (i: number) => {
    setPaused(true)
    setAt(Math.max(0, Math.min(last, i)))
  }
  const toggle = () => {
    if (paused && at === last) setAt(0)
    setPaused(!paused)
  }

  return [ref, { inView, step, last, spans, playing: inView && !stopped, stopped, go, toggle }]
}

/** Такт для бесконечной анимации (кубик крутится, точки печатают): номер кадра раз в ms, пока on */
export function useTick(ms: number, on: boolean) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!on) return
    const id = window.setInterval(() => setN((x) => x + 1), ms)
    return () => window.clearInterval(id)
  }, [ms, on])
  return n
}
