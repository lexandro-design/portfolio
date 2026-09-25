import type { Dict } from './types'

export const en: Dict = {
  meta: {
    title: 'Alexey Sveshnikov · UX/UI and design systems',
    description:
      'Designer and developer: interfaces built on well-thought-out design systems in Figma and shipped in Next.js, plus automation and AI services.',
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
    metaLeft: ['LEXANDRO · saint petersburg', 'ux/ui · design systems · development'],
    title: ['Design systems', 'that work for you,'],
    accent: ['not against you.'],
    body: 'I design interfaces on systems where every token, component and state is decided up front, then take them all the way to production code. Currently building internal products for the TITAN-2 holding.',
    primary: 'discuss a project',
    secondary: 'see the work',
    ticker: 'now working on:',
    scroll: 'scroll down',
    photoAlt: 'Alexey Sveshnikov on an embankment in Saint Petersburg',
    photoCaption: "that's me · saint petersburg",
  },

  sections: {
    services: { label: 'services', title: 'what I do', aside: 'three disciplines · one person' },
    works: { label: 'work', title: 'selected work', aside: 'TITAN-2, clients and my own products' },
    system: {
      label: 'system',
      title: 'what this site runs on',
      aside: 'three themes · one set of tokens',
    },
    process: { label: 'process', title: 'how I work', aside: 'five steps · no surprises' },
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
      tags: ['ux/ui', 'design systems', 'design tokens', 'figma', 'plugin api'],
      filter: 'design',
    },
    {
      code: 'web',
      title: 'Websites and frontend',
      text: 'Websites and web apps in Next.js and React with TypeScript, from pixel-accurate layout to a headless catalog from a CMS. Every screen is checked against the design at every breakpoint.',
      tags: ['react', 'next.js', 'typescript', 'css modules', 'headless cms'],
      filter: 'web',
    },
    {
      code: 'automation',
      title: 'Automation and AI',
      text: 'Telegram bots, CRM and payment integrations, PostgreSQL databases, RAG search and AI assistants.',
      tags: ['postgresql', 'supabase', 'telegram api', 'rag', 'ai agents', 'bitrix24'],
      filter: 'ai',
    },
  ],
  servicesMore: 'see projects',

  works: {
    all: 'all',
    directions: { design: 'design', web: 'web', ai: 'automation / ai' },
    read: 'read the case',
    rest: 'more projects · screens under NDA or in progress',
  },

  system: {
    intro:
      'This site is built the way I build products: colour, type, spacing and motion are tokens, and components refer to nothing else. Switch the theme in the header: token values change, and not a single component is touched.',
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
  },

  process: {
    step: 'step',
    steps: [
      {
        title: 'Brief',
        text: 'I get into the task and the timeline. If it is not a fit, I say so right away.',
      },
      {
        title: 'System',
        text: 'I lay the foundation: data, states, tokens and components. Decisions are written down, not agreed verbally.',
      },
      {
        title: 'Interface',
        text: 'I design screens from the components of the system. Routine work in Figma runs on my own scripts.',
      },
      {
        title: 'Code',
        text: 'I ship a working product and check it against the design at every breakpoint before the client finds a bug.',
      },
      {
        title: 'Handover',
        text: 'Documentation and a record of decisions, so the project can grow without me.',
      },
    ],
  },

  about: {
    lead: "I'm Alexey, a designer and developer from Saint Petersburg. I design interfaces and build them myself, so my layouts never contain decisions that cannot be coded.",
    text: [
      'I start with the system, not the screens: tokens, components, states, rules. Once the foundation is solid, a new screen takes hours and the product does not fall apart as it grows.',
      'I automate the routine: Figma screens are assembled by my own Plugin API scripts, and every page of a site is checked against the design side by side at three widths.',
    ],
    timeline: [
      {
        when: 'since 2025',
        title: 'TITAN-2 holding',
        text: 'Internal products: admin panels, employee services, BI dashboards, a corporate website.',
      },
      {
        when: 'since 2024',
        title: 'Freelance',
        text: 'Websites, Telegram bots, integrations and AI assistants for businesses. The largest is Parfumeria.by.',
      },
      {
        when: 'my own',
        title: 'Products',
        text: 'MiMiMi AI, brain-search, Jarvis: ideas I build and test on myself.',
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
  },
}
