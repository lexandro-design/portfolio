import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CaseBody } from '@/components/case/CaseBody'
import { CaseHero } from '@/components/case/CaseHero'
import { Lightbox } from '@/components/case/Lightbox'
import { NextCase } from '@/components/case/NextCase'
import { caseBySlug, cases } from '@/content/cases'
import { asset } from '@/lib/asset'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = caseBySlug((await params).slug)
  if (!item) return {}
  const title = `${item.title} · ${item.tagline}`
  return {
    title,
    description: item.lead,
    openGraph: {
      title,
      description: item.lead,
      images: [{ url: asset(`/og/${item.slug}.png`), width: 1200, height: 630 }],
    },
  }
}

export default async function CasePage({ params }: Props) {
  const item = caseBySlug((await params).slug)
  if (!item) notFound()

  const index = cases.indexOf(item)
  const next = cases[(index + 1) % cases.length]

  return (
    <>
      <CaseHero item={item} index={index + 1} total={cases.length} />
      <CaseBody item={item} />
      <NextCase item={next} index={cases.indexOf(next) + 1} total={cases.length} />
      {item.shots.length > 0 && <Lightbox />}
    </>
  )
}
