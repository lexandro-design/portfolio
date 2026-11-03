import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { caseColor } from '@/content/cases'
import { getCase, getCases } from '@/content/cases-i18n'
import { HTML_LANG, localePath, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'
import { flowOf } from '@/content/flows'
import { getShowcase } from '@/content/showcase'
import { Brief } from './Brief/Brief'
import { CaseBody } from './CaseBody'
import { ChapterRail } from './ChapterRail'
import { Showcase, chapterId } from './Showcase/Showcase'
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
  const show = getShowcase(locale, slug)
  const chapters = (show?.blocks ?? []).map((b, i) => ({ id: chapterId(i), title: b.title }))
  // Разделы текста, ставшие пояснением к главам, в хвосте не повторяются
  const used = (show?.blocks ?? []).flatMap((b) => (b.section === undefined ? [] : [b.section]))

  return (
    <div
      lang={HTML_LANG[locale]}
      data-case
      data-shots="light"
      style={caseColor(slug) ? ({ '--case-color': caseColor(slug) } as CSSProperties) : undefined}
    >
      <CaseHero
        item={item}
        index={index + 1}
        total={items.length}
        t={t.case}
        directions={t.works.directions}
        backHref={localePath(locale, '/#works')}
        chapters={chapters}
        flow={flowOf(item, show)}
      />
      {show && <Brief brief={show.brief} t={t.case.brief} />}
      {show && <Showcase data={show} item={item} t={t.case.show} />}
      <CaseBody item={item} t={t.case} used={used} />
      {chapters.length > 1 && <ChapterRail chapters={chapters} label={t.case.toc} />}
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
