import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Nav } from '@/components/layout/Nav'
import { CommandPalette, type PaletteCase } from '@/components/layout/CommandPalette/CommandPalette'
import { getCases } from '@/content/cases-i18n'
import { features } from '@/content/site'
import { LOCALES, type Locale } from '@/i18n/config'
import { ThemeScript } from '@/components/layout/ThemeScript'
import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://lexandro-design.github.io'),
  title: 'LEXANDRO',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

/* Один корневой layout на все языки: <html lang> для /en, /zh, /ja
   выставляет ThemeScript до отрисовки, а контент страниц дополнительно
   обёрнут в элемент со своим lang */
/** Лёгкий индекс кейсов для палитры команд: только то, по чему ищем, на всех языках */
const paletteIndex = Object.fromEntries(
  LOCALES.map((l) => [
    l,
    getCases(l).map((c): PaletteCase => ({
      slug: c.slug,
      title: c.title,
      tagline: c.tagline,
      client: c.client,
      stack: c.stack.join(' '),
    })),
  ]),
) as Record<Locale, PaletteCase[]>

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
        {features.palette && <CommandPalette index={paletteIndex} />}
      </body>
    </html>
  )
}
