'use client'

import { useEffect, useState } from 'react'

/**
 * Время внутри шага: мс от начала шага, которые уже прошли (по отметкам marks).
 * Пока шаг стоит на паузе или без движения, возвращает Infinity: показано всё.
 * Нужен, чтобы цепочка «печатает, ответ, следующий ответ» шла внутри одного шага
 */
export function useBeats(step: number, running: boolean, marks: number[]) {
  const [s, setS] = useState({ step: -1, t: -1 })
  const key = marks.join(',')
  useEffect(() => {
    if (!running) return
    const ids = key.split(',').map((m) => window.setTimeout(() => setS({ step, t: Number(m) }), Number(m)))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [step, running, key])
  if (!running) return Infinity
  return s.step === step ? s.t : -1
}

/** Показ реплики: «печатает» за TYPE мс до ответа бота, последние LEAVE мс индикатор гаснет */
export const TYPE = 800
export const LEAVE = 220

export type Beat = { ts: number; shown: boolean; typing: boolean; leaving: boolean }

export function beat(t: number, ts: number, bot: boolean): Beat {
  return {
    ts,
    shown: t >= ts,
    typing: bot && t >= ts - TYPE && t < ts - LEAVE,
    leaving: bot && t >= ts - LEAVE && t < ts,
  }
}

/** Все отметки времени реплики: появление и границы «печатает» */
export function marksOf(ts: number, bot: boolean) {
  return bot ? [Math.max(0, ts - TYPE), ts - LEAVE, ts] : [ts]
}

/** Очередь реплик шага: мс появления каждой. Ответ бота ждёт «печатает», строка системы идёт следом */
export function schedule(kinds: ('out' | 'in' | 'sys')[]) {
  return kinds.reduce<{ at: number[]; cursor: number }>(
    (acc, k) => {
      if (k === 'out') return { at: [...acc.at, acc.cursor], cursor: acc.cursor + 500 }
      if (k === 'in') {
        const ts = acc.cursor + 900
        return { at: [...acc.at, ts], cursor: ts + 250 }
      }
      return { at: [...acc.at, acc.cursor], cursor: acc.cursor }
    },
    { at: [], cursor: 0 },
  ).at
}
