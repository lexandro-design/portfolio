import type { Shot } from '@/content/cases'

/** Подборка: самые показательные проекты разных направлений */
export const PICK = ['parfumeria', 'mimimibot', 'saldo', 'ai-office', 'otrx', 'haiku']

/** Большой кадр для подборки там, где миниатюры кейса мало. Hermès уже на сцене первого экрана */
export const LOOK: Record<string, Shot> = {
  parfumeria: { src: '/cases/parfumeria/3d-hibiscus.jpg', video: '/cases/parfumeria/3d-hibiscus.mp4', caption: '', w: 1600, h: 900 },
  saldo: { src: '/cases/saldo/01.jpg', caption: '', w: 1600, h: 1100 },
  otrx: { src: '/cases/otrx/cover.jpg', video: '/cases/otrx/cover.mp4', caption: '', w: 2624, h: 1280 },
}
