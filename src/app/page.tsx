import { Contact } from '@/components/home/Contact'
import { Hero } from '@/components/home/Hero'
import { Principles } from '@/components/home/Principles'
import { Process } from '@/components/home/Process'
import { Services } from '@/components/home/Services'
import { Works } from '@/components/home/Works'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cases } from '@/content/cases'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="services" className={styles.section}>
        <div className="container">
          <SectionHeader
            index={2}
            label="услуги"
            title="что я делаю"
            aside="три направления · один исполнитель · без посредников"
          />
          <Services />
        </div>
      </section>

      <section id="works" className={styles.section}>
        <div className="container">
          <SectionHeader
            index={3}
            label="избранное"
            title="избранные работы"
            aside={`${cases.length} проектов · ТИТАН-2, клиенты и свои продукты`}
          />
          <Works />
        </div>
      </section>

      <section id="process" className={styles.section}>
        <div className="container">
          <SectionHeader
            index={4}
            label="процесс"
            title="как я работаю"
            aside="пять шагов · без сюрпризов"
          />
          <Process />
        </div>
      </section>

      <section id="principles" className={styles.section}>
        <div className="container">
          <SectionHeader index={5} label="принципы" title="как я думаю" aside="четыре правила" />
          <Principles />
        </div>
      </section>

      <section id="contact" className={styles.section}>
        <div className="container">
          <Contact />
        </div>
      </section>
    </>
  )
}
