import { sectionIndex } from '@/content/site'
import { getCases } from '@/content/cases-i18n'
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
import styles from './HomePage.module.css'

/** Главная на любом языке: одни и те же секции, тексты из словаря */
export function HomePage({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const items = getCases(locale)
  const base = localePath(locale, '').replace(/\/$/, '')

  return (
    <div lang={HTML_LANG[locale]}>
      <Hero t={t.hero} locale={locale} />

      <section id="services" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('services')} copy={t.sections.services} />
          <Services items={t.services} more={t.servicesMore} />
        </div>
      </section>

      <section id="works" className={styles.section}>
        <div className="container">
          <SectionHeader
            index={sectionIndex('works')}
            copy={{ ...t.sections.works, aside: `${items.length} · ${t.sections.works.aside}` }}
          />
          <Works items={items} t={t.works} base={base} />
        </div>
      </section>

      <section id="system" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('system')} copy={t.sections.system} />
          <System t={t.system} />
        </div>
      </section>

      <section id="process" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('process')} copy={t.sections.process} />
          <Process t={t.process} />
        </div>
      </section>

      <section id="about" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('about')} copy={t.sections.about} />
          <About t={t.about} />
        </div>
      </section>

      <section id="principles" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('principles')} copy={t.sections.principles} />
          <Principles items={t.principles} />
        </div>
      </section>

      <section id="contact" className={styles.section}>
        <div className="container">
          <Contact t={t.contact} label={t.sections.contact.label} />
        </div>
      </section>
    </div>
  )
}
