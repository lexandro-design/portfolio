import { getCases } from '@/content/cases-i18n'
import { flowOf } from '@/content/flows'
import { getShowcase } from '@/content/showcase'
import { HTML_LANG, localePath, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { About } from './About'
import { Contact } from './Contact'
import { Hero } from './Hero'
import { Principles } from './Principles'
import { Process } from './Process'
import { Services } from './Services'
import { System } from './System'
import { Works } from './Works'
import { PICK } from './Works/pick'
import styles from './HomePage.module.css'

/** Главная на любом языке: одни и те же секции, тексты из словаря */
export function HomePage({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const items = getCases(locale)
  const base = localePath(locale, '').replace(/\/$/, '')
  // Автоматизации показывают, как работают, — схема из их же демо
  const flows = Object.fromEntries(items.map((c) => [c.slug, flowOf(c, getShowcase(locale, c.slug))]))
  const nums = Object.fromEntries(
    PICK.map((slug) => [slug, getShowcase(locale, slug)?.brief.nums.slice(0, 2) ?? []]),
  )
  const first = items.find((c) => c.slug === 'parfumeria')

  return (
    <div lang={HTML_LANG[locale]}>
      <Hero t={t.hero} locale={locale} stage={{ title: first?.title ?? '', text: first?.tagline ?? '' }} />

      <section id="works" className={styles.section}>
        <div className="container">
          <SectionHeader copy={t.sections.works} />
          <Works items={items} flows={flows} nums={nums} t={t.works} base={base} />
        </div>
      </section>

      <section id="services" className={styles.slab} data-theme="dark">
        <div className="container">
          <SectionHeader copy={t.sections.services} />
          <Services items={t.services} more={t.servicesMore} />
        </div>
      </section>

      <section id="process" className={styles.section}>
        <div className={`container ${styles.split}`}>
          <div className={styles.pin}>
            <SectionHeader copy={t.sections.process} />
          </div>
          <Process t={t.process} />
        </div>
      </section>

      <section id="system" className={styles.section}>
        <div className="container">
          <SectionHeader copy={t.sections.system} />
          <System t={t.system} labels={t.nav.themes} />
        </div>
      </section>

      <section id="about" className={styles.section}>
        <div className="container">
          <SectionHeader copy={t.sections.about} />
          <About t={t.about} alt={t.hero.photoAlt} />
        </div>
      </section>

      <section id="principles" className={styles.section}>
        <div className="container">
          <SectionHeader copy={t.sections.principles} />
          <Principles items={t.principles} />
        </div>
      </section>

      <section id="contact" className={styles.section}>
        <div className="container">
          <Contact t={t.contact} services={t.services} steps={t.process.steps} />
        </div>
      </section>
    </div>
  )
}
