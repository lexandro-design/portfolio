import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { caseColor } from '@/content/cases'
import { getCase, getCases } from '@/content/cases-i18n'
import { HTML_LANG, localePath, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'
import { liveOf } from '@/content/flows'
import { paceOf } from '@/content/pace'
import { getShowcase } from '@/content/showcase'
import { getCast } from '@/content/casts'
import { getScene } from '@/content/scenes'
import { SCENES } from './Scenes'
import { Brief } from './Brief/Brief'
import { CaseBody } from './CaseBody'
import { CaseCta } from './CaseCta'
import { ChapterRail } from './ChapterRail'
import { Showcase, chapterId } from './Showcase/Showcase'
import { CaseHero } from './CaseHero'
import { Lightbox } from './Lightbox'
import { NextCase } from './NextCase'

/** Разделы, которые почти дословно повторяют блок «Коротко»: дважды одно и то же не показываем */
const SAID: Record<string, number[]> = { 'meeting-rooms': [2], lotus: [0], 'tg-assistant': [0], 'ai-console': [0] }

/** Страница кейса на любом языке */
export function CasePage({ locale, slug }: { locale: Locale; slug: string }) {
  const item = getCase(locale, slug)
  if (!item) notFound()

  const t = getDict(locale)
  const items = getCases(locale)
  const index = items.findIndex((c) => c.slug === slug)
  const next = items[(index + 1) % items.length]
  const show = getShowcase(locale, slug)
  const cast = getCast(locale, slug)
  const pace = paceOf(item, show)
  const chapters = (show?.blocks ?? []).map((b, i) => ({ id: chapterId(i), title: b.title }))
  // Разделы текста, ставшие пояснением к главам, в хвосте не повторяются
  const used = (show?.blocks ?? []).flatMap((b) => (b.section === undefined ? [] : [b.section]))
  // Задача уже сказана в блоке «Коротко»
  if (show) {
    const task = t.case.brief.task.toLowerCase()
    used.push(...item.sections.flatMap((s, i) => (s.title.toLowerCase() === task ? [i] : [])))
  }

  used.push(...(SAID[slug] ?? []))

  // Кейс со своей сценой: она стоит вместо шапки, «Коротко» и плеера первой главы
  const Scene = SCENES[slug]
  const scene = Scene ? getScene(locale, slug) : null
  // Увеличение по нажатию нужно и кадрам из shots, и отдельным иллюстрациям в главах
  const zoom = item.shots.length > 0 || (show?.blocks ?? []).some((b) => b.kind === 'frames')
  const lightbox = zoom ? (
    <Lightbox labels={{ viewer: t.case.viewer, close: t.case.close, prev: t.case.prev, next: t.case.nextShot }} />
  ) : null
  if (Scene && scene && show) {
    const facts = [
      { label: t.case.facts.client, value: item.client },
      { label: t.case.facts.year, value: item.year },
      { label: t.case.facts.direction, value: item.directions.map((d) => t.works.directions[d]).join(', ') },
      { label: t.case.facts.stack, value: item.stack.join(' · ') },
      ...(item.link ? [{ label: t.case.facts.site, value: item.link.label, href: item.link.href }] : []),
      ...(item.credit
        ? [
            {
              label: item.credit.kind === 'with' ? t.case.creditWith : t.case.credit,
              value: `github.com/${item.credit.handle}`,
              href: item.credit.href,
            },
          ]
        : []),
    ]
    return (
      <div
        lang={HTML_LANG[locale]}
        data-case
        data-scene={slug}
        data-shots="light"
        data-pace={pace}
        style={caseColor(slug) ? ({ '--case-color': caseColor(slug) } as CSSProperties) : undefined}
      >
        <Scene
          item={item}
          meta={{ index: index + 1, total: items.length, back: { href: localePath(locale, '/#works'), label: t.case.back } }}
          facts={facts}
          brief={show.brief}
          t={t.case}
          data={scene}
        />
        {show.blocks.length > 1 && <Showcase data={show} item={item} t={t.case.show} pace={pace} part="rest" />}
        <CaseBody item={item} t={t.case} used={used} />
        <CaseCta title={t.case.cta} primary={t.hero.primary} write={t.nav.write} href={localePath(locale, '/#contact')} />
        <NextCase
          item={next}
          index={items.indexOf(next) + 1}
          total={items.length}
          href={localePath(locale, `/cases/${next.slug}/`)}
          label={t.case.next}
        />
        {lightbox}
      </div>
    )
  }

  return (
    <div
      lang={HTML_LANG[locale]}
      data-case
      data-shots="light"
      data-pace={pace}
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
        flow={liveOf(item, show, cast)}
      />
      {show && pace === 'show' && <Showcase data={show} item={item} t={t.case.show} pace={pace} part="lead" />}
      {show && <Brief brief={show.brief} t={t.case.brief} />}
      {show && <Showcase data={show} item={item} t={t.case.show} pace={pace} part={pace === 'show' ? 'rest' : 'all'} cast={cast} />}
      <CaseBody item={item} t={t.case} used={used} />
      {chapters.length > 1 && <ChapterRail chapters={chapters} label={t.case.toc} />}
      <CaseCta
        title={t.case.cta}
        primary={t.hero.primary}
        write={t.nav.write}
        href={localePath(locale, '/#contact')}
      />
      <NextCase
        item={next}
        index={items.indexOf(next) + 1}
        total={items.length}
        href={localePath(locale, `/cases/${next.slug}/`)}
        label={t.case.next}
      />
      {lightbox}
    </div>
  )
}
