'use client'

import { usePathname } from 'next/navigation'
import { splitPath } from '@/i18n/config'
import { getDict } from '@/i18n/dict'

/** Язык текущей страницы по адресу — для шапки, меню и подвала, которые живут в общем layout */
export function useLocale() {
  const { locale, rest } = splitPath(usePathname() ?? '/')
  return { locale, rest, t: getDict(locale) }
}
