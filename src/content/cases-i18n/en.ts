import type { CaseCopy } from './types'

const TITAN = 'TITAN-2'
const DEMO = 'All screenshots use demo data.'
const FIGMA_FILE = 'The whole Figma file.'

export const en: Record<string, CaseCopy> = {
  parfumeria: {
    tagline: 'design system & the whole site',
    lead: 'A perfume and cosmetics store in Belarus: a design system from scratch and 450+ screens at three widths with every state.',
    client: 'Parfumeria.by · e-commerce, Belarus',
    sections: [
      {
        title: 'the task',
        body: [
          'The store needed a new design for the whole site: from the home page and catalog to the cart, checkout and account. Most people shop from their phones, so the mobile version is worked out in as much detail as desktop.',
        ],
      },
      {
        title: 'design system',
        body: [
          'I started with the system: colour and type in variables, a documented component library, badges, product cards in several layouts. Every screen is built only from it, so a change to a component reaches every screen at once.',
        ],
      },
      {
        title: 'screens',
        body: [
          '450+ screens at 1440, 768 and 375: catalog by category with filters and sorting, a product page with reviews and back-in-stock alerts, search with suggestions, cart, checkout with courier and pickup, SMS sign-in, account, gift cards, brands, promotions and stores on a map.',
          'Every flow has empty, error, loading and out-of-stock states, so developers never have to invent them.',
        ],
      },
    ],
    captions: [
      'Home.',
      'Perfume catalog.',
      'Product page.',
      'Phone: home, catalog, cart.',
      'Search with suggestions.',
      'Cart.',
      'Gift card: choosing a design.',
      'Brand page.',
      'Checkout.',
      'Account: orders.',
      'Tablet: home.',
      FIGMA_FILE,
    ],
  },
  'meeting-rooms': {
    title: 'Meeting Rooms',
    tagline: 'booking service',
    lead: 'Internal service for booking meeting rooms across the holding. Two roles, 60+ screens with every state, delivered to spec.',
    client: `${TITAN} · internal service`,
    sections: [
      {
        title: 'two roles',
        body: [
          'An employee picks a room from a filtered list, checks its schedule, creates and edits bookings. “My bookings” shows upcoming, current, finished and cancelled ones.',
          'An admin manages rooms, bookings and equipment and sees the statistics.',
        ],
      },
      {
        title: 'states and rules',
        body: [
          'Every section has loading, empty, error and all dialogs, including a time conflict while booking. Rules from the spec: rooms are available by the user’s location, working hours are 08:00 to 20:00, in-app notifications, 403 and 404 pages.',
        ],
      },
      {
        title: 'how the file is built',
        body: [
          'Every screen uses Taiga UI design system components. Frames are named “route · role · state”, so a developer knows from the name which screen it is and who it is for.',
        ],
      },
    ],
    captions: [
      'Room list with filters.',
      'New booking.',
      'Room card with schedule.',
      'My bookings.',
      'Admin: statistics.',
      'Admin: rooms.',
      'Time conflict while booking.',
      'Admin: new equipment.',
      'Empty list.',
      'Access denied.',
      FIGMA_FILE,
    ],
    note: DEMO,
  },
  mimimibot: {
    tagline: 'AI photoshoots in Telegram',
    lead: 'My product: a Telegram bot for AI photoshoots with a digital twin. 3,000+ users, in-bot payments and content the owner edits without a developer.',
    client: 'own product',
    sections: [
      {
        title: 'how it works',
        body: [
          'You scroll a carousel of ready-made shots by category and tap “Generate this shot” or “Generate the whole photoshoot”. To get your own face in the shots, you first create a digital twin: a name, 10 to 20 of your photos and a few appearance settings.',
          'Separate modes: generation from references, filters, makeup and hairstyles, advanced settings for those who want to control the shot themselves.',
        ],
      },
      {
        title: 'a platform, not a bot',
        body: [
          'All content lives in the database: generation presets and prompts, texts, buttons, images. The owner changes them in the admin panel and rebuilds the bot for a new niche without touching code.',
        ],
      },
      {
        title: 'under the hood',
        body: [
          'I wrote the logic myself: four linked processes — taking the request, the generation queue, payment and delivering the result. Payments through YooKassa: subscriptions, packs, refunds. Segmented broadcasts.',
          'Three sequential database queries at the start of a dialog became one PostgreSQL function: preparing a reply went from about two seconds to 60 milliseconds.',
        ],
      },
    ],
    captions: [],
    preview: {
      kind: 'chat',
      lines: [
        { from: 'bot', text: 'Pick a photoshoot category' },
        { from: 'user', text: 'Vacation' },
        { from: 'bot', text: 'Generate this shot or the whole photoshoot?' },
        { from: 'user', text: 'The whole photoshoot' },
      ],
    },
  },
  otrx: {
    tagline: 'cost estimate control',
    lead: 'Admin panel for a module that automatically validates cost estimate files for nuclear power plant construction: a registry, check cards in every status, rules and roles.',
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
          'A document registry, a check card in every status (not run, passed, failed, error, re-check, archived), module analytics, rule and notification settings, users and an “Access denied” screen for those whose role does not let them in.',
        ],
      },
      {
        title: 'how it went',
        body: [
          'The project changed several times. I built the first version on local components, then moved every screen onto the AIPlan-R design system library. After a meeting with the client I reworked the navigation: a project rail on the left, tabs, modal windows.',
        ],
      },
    ],
    captions: [
      'Document registry.',
      'Card: check failed.',
      'Card: check passed.',
      'Module analytics.',
      'Module settings.',
      'Adding a rule.',
      'Email with the check result.',
      'No file attached.',
      'Access denied.',
      FIGMA_FILE,
    ],
    note: DEMO,
  },
  'food-assistants': {
    title: 'AI assistants for a distributor',
    tagline: 'two bots, one base',
    lead: 'Two bots on one infrastructure: “Andrey” answers customers in the CRM chat, “Sofia” helps warehouse staff and managers. Data and models stay in Russia.',
    client: 'freelance · food distribution',
    sections: [
      {
        title: 'the task',
        body: [
          'Customers wait for answers in chat, the warehouse searches a large catalog by hand, managers spend time verifying customers and creating deals. By law, all data has to stay in Russia.',
        ],
      },
      {
        title: 'the solution',
        body: [
          '“Andrey” understands what a customer wants: find a product, ask about delivery, check a spec or call a manager. It onboards new customers and fills in the CRM lead itself: phone, city, business type. Hard cases go to a live manager.',
          '“Sofia” searches the catalog for the warehouse and answers questions about internal procedures from the knowledge base. Access differs by department.',
        ],
      },
      {
        title: 'the key move',
        body: [
          'Products are found with a direct SQL query over the catalog, without needless calls to a neural network: the model is used only where it is really needed. Simple requests go to a cheap model, complex ones to a strong one, answers are cached. The bot answers faster and costs less.',
        ],
      },
    ],
    captions: [],
    preview: {
      kind: 'chat',
      lines: [
        { from: 'user', text: 'do you have hot dog buns?' },
        { from: 'bot', text: 'Found matching products, here are cards with prices and SKUs' },
        { from: 'user', text: 'I want to place an order' },
        { from: 'bot', text: 'Passing you to a manager, they already see the chat' },
      ],
    },
  },
  'meg-site': {
    title: 'MEG',
    tagline: 'corporate website',
    lead: 'Corporate website for an engineering company in the TITAN-2 holding: ten pages, each at three widths — 1440, 834 and 393.',
    client: 'Max Engineering Group',
    sections: [
      {
        title: 'the task',
        body: [
          'A website to the client’s spec on real content: section texts, a services deck, ISO and GOST certificates, reviews, including ones from international customers.',
        ],
      },
      {
        title: 'what was done',
        body: [
          'Home, services with a page for each, about, documents, complaints and appeals, reviews, suppliers, workplace safety assessment, contacts and a maintenance page. Every page in desktop, tablet and phone versions.',
          'The request form follows the spec: service, supplier, site, equipment and deadlines. The suppliers page has a block with nuclear industry procurement resources.',
        ],
      },
    ],
    captions: [
      'Home.',
      'Service page.',
      'About.',
      'Phone: home, service, menu.',
      'Suppliers.',
      'Documents.',
      'Reviews.',
      'Complaints and appeals.',
      'Tablet: home.',
      FIGMA_FILE,
    ],
  },
  osq: {
    tagline: 'website & client portal',
    lead: 'One of the largest food packaging makers in the CIS: a home page with a live news feed, a scroll-animated promo page for the new OctoBox and a portal for wholesale clients.',
    client: 'EnterSales · OSQ Group, food packaging',
    sections: [
      {
        title: 'the task',
        body: [
          'OSQ was launching OctoBox, an eight-sided container made of cellulose board. They needed a page that shows the product through scroll animation rather than a wall of text. Along the way we refreshed the home page and built a portal for wholesale clients.',
        ],
      },
      {
        title: 'what was done',
        body: [
          'The OctoBox promo page: one screen, one message about the product; the composition changes as you scroll.',
          'The client portal: a dashboard with widgets (manager, orders, invoices, surveys), a catalog with search and cart, packaging sections, marketing materials to download, the client company’s staff with access rights.',
        ],
      },
    ],
    captions: [
      'Home with the news feed.',
      'OctoBox promo page.',
      'Portal: dashboard.',
      'Portal: catalog.',
      'Packaging for HoReCa.',
      'Marketing materials.',
      'Client staff.',
      'Phone: home.',
      'Portal sign-in.',
    ],
  },
  'ai-translator': {
    tagline: 'translation for legal teams',
    lead: 'An AI translator for a legal translation team: documents for international nuclear projects, refining a translation in plain words in a chat. Light and dark themes.',
    client: `${TITAN} · legal translation`,
    sections: [
      {
        title: 'the task',
        body: [
          'Translators work with contracts and regulations. They needed an interface where a translation relies on glossaries and a base of regulatory documents from the start, and scans are recognised automatically.',
        ],
      },
      {
        title: 'the solution',
        body: [
          'A chat interface. Paste text or upload a document, get a translation and refine it in plain words, like “make it more formal”. The source language is detected automatically, you only pick the target one. Alternative translations are one click away.',
          'Two roles: an admin works with translation, history and settings, a linguist with translation and history.',
        ],
      },
      {
        title: 'the principle',
        body: [
          'Every interface element has to rest on a specific requirement in the spec. That is why I removed the dashboard and manual project selection.',
        ],
      },
    ],
    captions: ['Start screen.', 'Translating a contract and refining it in chat.', FIGMA_FILE],
    note: DEMO,
  },
  svarnoy52: {
    title: 'Svarnoy 52',
    tagline: 'store on Tilda',
    lead: 'An online store for welding equipment in Nizhny Novgorod: design, a Tilda build with custom code and the whole catalog moved onto the site.',
    client: 'freelance · welding equipment',
    sections: [
      {
        title: 'the task',
        body: [
          'The company needed a store holding its whole range, not just a couple of showcases. Later the same owners ordered a second site, Svarprom NN.',
        ],
      },
      {
        title: 'what I did',
        body: [
          'The full cycle: structure, a Figma layout, graphics in Photoshop, the Tilda build. Where standard blocks fell short, I built with Zero Block and added code.',
          'I exported the client’s product base and moved it onto the site, so the catalog holds all the thousands of items with filters and product pages. Responsive layout, basic SEO, request forms.',
        ],
      },
    ],
    captions: [
      'Home.',
      'Catalog with filters.',
      'Phone: home, catalog, product.',
      'Product page.',
      'About.',
    ],
  },
  'packaging-bots': {
    title: 'AI bots for a packaging maker',
    tagline: 'sales, training, calls',
    lead: 'Three scenarios on one stack: a bot picks packaging and brings in leads, an internal bot trains staff, and call recordings turn into CRM deals on their own.',
    client: 'EnterSales · packaging manufacturer',
    sections: [
      {
        title: 'the task',
        body: [
          'First-line sales took a lot of managers’ time: first you figure out what the client is packing, only then pick the packaging. Add onboarding new staff and going through calls by hand. Data has to stay in Russia.',
        ],
      },
      {
        title: 'the solution',
        body: [
          'The customer bot identifies the product type, picks packaging from a vector base of the range, answers from price lists and documents and creates a CRM lead with the right request type.',
          'The internal bot trains staff on procedures and training scenarios, with access by department.',
          'Call recordings are transcribed, the name, phone and gist of the request are pulled out of the conversation, and the contact card and deal fill in themselves.',
        ],
      },
    ],
    captions: [],
    preview: {
      kind: 'flow',
      steps: ['client request', 'product type', 'match in base', 'lead in CRM'],
    },
  },
  'pix-bi': {
    tagline: 'reporting dashboards',
    lead: 'PIX BI dashboards for the nuclear industry: a “Contract security” report with five urgency levels and project KPI calculation.',
    client: `${TITAN} · reporting`,
    sections: [
      {
        title: 'contract security',
        body: [
          'The report has six screens and a reference board: overview, detailed report, analytics, contract card, empty state and a reference table.',
          'Contracts fall into five urgency levels: overdue, under 30 days, 30–60, 60–90 and unsecured. A monthly chart breaks obligations down by type: advance return, performance, warranty.',
        ],
      },
      {
        title: 'ready for handoff',
        body: [
          'The file is ready to hand over: 1200+ text layers on styles, screens on auto layout and linked into a prototype.',
        ],
      },
    ],
    captions: [
      'Overview.',
      'Detailed report.',
      'Analytics.',
      'Contract card.',
      'No data for these filters.',
      FIGMA_FILE,
    ],
    note: DEMO,
  },
  'ubiray-rf': {
    title: 'Ubiray.rf',
    tagline: 'community section',
    lead: 'A new section for a cleaning marketplace: a user profile with feed, career, photos and videos, at three widths.',
    client: 'EnterSales · Ubiray.rf, cleaning marketplace',
    sections: [
      {
        title: 'the task',
        body: [
          'The marketplace was adding a business community: users publish articles and news and run their own profile. The whole section was needed.',
        ],
      },
      {
        title: 'what I did',
        body: [
          'A profile with a cover, stats and “Message” and “Follow” buttons, four tabs with their own layouts — feed, career, photos, videos — posts in the feed and a contacts block. Responsive at 1440, 1200 and phone.',
        ],
      },
    ],
    captions: [
      'Profile: feed.',
      'Profile: photos.',
      'Phone: feed, photos, career.',
      'Profile: videos.',
      'Profile: career.',
      'Feed at 1200.',
    ],
  },
  'resort-bot': {
    title: 'AI bot for a holiday resort',
    tagline: 'booking in chat',
    lead: 'The bot picks dates, calculates the price, checks free cabins, books and creates a CRM deal. It runs entirely on the client’s server.',
    client: 'EnterSales · holiday resort',
    sections: [
      {
        title: 'how it works',
        body: [
          'A guest writes in chat, the bot asks for dates and the number of guests, checks free cabins and calculates the price. Questions about the resort are answered by searching its documents.',
          'The booking and lead are created in Bitrix24 through Open Channels, and the manager sees the whole conversation.',
        ],
      },
      {
        title: 'where it lives',
        body: [
          'Everything runs locally on the client’s server in Russia, in line with data law 152-FZ.',
        ],
      },
    ],
    captions: [],
    preview: {
      kind: 'chat',
      lines: [
        { from: 'user', text: 'We want a cabin for the weekend, four of us' },
        { from: 'bot', text: 'Checking free cabins for those dates and calculating the price' },
        { from: 'user', text: 'Book it' },
        { from: 'bot', text: 'Booked, a manager will call to confirm' },
      ],
    },
  },
  'vacation-plan': {
    title: 'Vacation Planner',
    tagline: 'HR service',
    lead: 'A corporate vacation planning service: a vacation table, settings and three roles. Screens checked on widths up to 3440.',
    client: `${TITAN} · HR`,
    sections: [
      {
        title: 'what was done',
        body: [
          'Two pages — the vacation plan and settings — for three roles: head admin, local admin and user.',
          'A design system on Taiga UI, component specs for developers and an implementation audit. Tables with frozen columns and double headers for dense data, eight modal variants, a notification popover, design-to-code checks and an acceptance checklist.',
        ],
      },
    ],
    captions: [
      'Vacation plan: admin.',
      'Settings: employees.',
      'Vacation plan: user.',
      'Settings: positions.',
      'The table on a 3440 monitor.',
      FIGMA_FILE,
    ],
    note: DEMO,
  },
  lotus: {
    tagline: 'restaurant website',
    lead: 'A concept website for an Asian restaurant in five breakpoints: 1440, 1280, 838, 697 and 375. The design is mine, the front end is by Nika.',
    client: 'concept · front end by Nika',
    sections: [
      {
        title: 'the idea',
        body: [
          'A project we did for ourselves, to take the design all the way to a live site. A dark palette with burgundy, large dish photos and the focus on booking a table.',
        ],
      },
      {
        title: 'pages',
        body: [
          'Home, About, a menu with “Main”, “Breakfast” and “Bar & wine” tabs and dish cards with nutrition facts, contacts with a map and a call-back form. Every page at five widths.',
        ],
      },
    ],
    captions: [
      'Project cover.',
      'Home.',
      'Menu.',
      'Phone: home, menu, contacts.',
      'About.',
      'Contacts.',
      'Tablet: home.',
    ],
  },
  'mail-to-crm': {
    title: 'Email that sorts itself into the CRM',
    tagline: 'inbox triage',
    lead: 'Incoming emails and attachments are classified automatically and land in the right funnel with the right owner. Managers no longer sort mail by hand.',
    client: 'EnterSales · packaging supplier',
    sections: [
      {
        title: 'the task',
        body: [
          'Requests arrived at a shared mailbox and managers moved them into the CRM by hand. Some emails got lost, some ended up in the wrong funnel.',
        ],
      },
      {
        title: 'how it works',
        body: [
          'Each email and its attachments are parsed automatically: the request type is detected — customer, supplier, spam and others — and a deal with the original email and an owner is created in the right Bitrix24 funnel. Duplicates are filtered out, statuses are tracked.',
        ],
      },
    ],
    captions: [],
    preview: { kind: 'flow', steps: ['email', 'request type', 'funnel', 'owner'] },
  },
  tetrasis: {
    tagline: 'bundle product page',
    lead: 'An appliance store added bundles. I reworked the product page so you see the whole bundle and what is in it, on desktop and phone.',
    client: 'EnterSales · Tetrasis, home appliances',
    sections: [
      {
        title: 'the task',
        body: [
          'A new category appeared in the catalog: appliance bundles. A shopper has to see right away what is in a bundle, what it costs and why it beats buying items separately.',
        ],
      },
      {
        title: 'what I did',
        body: [
          'A bundle page with its contents and total price, a page for an item from the bundle with a link back, promo badges, a set of action buttons for desktop and mobile and an updated catalog.',
          'For the same store I set up autoposting: news goes out to VK, Telegram and Dzen on schedule, without duplicates.',
        ],
      },
    ],
    captions: [
      'Bundle page.',
      'Item from a bundle.',
      'Phone: bundle, item, catalog.',
      'Catalog.',
      'Action buttons.',
    ],
  },
  reckon: {
    tagline: 'clothing brand store',
    lead: 'An online store for a streetwear brand: monochrome, a monospaced typeface, a lookbook on the home page and a Tilda cart extended with JavaScript.',
    client: 'freelance · clothing brand',
    sections: [
      {
        title: 'the task',
        body: [
          'The brand wanted a store in its own aesthetic: no usual coloured buttons and banners, the collection photos front and centre.',
        ],
      },
      {
        title: 'what I did',
        body: [
          'A home page with a lookbook, a product page with size selection, cart and checkout, delivery, an about page, the offer and privacy policy, and a phone version.',
          'I built the cart on Tilda and extended it with JavaScript for the store’s logic.',
        ],
      },
    ],
    captions: [
      'Home.',
      'Product page.',
      'Phone: home, product, cart.',
      'Product page, another variant.',
      'Campaign photo.',
    ],
  },
  'prof-study': {
    title: 'TITAN-2 career days',
    tagline: 'event landing page',
    lead: 'A landing page for the holding’s career guidance event for school and university students: how to take part, sponsored education, universities, professions and FAQ.',
    client: `${TITAN} · HR`,
    sections: [
      {
        title: 'what was done',
        body: [
          'The whole page design: a first screen with the application, steps to take part, a company block, universities, the holding’s professions, reviews from sponsored students, FAQ and contacts. Desktop, tablet and phone versions.',
        ],
      },
    ],
    captions: [
      'First screen.',
      'Steps to take part.',
      'Phone: first screen.',
      'Universities and professions.',
      'Reviews.',
      'FAQ and contacts.',
    ],
  },
  'svarprom-nn': {
    title: 'Svarprom NN',
    tagline: 'second store on Tilda',
    lead: 'A second site for the same owners as Svarnoy 52: its own visual key, the same approach to the catalog.',
    client: 'freelance · welding equipment',
    sections: [
      {
        title: 'what I did',
        body: [
          'A site fully on Tilda: standard blocks, Zero Block and custom code. A dark blue palette with orange, so it does not repeat Svarnoy 52.',
          'Moved the product catalog, wrote the About texts, collected reviews and reworked the first screen. Responsive for phones.',
        ],
      },
    ],
    captions: ['Home.', 'Catalog.', 'Phone: home, catalog, about.', 'Product page.', 'About.'],
  },
  'art-school': {
    title: 'AI assistant for an art school',
    tagline: 'drawing review',
    lead: 'A student sends a photo of a drawing, the bot compares it with the teacher’s reference works and says what to fix. The teacher gets an already improved piece.',
    client: 'freelance · art school',
    sections: [
      {
        title: 'how it works',
        body: [
          'Review in two steps. First the student shows the drawing to the bot and fixes it based on its notes, then sends it to the teacher, who reviews the final version.',
          'The drawing is compared with the teacher’s reference works, and a vision model writes specific notes: composition, proportions, light and shade.',
        ],
      },
    ],
    captions: [],
    preview: {
      kind: 'chat',
      lines: [
        { from: 'user', text: 'Photo of my drawing' },
        {
          from: 'bot',
          text: 'Compared with the reference: fix the head proportions and the shadow direction',
        },
        { from: 'user', text: 'Fixed it' },
        { from: 'bot', text: 'Now you can send it to your teacher' },
      ],
    },
  },
  'brain-search': {
    tagline: 'knowledge base search',
    lead: 'A local server that searches my knowledge base by meaning. I plug it into my working tools.',
    client: 'personal tool',
    sections: [
      {
        title: 'how it works',
        body: [
          'A Python server talks MCP. The database is SQLite: an FTS5 full-text index and embedding vectors in one file. Embeddings are computed locally, and only the fragments found ever leave the machine.',
          'Search is hybrid: vector similarity and BM25 over the full-text index, merged with Reciprocal Rank Fusion. The index holds about 17,000 fragments: notes, project documents and chat history. Only what changed gets reindexed.',
        ],
      },
    ],
    captions: [],
    preview: { kind: 'flow', steps: ['question', 'vectors + BM25', 'RRF merge', 'fragments'] },
  },
  'salon-booking': {
    title: 'Online booking for salons and clinics',
    tagline: 'booking bot',
    lead: 'The bot shows the nearest days and free slots as buttons, books the client and sends a reminder before the visit. Runs locally, in line with 152-FZ.',
    client: 'freelance · beauty salons and dental clinics',
    sections: [
      {
        title: 'how it works',
        body: [
          'The client picks a service, the bot shows the nearest days and free slots as buttons. Once booked, the slot closes for others, and the client gets a reminder before the visit.',
        ],
      },
    ],
    captions: [],
    preview: { kind: 'flow', steps: ['service', 'free slots', 'booking', 'reminder'] },
  },
  'team-reports': {
    title: 'Staff reports in WhatsApp',
    tagline: 'collection and KPI',
    lead: 'Staff send reports in WhatsApp, the bot puts them into a table, catches filling errors and builds a monthly KPI report.',
    client: 'freelance',
    sections: [
      {
        title: 'how it works',
        body: [
          'A report arrives as a message, the bot parses it into fields and writes it to the table. If something is missing or malformed, it asks to fix it right away. At the start of the month a KPI summary is built. Runs locally, in line with 152-FZ.',
        ],
      },
    ],
    captions: [],
    preview: { kind: 'flow', steps: ['message', 'field check', 'table', 'KPI report'] },
  },
  'fitness-bot': {
    title: 'Fitness bot',
    tagline: 'tracker in Telegram',
    lead: 'Workouts, weight, diet and calories, recipes and tips, reminders and weekly progress reports.',
    client: 'freelance',
    sections: [
      {
        title: 'what it does',
        body: [
          'Logs workouts, weight and diet, counts calories, suggests recipes and looks into complaints about how you feel. Sends a progress report every week, and the owner can export the data.',
        ],
      },
    ],
    captions: [],
    preview: { kind: 'flow', steps: ['log', 'count', 'tips', 'weekly report'] },
  },
  'dice-bots': {
    title: 'Telegram mini-game bots',
    tagline: 'two projects',
    lead: 'Dice games with bets inside Telegram: player statistics, a database and reports for the owner.',
    client: 'freelance',
    sections: [
      {
        title: 'under the hood',
        body: [
          'Two bots with games on Telegram’s built-in dice: bets, result calculation, statistics for every player and reports for the owner from the database.',
        ],
      },
    ],
    captions: [],
    preview: { kind: 'flow', steps: ['bet', 'roll', 'result', 'stats'] },
  },
  'media-to-rag': {
    title: 'Video and voice into a knowledge base',
    tagline: 'data prep for RAG',
    lead: 'Files from Yandex Disk are converted, transcribed, split into fragments and loaded into a vector database. Runs locally, in line with 152-FZ.',
    client: 'freelance',
    sections: [
      {
        title: 'how it works',
        body: [
          'New videos and voice notes on Yandex Disk are picked up automatically, converted and transcribed. The text is split into fragments, each gets an embedding, and everything goes into the vector database the assistant answers from.',
        ],
      },
    ],
    captions: [],
    preview: {
      kind: 'flow',
      steps: ['Yandex Disk', 'transcript', 'embeddings', 'knowledge base'],
    },
  },
}
