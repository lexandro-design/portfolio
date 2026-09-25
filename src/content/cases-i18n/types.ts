import type { CaseSection } from '../cases'

/** Перевод кейса: только текст. Скриншоты, стек, годы и ссылки берутся из основного cases.ts */
export type CaseCopy = {
  /** Название, если оно переводится (у продуктов с именем не переводится) */
  title?: string
  tagline: string
  lead: string
  client: string
  sections: CaseSection[]
  /** Подписи к скриншотам в том же порядке, что shots */
  captions: string[]
  note?: string
}
