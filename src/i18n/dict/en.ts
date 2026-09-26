import type { Dict } from './types'

export const en: Dict = {
  meta: {
    title: 'Alexey Sveshnikov · design, code and AI end to end',
    description:
      'Designer and developer: analysis, design systems and interfaces in Figma, websites built on that design and automation with AI agents. End to end, one pair of hands.',
    caseTitle: 'Alexey Sveshnikov',
  },

  nav: {
    services: 'services',
    works: 'work',
    system: 'system',
    about: 'about',
    contact: 'contact',
    status: 'open to projects',
    write: 'get in touch',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    theme: 'Theme',
    themes: { dark: 'Dark theme', warm: 'Warm theme', light: 'Light theme' },
    language: 'Language',
  },

  hero: {
    metaLeft: ['LEXANDRO · saint petersburg', 'ux/ui · design systems · websites · automation'],
    title: ['Design, code', 'and AI agents,', 'end to end,'],
    accent: ['in one pair of hands.'],
    body: 'I design the product and its design system, build a clean front end, write the back end, set up the database and server and wire in AI agents. The whole product, from idea to launch.',
    primary: 'discuss a project',
    secondary: 'see the work',
    ticker: 'end to end:',
    tickerItems: [
      'analysis',
      'design system',
      'interfaces',
      'front end',
      'back end',
      'database',
      'server',
      'ai agents',
      'crm integrations',
      'launch',
    ],
    scroll: 'scroll down',
    photoAlt: 'Alexey Sveshnikov on an embankment in Saint Petersburg',
    photoCaption: "that's me · saint petersburg",
  },

  sections: {
    services: {
      label: 'services',
      title: 'what I do',
      aside: 'analysis · design · code · automation',
    },
    works: {
      label: 'work',
      title: 'selected work',
      aside: 'TITAN-2, EnterSales, freelance and my own products',
    },
    system: {
      label: 'system',
      title: 'what this site runs on',
      aside: 'three themes · one set of tokens',
    },
    process: { label: 'process', title: 'how I work', aside: 'end to end · one person' },
    about: {
      label: 'about',
      title: 'who is behind it',
      aside: 'design and code in one pair of hands',
    },
    principles: { label: 'principles', title: 'how I think', aside: 'four rules' },
    contact: { label: "let's talk" },
  },

  services: [
    {
      code: 'design',
      title: 'UX/UI and design systems',
      text: 'Design systems that work for the product: colour, type and spacing tokens, components with every state, grid rules. New screens are assembled from ready parts, and developers build without guessing.',
      price: 'from $600',
      tags: ['ux/ui', 'design systems', 'design tokens', 'figma', 'auto layout'],
      filter: 'design',
    },
    {
      code: 'web',
      title: 'Websites and back end',
      text: 'Websites and web apps built on my own design: front end on Tilda or React and Next.js, back end, database and server. Every screen is checked against the design at every width.',
      price: 'from $1,200',
      tags: ['react', 'next.js', 'node.js', 'postgresql', 'tilda'],
      filter: 'web',
    },
    {
      code: 'automation',
      title: 'Automation and AI',
      text: 'Telegram bots and AI assistants, CRM and payment integrations, databases, RAG search over documents. Can keep data and models in Russia under data law 152-FZ.',
      price: 'from $240',
      tags: ['javascript', 'postgresql', 'rag', 'ai agents', 'bitrix24', '152-fz'],
      filter: 'ai',
    },
  ],
  servicesMore: 'see projects',

  works: {
    all: 'all',
    directions: { design: 'design', web: 'web', ai: 'automation / ai' },
    read: 'read the case',
    rest: 'smaller automations',
  },

  system: {
    intro:
      'This site is built the way I build products: colour, type, spacing and motion are tokens, and components refer to nothing else. Switch the theme on the right: token values change, and not a single component is touched.',
    colors: 'colour',
    type: 'type',
    spacing: 'spacing',
    motion: 'motion',
    motionNote: 'out-expo · 900 ms · block reveal',
    swatches: {
      base: 'background',
      elevated: 'surface',
      primary: 'text',
      secondary: 'secondary',
      tertiary: 'captions',
      live: 'status',
    },
    specimen: 'Design system',
    tryTheme: 'try a theme',
    copied: 'copied',
  },

  process: {
    step: 'step',
    steps: [
      {
        title: 'Analysis',
        text: 'I get into the task, the processes and the timeline. If it is not a fit or an off-the-shelf service solves it, I say so right away.',
      },
      {
        title: 'Design',
        text: 'I build the design system and design screens with every state. Decisions are written down, not agreed verbally.',
      },
      {
        title: 'Code',
        text: 'I build the site on my own design and check every screen at every width before the client finds a bug.',
      },
      {
        title: 'Automation',
        text: 'I wire in bots, CRM integrations and AI agents that take routine off the team.',
      },
      {
        title: 'Handover',
        text: 'Documentation and training, so the project can grow without me.',
      },
    ],
  },

  about: {
    lead: "I'm Alexey, a designer and developer from Saint Petersburg. I build the whole product: from analysis and design to the website and automation, so nothing gets lost between contractors.",
    text: [
      'I start with the system, not the screens: tokens, components, states, rules. Once the foundation is solid, a new screen takes hours and the product does not fall apart as it grows.',
      'Design, code and automation in one pair of hands: the layout is built to be implemented, and bots and integrations become part of the same product instead of being bolted on.',
    ],
    timeline: [
      {
        when: 'since 2025',
        title: 'TITAN-2 holding',
        text: 'Design of internal products: admin panels, employee services, BI dashboards, corporate websites.',
      },
      {
        when: '2024–2025',
        title: 'EnterSales',
        text: 'Website design and automation for the studio’s clients: bots, email triage, Bitrix24 integrations.',
      },
      {
        when: 'since 2024',
        title: 'Freelance and own products',
        text: 'Websites, bots and AI assistants for businesses. My own product, MiMiMi AI, has 3,000+ users.',
      },
    ],
  },

  principles: [
    {
      title: 'The system beats the screen',
      text: 'One well-designed component saves dozens of redraws. Rules first, layouts second.',
    },
    {
      title: 'Decisions in writing',
      text: 'Data schemas, states, agreements: everything is written down. Verbal does not count.',
    },
    {
      title: 'A working product is the metric',
      text: 'A project is done when people use it, not when the mockup is delivered.',
    },
    {
      title: 'An honest “no”',
      text: 'If an off-the-shelf service solves the task, I will say so before we start.',
    },
  ],

  contact: {
    title: 'have a project in mind?',
    github: 'github',
    telegram: 'message on telegram',
    location: 'saint petersburg, utc+3',
    status: 'open to projects',
  },

  footer: {
    line: 'LEXANDRO · ux/ui, design systems, development',
    place: 'Alexey Sveshnikov · saint petersburg',
  },

  case: {
    back: 'all work',
    facts: {
      client: 'client',
      year: 'year',
      direction: 'discipline',
      stack: 'stack',
      site: 'website',
    },
    screens: 'screens',
    next: 'next case',
    viewer: 'Screenshot viewer',
    close: 'close',
    prev: 'Previous',
    nextShot: 'Next',
    shotTheme: { label: 'Screenshot theme', light: 'light', dark: 'dark' },
    credit: 'front end by',
  },
}
