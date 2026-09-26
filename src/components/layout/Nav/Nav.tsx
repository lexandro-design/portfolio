'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { contacts } from '@/content/site'
import { HTML_LANG, localePath } from '@/i18n/config'
import { Button } from '@/components/ui/Button'
import { LangSwitch } from '../LangSwitch'
import { Logo } from './Logo'
import { MobileMenu } from '../MobileMenu'
import { ScrollProgress } from '../ScrollProgress'
import { ThemeSwitch } from '../ThemeSwitch'
import { useLocale } from '../useLocale'
import styles from './Nav.module.css'

/**
 * Шапка: логотип, разделы, статус, язык, тема, «написать».
 * Уже 1024 разделы уходят в меню. Живёт в общем layout, поэтому язык
 * узнаёт из адреса, а не из пропсов.
 */
export function Nav() {
  const { locale, rest, t } = useLocale()
  const links = [
    { href: localePath(locale, '/#services'), label: t.nav.services },
    { href: localePath(locale, '/#works'), label: t.nav.works },
    { href: localePath(locale, '/#system'), label: t.nav.system },
    { href: localePath(locale, '/#about'), label: t.nav.about },
    { href: localePath(locale, '/#contact'), label: t.nav.contact },
  ]

  // После перехода между языками без перезагрузки <html lang> обновляем сами
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale]
  }, [locale])

  return (
    <header className={styles.nav}>
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
          <span className={styles.status}>
            <span className={styles.dot} />
            {t.nav.status}
          </span>
          <LangSwitch locale={locale} rest={rest} label={t.nav.language} />
          <ThemeSwitch labels={t.nav.themes} label={t.nav.theme} />
          <Button href={contacts.telegram} external className={styles.cta}>
            {t.nav.write}
          </Button>
          <MobileMenu links={links} locale={locale} rest={rest} t={t.nav} />
        </div>
      </div>
      <ScrollProgress />
    </header>
  )
}
