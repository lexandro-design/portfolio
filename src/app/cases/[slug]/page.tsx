import { CasePage } from '@/components/case/CasePage'
import { caseMeta, caseSlugs } from '@/lib/routes'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = caseSlugs

export async function generateMetadata({ params }: Props) {
  return caseMeta('ru', (await params).slug)
}

export default async function Page({ params }: Props) {
  return <CasePage locale="ru" slug={(await params).slug} />
}
