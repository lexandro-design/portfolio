'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { contacts, features } from '@/content/site'
import { HTML_LANG, localePath } from '@/i18n/config'
import { Button } from '@/components/ui/Button'
import { PaletteButton } from '../CommandPalette/CommandPalette'
import { LangSwitch } from '../LangSwitch'
import { Logo } from './Logo'
import { MobileMenu } from '../MobileMenu'
import { ThemeSwitch } from '../ThemeSwitch'
import { useLocale } from '../useLocale'
import styles from './Nav.module.css'

/**
 * Шапка: логотип, разделы, язык, тема, «написать». Вверху страницы её как бы нет,
 * при прокрутке появляется стекло. Живёт в общем layout, поэтому язык
 * узнаёт из адреса, а не из пропсов.
 */
export function Nav() {
  const { locale, rest, t } = useLocale()
  const ref = useRef<HTMLElement>(null)
  const links = [
    { href: localePath(locale, '/#works'), label: t.nav.works },
    { href: localePath(locale, '/#services'), label: t.nav.services },
    { href: localePath(locale, '/#about'), label: t.nav.about },
    { href: localePath(locale, '/#contact'), label: t.nav.contact },
  ]

  // После перехода между языками без перезагрузки <html lang> обновляем сами
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale]
  }, [locale])

  useEffect(() => {
    const update = () => ref.current?.toggleAttribute('data-top', scrollY < 8)
    update()
    addEventListener('scroll', update, { passive: true })
    return () => removeEventListener('scroll', update)
  }, [])

  return (
    <header ref={ref} className={styles.nav} data-top="">
      <div className={`container ${styles.inner}`}>
        <Logo href={localePath(locale, '/')} />

        <nav className={styles.links} aria-label={t.nav.works}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.side}>
          {features.palette && <PaletteButton label={t.nav.search} />}
          <LangSwitch locale={locale} rest={rest} label={t.nav.language} />
          <ThemeSwitch labels={t.nav.themes} />
          <Button href={contacts.telegram} external className={styles.cta}>
            {t.nav.write}
          </Button>
          <MobileMenu links={links} locale={locale} rest={rest} t={t.nav} />
        </div>
      </div>
    </header>
  )
}
