import { CasePage } from '@/components/case/CasePage'
import { JsonLd } from '@/components/layout/JsonLd'
import { caseLd } from '@/lib/jsonld'
import { caseMeta, caseSlugs } from '@/lib/routes'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = caseSlugs

export async function generateMetadata({ params }: Props) {
  return caseMeta('ru', (await params).slug)
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return (
    <>
      <JsonLd data={caseLd('ru', slug)} />
      <CasePage locale="ru" slug={slug} />
    </>
  )
}
