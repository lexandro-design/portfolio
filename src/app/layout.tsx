import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Nav } from '@/components/layout/Nav'
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
