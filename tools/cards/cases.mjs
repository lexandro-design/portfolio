// Кейсы для картинок — из того же источника, что сайт. Номер — место в общем списке.
// Профиль GitHub на английском: названия и лиды кейсов здесь
import { cases as all } from '../../src/content/cases.ts'

const EN = {
  parfumeria: [
    'Parfumeria.by',
    'design system & frontend',
    'Perfume e-commerce in Belarus: a design system, 450+ screens in Figma and a new Next.js frontend on top of the Bitrix catalog.',
  ],
  otrx: [
    'OTRX',
    'cost estimate control',
    'Admin panel for a module that validates cost estimate files for nuclear power plant construction.',
  ],
  'meeting-rooms': [
    'Meeting Rooms',
    'booking service',
    'Internal service for booking meeting rooms across the holding. Two roles, every screen state, delivered to spec.',
  ],
  'ai-translator': [
    'AI Translator',
    'translation for legal teams',
    'Chat-based AI translator for a legal translation team working on international NPP projects.',
  ],
  'pix-bi': [
    'PIX BI',
    'reporting dashboards',
    'Dashboards for the nuclear industry: contract security with five urgency levels and project KPIs.',
  ],
  'meg-site': [
    'MEG',
    'corporate website',
    'Eight-page website for an engineering company: React prototype on real content, design in Figma.',
  ],
  'vacation-plan': [
    'Vacation Planner',
    'HR tool',
    'Interactive vacation planning prototype: three roles, full CRUD for employees and positions.',
  ],
  foodmarket: [
    'FoodMarket',
    'two AI assistants',
    'A customer bot and an internal assistant for the warehouse on one infrastructure, data hosted in Russia.',
  ],
  mimimibot: [
    'MiMiMi AI',
    'AI photoshoots in Telegram',
    'My product: a Telegram bot for AI photoshoots with a digital twin, payments and content editable without code.',
  ],
  'brain-search': [
    'brain-search',
    'knowledge base search',
    'Local MCP server for semantic search across my knowledge base: hybrid BM25 and vector ranking.',
  ],
  jarvis: [
    'Jarvis',
    'personal assistant',
    'My Telegram assistant: understands text and voice, schedules reminders, remembers tasks.',
  ],
}

const STACK_EN = {
  'HTML-прототипы': 'HTML prototypes',
  '1С-Битрикс (Aspro)': '1C-Bitrix (Aspro)',
  'API генеративных моделей': 'generative model APIs',
  'AIPlan-R (Taiga UI)': 'AIPlan-R design system',
  'Supabase (PostgreSQL, Storage)': 'Supabase',
  'OpenAI API (GPT, Whisper)': 'OpenAI API',
}

export const cases = all.map((c, i) => ({ ...c, index: i + 1 }))

export const casesEn = cases.map((c) => {
  const [title, tagline, lead] = EN[c.slug]
  return {
    ...c,
    title,
    tagline,
    lead,
    stack: c.stack.filter((s) => s !== 'Taiga UI').map((s) => STACK_EN[s] ?? s),
  }
})
