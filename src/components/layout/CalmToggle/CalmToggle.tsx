'use client'

import { useSyncExternalStore } from 'react'
import { DEFAULT_THEME, features } from '@/content/site'
import type { Dict } from '@/i18n/dict'
import { readTheme, subscribeTheme, toggleCalm } from '../ThemeSwitch/ThemeSwitch'
import styles from './CalmToggle.module.css'

type Props = {
  t: Dict['nav']['calm']
  /** nav: кнопка в шапке, hero: строка под кнопками первого экрана, menu: пункт меню */
  place: 'nav' | 'hero' | 'menu'
}

/** Включает спокойный вид и возвращает обычный. Название говорит, что изменится, а не для кого это */
export function CalmToggle({ t, place }: Props) {
  const calm = useSyncExternalStore(subscribeTheme, () => readTheme() === 'calm', () => DEFAULT_THEME === 'calm')
  if (!features.calm) return null

  return (
    <button type="button" className={styles.toggle} data-place={place} aria-pressed={calm} title={calm ? undefined : t.hint} onClick={toggleCalm}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 4.500h12M2 8h12M2 11.500h7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className={styles.name}>{calm ? t.off : t.on}</span>
      {place === 'hero' && !calm && <span className={styles.hint}>{t.hint}</span>}
    </button>
  )
}
