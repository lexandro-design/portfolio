import type { Locale } from '../config'
import { en } from './en'
import { ja } from './ja'
import { ru } from './ru'
import type { Dict } from './types'
import { zh } from './zh'

export type { Dict } from './types'

const DICTS: Record<Locale, Dict> = { ru, en, zh, ja }

export const getDict = (locale: Locale): Dict => DICTS[locale]
