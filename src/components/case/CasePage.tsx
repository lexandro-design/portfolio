import { notFound } from 'next/navigation'
import { getCase, getCases } from '@/content/cases-i18n'
import { HTML_LANG, localePath, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'
import { CaseBody } from './CaseBody'
import { CaseHero } from './CaseHero'
import { Lightbox } from './Lightbox'
import { NextCase } from './NextCase'

/** Страница кейса на любом языке */
export function CasePage({ locale, slug }: { locale: Locale; slug: string }) {
  const item = getCase(locale, slug)
  if (!item) notFound()

  const t = getDict(locale)
  const items = getCases(locale)
  const index = items.findIndex((c) => c.slug === slug)
  const next = items[(index + 1) % items.length]

  return (
    <div lang={HTML_LANG[locale]} data-case data-shots="light">
      <CaseHero
        item={item}
        index={index + 1}
        total={items.length}
        t={t.case}
        directions={t.works.directions}
        backHref={localePath(locale, '/#works')}
      />
      <CaseBody item={item} t={t.case} />
      <NextCase
        item={next}
        index={items.indexOf(next) + 1}
        total={items.length}
        href={localePath(locale, `/cases/${next.slug}/`)}
        label={t.case.next}
      />
      {item.shots.length > 0 && (
        <Lightbox
          labels={{
            viewer: t.case.viewer,
            close: t.case.close,
            prev: t.case.prev,
            next: t.case.nextShot,
          }}
        />
      )}
    </div>
  )
}
