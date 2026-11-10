import type { Case, Direction, OrderKind } from '@/content/cases'

/** Шапка секции главной: «02 / 08 · услуги», заголовок и пояснение справа */
export type SectionCopy = { label: string; title: string; aside?: string }

/**
 * Все тексты сайта на одном языке. Всё, что говорится от первого лица,
 * живёт здесь, а не в компонентах: текст правится в одном месте, и
 * у каждого языка один и тот же набор ключей — TypeScript не даст забыть перевод.
 */
export type Dict = {
  meta: { title: string; description: string; caseTitle: string }

  /** Окно перед темой Космос и кнопка возврата */
  sky: {
    title: string
    text: string
    note: string
    enable: string
    stay: string
    never: string
    lag: string
    slow: string
    back: string
    hide: string
  }

  nav: {
    services: string
    works: string
    system: string
    about: string
    contact: string
    /** Подпись основной навигации для скринридера */
    sections: string
    status: string
    write: string
    menuOpen: string
    menuClose: string
    theme: string
    themes: { dark: string; light: string; steel: string; space: string; calm: string }
    calm: { on: string; off: string; hint: string }
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
    /** Что входит в услугу */
    items: string[]
    /** Стартовая цена направления: «от 50 000 ₽» */
    price: string
    tags: string[]
    filter: Direction
  }[]

  /** Раздел услуг: слои и цены берутся из services, этапы из process */
  build: {
    lead: string
    /** Ссылка на раздел этапов */
    more: string
    discuss: string
    write: string
  }

  works: {
    /** Метка на карточке с иллюстрацией вместо экрана */
    illustration: string
    all: string
    directions: Record<Direction, string>
    read: string
    rest: string
    /** Вкладка с отобранными кейсами — открыта по умолчанию */
    pick: string
    /** Второй фильтр: где сделан проект (поле group кейса) */
    where: { label: string; any: string } & Record<Case['group'], string>
    view: { grid: string; list: string }
    showAll: string
    empty: string
  }

  system: {
    stack: {
      title: string
      lead: string
      layers: { title: string; text: string }[]
      numbers: { cases: string; langs: string; themes: string; casts: string; pages: string }
    }
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
      /** Мини-сайт бронирования переговорок, который перестраивается от ручек */
      ui: {
        url: string
        brand: string
        nav: string[]
        cta: string
        badge: string
        title: string
        text: string
        primary: string
        secondary: string
        search: string
        features: { title: string; text: string }[]
        roomsTitle: string
        rooms: { name: string; meta: string }[]
        free: string
        equipment: string
        book: string
        booked: string
        footer: string
      }
    }
  }

  process: {
    steps: { title: string; text: string; get: string; need: string }[]
    step: string
    get: string
    need: string
    example: string
  }

  about: {
    lead: string
    text: string[]
    timeline: { when: string; title: string; text: string }[]
    /** Подпись к полосе «откуда кейсы»: сами числа считаются из cases.json */
    sources: { title: string; note: string }
    /** Только цифры из материалов кейсов */
    facts: { v: string; l: string }[]
  }

  principles: { title: string; text: string }[]

  contact: {
    title: string
    github: string
    behance: string
    telegram: string
    location: string
    status: string
    /** Три пути связи над заявкой */
    ways: {
      telegram: string
      telegramNote: string
      email: string
      emailNote: string
      copied: string
      brief: string
      briefValue: string
      briefNote: string
      time: string
    }
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
    actions: { brief: string; email: string; telegram: string; github: string; behance: string }
    copied: string
    hint: string
  }

  footer: { line: string; place: string }

  case: {
    /** Галерея иллюстраций: подпись обязательна, это не результат работы */
    back: string
    cta: string
    facts: { client: string; year: string; direction: string; stack: string; site: string }
    screens: string
    scheme: string
    next: string
    viewer: string
    close: string
    prev: string
    nextShot: string
    /** Переключатель темы у скриншотов, если проект сделан в двух темах */
    shotTheme: { label: string; light: string; dark: string }
    /** Подпись кнопки соавтора: «вёрстка — github.com/…» */
    credit: string
    creditWith: string
    /** Кнопка в конце кейса: {x} — что заказывают (kinds), {title} — название кейса */
    order: { label: string; want: string; kinds: Record<OrderKind, string> }
    /** Метка подробного текста кейса после интерактивных блоков */
    story: string
    /** Заголовок оглавления глав в шапке кейса */
    toc: string
    /** «Коротко» под шапкой кейса */
    brief: { label: string; task: string; did: string; result: string; role: string; process: string }
    /** Интерактивные блоки раскрытия */
    show: {
      /** Пометка у демо ботов: данные в нём — пример */
      example: string
      drag: string
      prev: string
      next: string
      incoming: string
      tracks: { me: string; them: string }
      /** Плеер записи экрана */
      cast: { inside: string; demo: string; play: string; pause: string; step: string }
      /** Как обращаться с блоком — рядом с его номером */
      hint: { browse: string; compare: string; steps: string; deck: string; reel: string; console: string }
    }
  }
}
