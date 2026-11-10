import { HomePage } from '@/components/home/HomePage'
import { JsonLd } from '@/components/layout/JsonLd'
import { homeLd } from '@/lib/jsonld'
import { homeMeta } from '@/lib/routes'

export const metadata = homeMeta('ru')

export default function Page() {
  return (
    <>
      <JsonLd data={homeLd('ru')} />
      <HomePage locale="ru" />
    </>
  )
}
