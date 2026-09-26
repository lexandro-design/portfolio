'use client'

import { useState } from 'react'
import styles from './ShotTheme.module.css'

type Theme = 'light' | 'dark'
type Props = { labels: { label: string; light: string; dark: string } }

/**
 * Переключатель темы скриншотов на странице кейса. Если проект сделан
 * в двух темах, не выкладываем каждый экран дважды: у скрина есть тёмная
 * пара, а переключатель меняет data-shots на обёртке страницы (см.
 * CasePage), и CSS показывает нужную картинку (см. styles.css). Тема
 * самого сайта при этом не меняется — это разные вещи.
 */
export function ShotTheme({ labels }: Props) {
  const [theme, setTheme] = useState<Theme>('light')

  const choose = (next: Theme) => {
    setTheme(next)
    const page = document.querySelector<HTMLElement>('[data-case]')
    if (page) page.dataset.shots = next
  }

  return (
    <div className={styles.switch} role="radiogroup" aria-label={labels.label}>
      {(['light', 'dark'] as const).map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={theme === id}
          className={styles.option}
          onClick={() => choose(id)}
        >
          <span className={styles.swatch} data-theme-swatch={id} />
          {labels[id]}
        </button>
      ))}
    </div>
  )
}
