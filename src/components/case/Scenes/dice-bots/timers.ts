'use client'

import { useEffect, useState } from 'react'

/**
 * true, когда on выключен, и через ms после включения. Нужен, чтобы ответ бота
 * появлялся после паузы на анимацию, а у уже сыгранных бросков был виден сразу
 */
export function useAfter(on: boolean, ms: number) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!on) return
    const id = window.setTimeout(() => setDone(true), ms)
    return () => window.clearTimeout(id)
  }, [on, ms])
  return !on || done
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
