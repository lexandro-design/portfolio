import type { Locale } from '@/i18n/config'
import { overlay } from './showcase'
import en from './data/scenes-i18n/en.json'
import ja from './data/scenes-i18n/ja.json'
import zh from './data/scenes-i18n/zh.json'
import artSchool from './data/scenes/art-school.json'
import channelPipeline from './data/scenes/channel-pipeline.json'
import diceBots from './data/scenes/dice-bots.json'
import fitnessBot from './data/scenes/fitness-bot.json'
import foodAssistants from './data/scenes/food-assistants.json'
import leadAgent from './data/scenes/lead-agent.json'
import mailToCrm from './data/scenes/mail-to-crm.json'
import mediaToRag from './data/scenes/media-to-rag.json'
import mimimibot from './data/scenes/mimimibot.json'
import packagingBots from './data/scenes/packaging-bots.json'
import prosoft from './data/scenes/prosoft.json'
import ragMentor from './data/scenes/rag-mentor.json'
import relayDesk from './data/scenes/relay-desk.json'
import resortBot from './data/scenes/resort-bot.json'
import salonBooking from './data/scenes/salon-booking.json'
import teamReports from './data/scenes/team-reports.json'
import tgAssistant from './data/scenes/tg-assistant.json'
import uniBot from './data/scenes/uni-bot.json'

/**
 * Данные сцен кейсов: тексты сообщений, строки таблиц, подписи шагов.
 * У каждой сцены свой файл и своя форма, компонент сцены сам знает, что
 * в нём лежит. Переводы накладываются по тем же ключам, как у плееров;
 * чего в переводе нет, остаётся по-русски. Только то, что есть в коде ботов
 */
type Data = Record<string, unknown>

const RU: Record<string, Data> = {
  'art-school': artSchool,
  'channel-pipeline': channelPipeline,
  'dice-bots': diceBots,
  'fitness-bot': fitnessBot,
  'food-assistants': foodAssistants,
  'lead-agent': leadAgent,
  'mail-to-crm': mailToCrm,
  'media-to-rag': mediaToRag,
  mimimibot,
  'packaging-bots': packagingBots,
  prosoft,
  'rag-mentor': ragMentor,
  'relay-desk': relayDesk,
  'resort-bot': resortBot,
  'salon-booking': salonBooking,
  'team-reports': teamReports,
  'tg-assistant': tgAssistant,
  'uni-bot': uniBot,
}

const COPY: Partial<Record<Locale, Record<string, Data>>> = { en, zh, ja }

export const SCENE_SLUGS = Object.keys(RU)

export function getScene(locale: Locale, slug: string): Data | null {
  const base = RU[slug]
  if (!base) return null
  const tr = COPY[locale]?.[slug]
  return tr ? overlay(base, tr) : base
}
