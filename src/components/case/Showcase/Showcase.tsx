import type { Case } from '@/content/cases'
import type { Block, Showcase as Data } from '@/content/showcase'
import type { Dict } from '@/i18n/dict'
import { Reveal } from '@/components/ui/Reveal'
import { Board } from './kinds/Board'
import { Browse } from './kinds/Browse'
import { Cards } from './kinds/Cards'
import { Compare } from './kinds/Compare'
import { Console } from './kinds/Console'
import { Deck } from './kinds/Deck'
import { Diff } from './kinds/Diff'
import { Fusion } from './kinds/Fusion'
import { Notify } from './kinds/Notify'
import { Queue } from './kinds/Queue'
import { Reel } from './kinds/Reel'
import { Sort } from './kinds/Sort'
import { Speed } from './kinds/Speed'
import { Steps } from './kinds/Steps'
import { Timeline } from './kinds/Timeline'
import { Trace } from './kinds/Trace'
import { Transcript } from './kinds/Transcript'
import { Voice } from './kinds/Voice'
import { Wide } from './kinds/Wide'
import styles from './Showcase.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type T = Dict['case']['show']

/** Подсказка над блоком: как с ним обращаться. У демо ботов — пометка «пример» */
const hint = (b: Block, t: T) => {
  switch (b.kind) {
    case 'browse':
      return t.hint.browse
    case 'compare':
      return t.hint.compare
    case 'steps':
      return t.hint.steps
    case 'deck':
      return t.hint.deck
    case 'reel':
      return b.items.length > 1 ? t.hint.reel : null
    case 'console':
      return t.hint.console
    case 'wide':
    case 'speed':
      return null
    default:
      return t.example
  }
}

function Kind({ block: b, shots, t }: { block: Block; shots: Case['shots']; t: T }) {
  switch (b.kind) {
    case 'browse':
      return <Browse pages={b.pages} shots={shots} />
    case 'compare':
      return <Compare block={b} shots={shots} drag={t.drag} />
    case 'steps':
      return <Steps steps={b.steps} shots={shots} />
    case 'deck':
      return <Deck cards={b.cards} shots={shots} labels={{ prev: t.prev, next: t.next }} />
    case 'reel':
      return <Reel items={b.items} shots={shots} />
    case 'wide':
      return <Wide shot={shots[b.shot]} />
    case 'voice':
      return <Voice lines={b.lines} />
    case 'board':
      return <Board block={b} />
    case 'console':
      return <Console block={b} />
    case 'transcript':
      return <Transcript block={b} labels={t.tracks} />
    case 'sort':
      return <Sort block={b} incoming={t.incoming} />
    case 'queue':
      return <Queue block={b} />
    case 'trace':
      return <Trace block={b} />
    case 'fusion':
      return <Fusion block={b} />
    case 'notify':
      return <Notify block={b} />
    case 'timeline':
      return <Timeline block={b} />
    case 'cards':
      return <Cards block={b} />
    case 'diff':
      return <Diff block={b} />
    case 'speed':
      return <Speed rows={b.rows} />
  }
}

/** Интерактивное раскрытие кейса: блоки идут после «коротко», до подробного текста */
export function Showcase({ data, item, t }: { data: Data; item: Case; t: T }) {
  const total = data.blocks.length
  return (
    <>
      {data.blocks.map((b, i) => {
        const h = hint(b, t)
        return (
          <section key={b.title + i} className={styles.block} data-kind={b.kind}>
            <Reveal className="container">
              <div className={styles.head}>
                <span className={styles.label}>
                  {pad(i + 1)} / {pad(total)}
                  {h && <span className={styles.hint}> · {h}</span>}
                </span>
                <h2 className={styles.title}>{b.title}</h2>
              </div>
              <Kind block={b} shots={item.shots} t={t} />
            </Reveal>
          </section>
        )
      })}
    </>
  )
}
