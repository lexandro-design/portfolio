import { getCase } from '@/content/cases-i18n'
import { contacts } from '@/content/site'
import { HTML_LANG, localePath, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'
import { absolute } from './meta'

/** Автор сайта: один и тот же узел на главной и в кейсах, поисковик склеивает их по @id */
const person = (locale: Locale) => ({
  '@type': 'Person',
  '@id': `${absolute('/')}#person`,
  name: getDict(locale).meta.caseTitle,
  alternateName: 'LEXANDRO',
  url: absolute('/'),
  image: absolute('/me/photo.jpg'),
  email: `mailto:${contacts.email}`,
  sameAs: [contacts.telegram, contacts.github, contacts.behance],
})

/** Разметка главной: сайт и страница-профиль автора */
export function homeLd(locale: Locale) {
  const t = getDict(locale)
  const url = absolute(localePath(locale, '/'))
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${absolute('/')}#site`, name: 'LEXANDRO', url: absolute('/'), inLanguage: HTML_LANG[locale] },
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: HTML_LANG[locale],
        isPartOf: { '@id': `${absolute('/')}#site` },
        mainEntity: person(locale),
      },
    ],
  }
}

/** Разметка кейса: работа с автором и путь «главная → кейс» */
export function caseLd(locale: Locale, slug: string) {
  const item = getCase(locale, slug)
  if (!item) return null
  const url = absolute(localePath(locale, `/cases/${slug}/`))
  const year = /^\d{4}$/.test(String(item.year)) ? { dateCreated: String(item.year) } : {}
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        url,
        name: item.title,
        headline: item.tagline,
        description: item.lead,
        image: absolute(`/og/${slug}.jpg`),
        inLanguage: HTML_LANG[locale],
        keywords: item.stack.join(', '),
        ...year,
        author: person(locale),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'LEXANDRO', item: absolute(localePath(locale, '/')) },
          { '@type': 'ListItem', position: 2, name: item.title, item: url },
        ],
      },
    ],
  }
}
