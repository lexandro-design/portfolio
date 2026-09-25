import { notFound } from 'next/navigation'
import { HomePage } from '@/components/home/HomePage'
import { isLocale, PREFIXED } from '@/i18n/config'
import { homeMeta } from '@/lib/routes'

type Props = { params: Promise<{ locale: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return PREFIXED.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return isLocale(locale) ? homeMeta(locale) : {}
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <HomePage locale={locale} />
}
