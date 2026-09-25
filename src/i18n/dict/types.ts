import type { Direction } from '@/content/cases'

/** Шапка секции главной: «02 / 08 · услуги», заголовок и пояснение справа */
export type SectionCopy = { label: string; title: string; aside?: string }

/**
 * Все тексты сайта на одном языке. Всё, что говорится от первого лица,
 * живёт здесь, а не в компонентах: текст правится в одном месте, и
 * у каждого языка один и тот же набор ключей — TypeScript не даст забыть перевод.
 */
export type Dict = {
  meta: { title: string; description: string; caseTitle: string }

  nav: {
    services: string
    works: string
    system: string
    about: string
    contact: string
    status: string
    write: string
    menuOpen: string
    menuClose: string
    theme: string
    themes: { dark: string; warm: string; light: string }
    language: string
  }

  hero: {
    metaLeft: [string, string]
    /** Строки заголовка; accent — последние строки вторым цветом */
    title: string[]
    accent: string[]
    body: string
    primary: string
    secondary: string
    ticker: string
    scroll: string
    photoAlt: string
    photoCaption: string
  }

  sections: {
    services: SectionCopy
    works: SectionCopy
    system: SectionCopy
    process: SectionCopy
    about: SectionCopy
    principles: SectionCopy
    contact: { label: string }
  }

  services: { code: string; title: string; text: string; tags: string[]; filter: Direction }[]
  servicesMore: string

  works: {
    all: string
    directions: Record<Direction, string>
    read: string
    rest: string
  }

  system: {
    intro: string
    colors: string
    type: string
    spacing: string
    motion: string
    motionNote: string
    swatches: {
      base: string
      elevated: string
      primary: string
      secondary: string
      tertiary: string
      live: string
    }
    specimen: string
  }

  process: { steps: { title: string; text: string }[]; step: string }

  about: {
    lead: string
    text: string[]
    timeline: { when: string; title: string; text: string }[]
  }

  principles: { title: string; text: string }[]

  contact: { title: string; github: string; telegram: string; location: string; status: string }

  footer: { line: string; place: string }

  case: {
    back: string
    facts: { client: string; year: string; direction: string; stack: string; site: string }
    screens: string
    next: string
    viewer: string
    close: string
    prev: string
    nextShot: string
  }
}
