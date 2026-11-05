'use client'

import { useEffect, useState } from 'react'

/**
 * Номер фазы: 0 до первой отметки, дальше +1 на каждую (marks в мс от появления).
 * Когда on выключен (бросок уже сыгран), сразу последняя фаза, чтобы история чата
 * показывалась целиком. Нужен для цепочки «ждём анимацию, печатает, ответ»
 */
export function usePhase(on: boolean, marks: number[]) {
  const [n, setN] = useState(0)
  const key = marks.join(',')
  useEffect(() => {
    if (!on) return
    const ids = key.split(',').map((m, i) => window.setTimeout(() => setN(i + 1), Number(m)))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [on, key])
  return on ? n : marks.length
}

/** Значение растёт с задержкой ms (счётчик ждёт ответа бота), а падает сразу */
export function useRise(value: number, ms: number) {
  const [held, setHeld] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setHeld(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return value < held ? value : held
}
