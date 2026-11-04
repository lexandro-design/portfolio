import type { Case } from './cases'
import type { Showcase } from './showcase'

/**
 * Подача кейса, с чего начинается разговор:
 * show — сначала сама работа, слова под ней (сайты и то, что смотрят глазами);
 * story — сначала задача, потом главы вперемежку (концепты и внутренние системы);
 * live — живое демо в центре (боты и автоматизации).
 */
export type Pace = 'show' | 'story' | 'live'

const STORY = new Set(['saldo', 'meeting-rooms', 'otrx', 'pix-bi', 'vacation-plan'])

export function paceOf(item: Case, show: Showcase | null): Pace {
  if (!show || item.shots.length === 0) return 'live'
  return STORY.has(item.slug) ? 'story' : 'show'
}
