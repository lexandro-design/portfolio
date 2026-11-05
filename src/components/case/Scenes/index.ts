import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { SceneProps } from './types'

export type { SceneProps } from './types'

/**
 * Реестр сцен: кейс со сценой получает её вместо общей шапки, «Коротко» и
 * плеера первой главы. Каждая сцена грузится своим куском, чтобы страница
 * одного кейса не несла код всех остальных. Готовая сцена добавляется сюда
 * одной строкой; у кейсов без строки остаётся общая подача
 */
export const SCENES: Record<string, ComponentType<SceneProps>> = {
  'team-reports': dynamic(() => import('./team-reports/Scene').then((m) => m.Scene)),
  // 'dice-bots': dynamic(() => import('./dice-bots/Scene').then((m) => m.Scene)),
  'resort-bot': dynamic(() => import('./resort-bot/Scene').then((m) => m.Scene)),
  mimimibot: dynamic(() => import('./mimimibot/Scene').then((m) => m.Scene)),
  // 'food-assistants': dynamic(() => import('./food-assistants/Scene').then((m) => m.Scene)),
  // 'packaging-bots': dynamic(() => import('./packaging-bots/Scene').then((m) => m.Scene)),
  'mail-to-crm': dynamic(() => import('./mail-to-crm/Scene').then((m) => m.Scene)),
  'salon-booking': dynamic(() => import('./salon-booking/Scene').then((m) => m.Scene)),
  'art-school': dynamic(() => import('./art-school/Scene').then((m) => m.Scene)),
  'rag-mentor': dynamic(() => import('./rag-mentor/Scene').then((m) => m.Scene)),
  // 'fitness-bot': dynamic(() => import('./fitness-bot/Scene').then((m) => m.Scene)),
  'uni-bot': dynamic(() => import('./uni-bot/Scene').then((m) => m.Scene)),
  'lead-agent': dynamic(() => import('./lead-agent/Scene').then((m) => m.Scene)),
  // 'channel-pipeline': dynamic(() => import('./channel-pipeline/Scene').then((m) => m.Scene)),
  'media-to-rag': dynamic(() => import('./media-to-rag/Scene').then((m) => m.Scene)),
  // 'tg-assistant': dynamic(() => import('./tg-assistant/Scene').then((m) => m.Scene)),
}

export const hasScene = (slug: string) => slug in SCENES
