import { sectionIndex, THEMES } from '@/content/site'
import { getCases } from '@/content/cases-i18n'
import { CAST_COUNT, getCast } from '@/content/casts'
import { previewOf } from '@/content/flows'
import { getShowcase } from '@/content/showcase'
import { HTML_LANG, localePath, LOCALES, type Locale } from '@/i18n/config'
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

/** Настоящий пример к шагу работы: текст берётся из блока «Коротко» кейса, поэтому переводится сам.
    Без номера берётся задача, с номером строка «что сделано» */
const EXAMPLES: { slug: string; did?: number }[] = [
  { slug: 'food-assistants' },
  { slug: 'parfumeria', did: 1 },
  { slug: 'svarnoy52', did: 1 },
  { slug: 'mail-to-crm', did: 2 },
  { slug: 'mimimibot', did: 2 },
]
const GROUPS = ['own', 'freelance', 'titan', 'entersales'] as const

/** Главная на любом языке: одни и те же секции, тексты из словаря */
export function HomePage({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const items = getCases(locale)
  const base = localePath(locale, '').replace(/\/$/, '')
  // Автоматизации в карточках показывают, как работают, — схема из их же демо
  const flows = Object.fromEntries(items.map((c) => [c.slug, previewOf(c, getShowcase(locale, c.slug), getCast(locale, c.slug))]))

  const n = t.system.stack.numbers
  const numbers = [
    { v: items.length, l: n.cases },
    { v: LOCALES.length, l: n.langs },
    { v: THEMES.length, l: n.themes },
    { v: CAST_COUNT, l: n.casts },
    { v: (items.length + 1) * LOCALES.length, l: n.pages },
  ]
  const examples = EXAMPLES.map(({ slug, did }) => {
    const brief = getShowcase(locale, slug)?.brief
    const item = items.find((c) => c.slug === slug)
    if (!brief || !item) return null
    return { href: `${base}/cases/${slug}/`, title: item.title, text: did === undefined ? brief.task : brief.did[did] }
  })
  const counts = GROUPS.map((group) => ({ group, n: items.filter((c) => c.group === group).length }))

  return (
    <div lang={HTML_LANG[locale]}>
      <Hero t={t.hero} calm={t.nav.calm} locale={locale} />

      <section id="services" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('services')} copy={t.sections.services} />
          <Services
            t={t.build}
            services={t.services}
            hello={t.contact.brief.hello}
            need={t.contact.brief.need}
            titles={Object.fromEntries(items.map((c) => [c.slug, c.title]))}
            base={base}
          />
        </div>
      </section>

      <section id="works" className={styles.section}>
        <div className="container">
          <SectionHeader
            index={sectionIndex('works')}
            copy={{ ...t.sections.works, aside: `${items.length} · ${t.sections.works.aside}` }}
          />
          <Works items={items} flows={flows} t={t.works} base={base} />
        </div>
      </section>

      <section id="system" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('system')} copy={t.sections.system} />
          <System t={t.system} themes={{ label: t.nav.theme, labels: t.nav.themes }} numbers={numbers} />
        </div>
      </section>

      <section id="process" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('process')} copy={t.sections.process} />
          <Process t={t.process} examples={examples} />
        </div>
      </section>

      <section id="about" className={styles.section}>
        <div className="container">
          <SectionHeader index={sectionIndex('about')} copy={t.sections.about} />
          <About t={t.about} where={t.works.where} counts={counts} />
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
          <Contact
            t={t.contact}
            label={t.sections.contact.label}
            services={t.services}
            steps={t.process.steps}
          />
        </div>
      </section>
    </div>
  )
}
