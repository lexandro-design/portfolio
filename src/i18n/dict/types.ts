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
    themes: { dark: string; neon: string; light: string }
    language: string
    /** Кнопка палитры команд (Ctrl+K) */
    search: string
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
    /** Что входит в работу под ключ — бегущая строка первого экрана */
    tickerItems: string[]
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

  services: {
    code: string
    title: string
    text: string
    /** Стартовая цена направления: «от 50 000 ₽» */
    price: string
    tags: string[]
    filter: Direction
  }[]
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
    tryTheme: string
    copied: string
    /** Песочница: ручки меняют токены мини-интерфейса */
    sandbox: {
      label: string
      title: string
      lead: string
      radius: string
      density: string
      densities: { compact: string; normal: string; airy: string }
      accent: string
      font: string
      theme: string
      reset: string
      copy: string
      ui: {
        search: string
        room: string
        meta: string
        free: string
        slots: string
        equipment: string
        book: string
        cancel: string
        booked: string
      }
    }
  }

  process: { steps: { title: string; text: string }[]; step: string }

  about: {
    lead: string
    text: string[]
    timeline: { when: string; title: string; text: string }[]
  }

  principles: { title: string; text: string }[]

  contact: {
    title: string
    github: string
    telegram: string
    location: string
    status: string
    /** Конструктор заявки: услуги берутся из services, этапы — из process */
    brief: {
      label: string
      title: string
      pick: string
      route: string
      deadline: string
      deadlines: string[]
      about: string
      aboutPlaceholder: string
      preview: string
      telegram: string
      email: string
      copied: string
      empty: string
      /** Строки самого сообщения */
      hello: string
      need: string
      when: string
      task: string
    }
  }

  /** Палитра команд по Ctrl+K / ⌘K */
  palette: {
    open: string
    placeholder: string
    empty: string
    groups: { sections: string; cases: string; actions: string; themes: string; languages: string }
    actions: { brief: string; email: string; telegram: string; github: string }
    copied: string
    hint: string
  }

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
    /** Переключатель темы у скриншотов, если проект сделан в двух темах */
    shotTheme: { label: string; light: string; dark: string }
    /** Подпись кнопки соавтора: «вёрстка — github.com/…» */
    credit: string
  }
}
