import { notFound } from 'next/navigation'
import { CasePage } from '@/components/case/CasePage'
import { isLocale, PREFIXED } from '@/i18n/config'
import { JsonLd } from '@/components/layout/JsonLd'
import { caseLd } from '@/lib/jsonld'
import { caseMeta, caseSlugs } from '@/lib/routes'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return PREFIXED.flatMap((locale) => caseSlugs().map(({ slug }) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  return isLocale(locale) ? caseMeta(locale, slug) : {}
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  return (
    <>
      <JsonLd data={caseLd(locale, slug)} />
      <CasePage locale={locale} slug={slug} />
    </>
  )
}
