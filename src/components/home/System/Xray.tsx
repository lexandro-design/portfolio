'use client'

import { useEffect, useRef, useState } from 'react'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import styles from './Xray.module.css'

type Props = { t: Dict['system']['xray']; numbers: { v: number; l: string }[] }

/** Имя компонента и части берём из класса CSS-модуля: Hero-module__хеш__title */
function nameOf(el: Element | null) {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const found = String(node.getAttribute('class') ?? '').match(/([A-Za-z]+)-module__[\w-]+?__(\w+)/)
    if (found) return { name: found[1], part: found[2], node }
  }
  return null
}

/**
 * Рентген страницы: кнопка показывает, из чего собран сайт. Секции подписаны
 * именами компонентов, поверх лежит сетка, под курсором видно компонент,
 * размер и шрифт любого элемента. Ниже слои стека и цифры из данных сайта
 */
export function Xray({ t, numbers }: Props) {
  const [on, setOn] = useState(false)
  const tip = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!on) return
    const root = document.documentElement
    root.dataset.xray = 'on'
    const box = tip.current
    const move = (event: PointerEvent) => {
      if (!box || event.pointerType === 'touch') return
      const hit = nameOf(event.target as Element)
      box.hidden = !hit
      if (!hit) return
      const rect = hit.node.getBoundingClientRect()
      const css = getComputedStyle(hit.node)
      box.textContent = `<${hit.name}> ${hit.part}, ${Math.round(rect.width)}×${Math.round(rect.height)}, ${parseFloat(css.fontSize)}px`
      const x = Math.min(event.clientX + 14, innerWidth - box.offsetWidth - 8)
      const y = Math.min(event.clientY + 18, innerHeight - box.offsetHeight - 8)
      box.style.transform = `translate(${x}px, ${y}px)`
    }
    addEventListener('pointermove', move, { passive: true })
    return () => {
      delete root.dataset.xray
      removeEventListener('pointermove', move)
      if (box) box.hidden = true
    }
  }, [on])

  return (
    <Reveal className={styles.xray}>
      <div className={styles.head}>
        <h3 className={styles.title}>{t.title}</h3>
        <p className={styles.lead}>{t.lead}</p>
        <button type="button" className={styles.switch} aria-pressed={on} onClick={() => setOn(!on)}>
          <i aria-hidden="true" />
          {on ? t.off : t.on}
        </button>
      </div>

      <ol className={styles.layers}>
        {t.layers.map((l) => (
          <li key={l.title}>
            <b>{l.title}</b>
            <span>{l.text}</span>
          </li>
        ))}
      </ol>

      <ul className={styles.numbers}>
        {numbers.map((n) => (
          <li key={n.l}>
            <b>{n.v}</b>
            <span>{n.l}</span>
          </li>
        ))}
      </ul>

      <div ref={tip} className={styles.tip} hidden aria-hidden="true" />
    </Reveal>
  )
}
