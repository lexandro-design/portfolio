import type { CaseCopy } from './types'

const TITAN = 'TITAN-2'
const DEMO = 'All screenshots use demo data.'

export const en: Record<string, CaseCopy> = {
  parfumeria: {
    tagline: 'design system & frontend',
    lead: 'A perfume e-commerce store in Belarus: a design system, 450+ screens in Figma and a new Next.js frontend with the catalog served from Bitrix.',
    client: 'Parfumeria.by · e-commerce',
    sections: [
      {
        title: 'the task',
        body: [
          'The store runs on Aspro (1C-Bitrix), and Bitrix stays the source of data. The brief was a new design for the whole site and a frontend that does not depend on the Aspro template.',
        ],
      },
      {
        title: 'design',
        body: [
          'I started with the design system: colour, typography, a component library. On top of it I built 450+ screens, each at three breakpoints and with every state: empty, error, loading, out of stock.',
        ],
      },
      {
        title: 'frontend',
        body: [
          'The frontend is Next.js with the App Router and TypeScript, styled with CSS Modules. The catalog is connected headless: data comes from Aspro, and everything a customer sees is rendered by Next.js.',
          'Every screen was checked against the design side by side at 1440, 768 and 375 pixels. Search understands transliteration and keyboard layout and completes the query as you type. There is a slide-in cart, a catalog menu and sign-in by SMS.',
        ],
      },
    ],
    captions: [
      'Home, desktop.',
      'Catalog with filters and sorting.',
      'Product page.',
      'Search: suggestions and query completion.',
      'Slide-in cart.',
      'Catalog menu.',
      'Phone: home, product, cart.',
    ],
  },
  otrx: {
    tagline: 'cost estimate control',
    lead: 'Admin panel for a module that automatically validates cost estimate files for nuclear power plant construction. Screens assembled with my own Figma Plugin API scripts.',
    client: `${TITAN} · internal product`,
    sections: [
      {
        title: 'the task',
        body: [
          'The module checks OTRX cost estimate files and is built into the corporate document management system. It needed an admin panel: a separate web app where checks are run and rules are configured.',
        ],
      },
      {
        title: 'the admin panel',
        body: [
          'A registry of checks, rules and controls, a rule form, user management and an “Access denied” screen for those whose Keycloak role does not let them in.',
        ],
      },
      {
        title: 'how it went',
        body: [
          'The project changed several times. First came four versions of an HTML prototype. Then I moved the screens to Figma and assembled them with my own Figma Plugin API scripts: a script takes components from the library, builds the screen, lays out the canvas and binds styles. The scripts are idempotent, so a second run rebuilds a screen instead of duplicating it.',
          'The first build used local components; later I rebuilt every screen on the AIPlan-R design system library. After a meeting with the client I reworked navigation: a project panel on the left, tabs, modal windows. Changes went in as non-destructive versions, so the full project history is preserved.',
        ],
      },
    ],
    captions: [],
    note: DEMO,
  },
  'meeting-rooms': {
    title: 'Meeting Rooms',
    tagline: 'booking service',
    lead: 'An internal service for booking meeting rooms across the holding. Two roles, every screen state, delivered to spec.',
    client: `${TITAN} · internal service`,
    sections: [
      {
        title: 'two roles',
        body: [
          'An employee picks a room from a filterable list, checks the schedule on the room page, creates and edits a booking. “My bookings” shows upcoming, current, finished and cancelled ones.',
          'An administrator manages rooms, bookings and equipment and sees the statistics.',
        ],
      },
      {
        title: 'states and rules',
        body: [
          'Every section has loading, empty, error and all dialogs. Rules from the spec: rooms are available by the user’s location, working hours are 08:00 to 20:00, notifications live inside the app, the profile comes from the Keycloak token, and there are 403 and 404 pages.',
        ],
      },
      {
        title: 'how it was built',
        body: [
          'Screens were assembled by my own Figma Plugin API scripts from live components. Frames follow a “route · role · state” naming scheme, so the name alone tells you which screen it is and for whom.',
        ],
      },
    ],
    captions: [
      'Meeting room list with filters.',
      'Room page with schedule.',
      'New booking.',
      'My bookings.',
      'Admin: rooms.',
      'Admin: statistics.',
      'Booking cancellation dialog.',
    ],
    note: DEMO,
  },
  'ai-translator': {
    tagline: 'translation for legal teams',
    lead: 'An AI translator for a legal translation team: documents for international nuclear projects, refining the translation in plain words in a chat.',
    client: `${TITAN} · legal translation`,
    sections: [
      {
        title: 'the solution',
        body: [
          'I designed the interface as a chat. Paste text or upload a document, get a translation and refine it in plain words, for example “make it more formal”. The source language is detected automatically, you only pick the target. If the translation does not work, alternative versions are one click away.',
          'Glossaries and language-pair sets are applied automatically. There are two roles: an administrator works with translation, history and settings, a linguist only with translation and history.',
        ],
      },
      {
        title: 'the principle',
        body: [
          'Every interface element has to rest on a specific requirement in the spec. That is why I removed the dashboard and manual project selection.',
        ],
      },
    ],
    captions: [],
  },
  'pix-bi': {
    tagline: 'reporting dashboards',
    lead: 'PIX BI dashboards for the nuclear industry: a contract security report with five urgency levels and project KPI calculation.',
    client: `${TITAN} · reporting`,
    sections: [
      {
        title: 'contract security',
        body: [
          'The report has 6 screens and a reference board: overview, detailed report, analytics, contract card, empty state and a reference table.',
          'Contracts are split into five urgency levels: overdue, under 30 days, 30 to 60, 60 to 90 and unsecured. A monthly chart breaks obligations down by type: advance return, performance, warranty.',
        ],
      },
      {
        title: 'handover-ready',
        body: [
          'The file is ready to hand over: 1200+ text layers on styles, screens on auto layout, linked into a prototype.',
        ],
      },
    ],
    captions: ['KPI calculation: project passport dashboards.'],
    note: DEMO,
  },
  'meg-site': {
    title: 'MEG website',
    tagline: 'corporate website',
    lead: 'A corporate website for an engineering company in the TITAN-2 holding: eight pages, a React prototype on real content and the design in Figma.',
    client: 'Max Engineering Group',
    sections: [
      {
        title: 'what was done',
        body: [
          'Eight pages: home, services, about, complaints and appeals, documents, testimonials, for suppliers and contacts.',
          'I built a clickable React prototype and filled it with the client’s real content right away: the spec, the services deck, ISO and GOST certificates, testimonials including ones from international clients. In parallel I designed the site in Figma and checked the layouts against the content.',
        ],
      },
    ],
    captions: [],
  },
  'vacation-plan': {
    title: 'Vacation Planner',
    tagline: 'HR tool',
    lead: 'An interactive vacation planning prototype: three roles, full CRUD for employees and positions.',
    client: `${TITAN} · HR`,
    sections: [
      {
        title: 'what was done',
        body: [
          'Two pages: the vacation table and settings. Three roles: head administrator, local administrator and user.',
          'Employees and positions can be added, edited and deleted: modal windows, validation, confirmations, notifications. The table sorts and paginates. The prototype is a single HTML, CSS and JavaScript file; development continues in Angular.',
        ],
      },
    ],
    captions: [],
  },
  foodmarket: {
    tagline: 'two AI assistants',
    lead: 'An external bot for customers and an internal assistant for the warehouse and sales team: one infrastructure, models and data hosted in Russia.',
    client: 'FoodMarket · distributor',
    sections: [
      {
        title: 'the task',
        body: [
          'A food distributor: customers wait for answers in messengers, warehouse staff search a huge catalog by hand, managers spend time verifying customers and creating deals. By law all data has to be stored in Russia.',
        ],
      },
      {
        title: 'the solution',
        body: [
          'The customer bot classifies intent, verifies the customer by phone number in Bitrix24, runs scripted dialogues and hands complex cases over to a human manager.',
          'The internal assistant searches the catalog with a direct SQL query to MySQL, without extra model calls, and answers questions on internal regulations through RAG on Supabase. Access is role-based. Requests are routed between a cheaper and a stronger model, and answers are cached.',
        ],
      },
    ],
    captions: [],
  },
  mimimibot: {
    tagline: 'AI photoshoots in Telegram',
    lead: 'My own product: a Telegram bot for AI photoshoots with the user’s digital twin, payments and content that changes without touching the code.',
    client: 'own product',
    sections: [
      {
        title: 'how it works',
        body: [
          'You scroll a carousel of ready-made shots by category and tap “Generate this shot” or “Generate the whole photoshoot”. To get your own face on the shots, you first create a digital twin: a name, 10 to 20 of your photos and appearance settings.',
          'Several image models to choose from. Separate modes: generation from Pinterest references, filters, make-up and hairstyles, and a “god mode” with advanced settings.',
        ],
      },
      {
        title: 'under the hood',
        body: [
          'I built the bot’s server logic and generation orchestration, integrated the generative model APIs and payments via YooKassa. The model is freemium. Prompts by category live in PostgreSQL, carousel photos in Storage.',
          'All content lives in the database: presets, texts, buttons and images are edited without touching the code, so the bot can be retargeted to another niche without a developer.',
        ],
      },
    ],
    captions: [],
  },
  'brain-search': {
    tagline: 'knowledge base search',
    lead: 'A local MCP server that searches my knowledge base by meaning. I plug it into my development tools as a tool.',
    client: 'personal tool',
    sections: [
      {
        title: 'how it works',
        body: [
          'A Python server talks MCP. The database is SQLite: an FTS5 full-text index and embedding vectors in one file. Embeddings are computed locally by Ollama, and only the fragments found leave the machine.',
          'Search is hybrid: cosine similarity over vectors plus BM25 over the full-text index, merged with Reciprocal Rank Fusion. The index holds about 17 thousand fragments: notes, project documents and conversation history. Indexing is incremental by file hash, so only what changed is reindexed.',
        ],
      },
    ],
    captions: [],
  },
  jarvis: {
    tagline: 'personal assistant',
    lead: 'My assistant in Telegram: understands text and voice, schedules reminders and remembers tasks.',
    client: 'personal project',
    sections: [
      {
        title: 'under the hood',
        body: [
          'Voice messages are transcribed by Whisper, answers come from GPT. I built the server logic and the scheduler: reminders run on a schedule, Moscow time is converted to UTC. The assistant’s memory and tasks are stored in my PostgreSQL schema.',
          'It is a personal project, currently on pause.',
        ],
      },
    ],
    captions: [],
  },
}
