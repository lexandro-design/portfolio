'use client'

import dynamic from 'next/dynamic'
import { useSyncExternalStore } from 'react'
import { readTheme, subscribeTheme } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import { SKY_THEMES } from '@/content/site'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

/** В стандартных темах ничего не рисует и не грузит: код сцены приходит при первом выборе Луны или Космоса */
export function Sky() {
  const on = useSyncExternalStore(subscribeTheme, () => SKY_THEMES.includes(readTheme()), () => false)
  return on ? <Scene /> : null
}
