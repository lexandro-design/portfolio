import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Nav } from '@/components/layout/Nav'
import { ThemeScript } from '@/components/layout/ThemeScript'
import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://lexandro-design.github.io'),
  title: {
    default: 'Алексей Свешников · дизайн и разработка',
    template: '%s · Алексей Свешников',
  },
  description:
    'Дизайнер и разработчик: интерфейсы и дизайн-системы в Figma, сайты на Next.js, автоматизации, интеграции и AI-сервисы.',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'LEXANDRO',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
