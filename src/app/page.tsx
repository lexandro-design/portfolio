import { HomePage } from '@/components/home/HomePage'
import { homeMeta } from '@/lib/routes'

export const metadata = homeMeta('ru')

export default function Page() {
  return <HomePage locale="ru" />
}
