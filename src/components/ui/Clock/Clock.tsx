'use client'

import { useEffect, useState } from 'react'

const format = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

/** Живые часы по Москве. До гидрации прочерки той же ширины */
export function Clock() {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => setNow(format.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return <time>{now ?? '--:--:--'} MSK</time>
}
