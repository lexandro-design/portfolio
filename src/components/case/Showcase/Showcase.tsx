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

/** Демо, которым тесно в узкой колонке: им — сцена на всю ширину, текст строкой над ними */
const STAGE = new Set<Block['kind']>(['browse', 'compare', 'steps', 'deck', 'reel', 'wide', 'board', 'transcript', 'sort'])

/** Якорь главы: на него ведут оглавление в шапке и рельс глав сбоку */
export const chapterId = (i: number) => `ch-${i + 1}`

/**
 * Раскрытие кейса главами. У главы номер, заголовок, пояснение из текста
 * кейса (поле section) и живое демо. Узкие демо (бот, пульт, поиск) стоят
 * справа, текст слева прилипает к экрану, пока демо крутится; широкие —
 * сайт, шторка, сценарий — сценой на всю ширину. Так страница одна
 * история, а не «блоки сверху, старый текст снизу»
 */
export function Showcase({ data, item, t }: { data: Data; item: Case; t: T }) {
  const total = data.blocks.length
  return (
    <>
      {data.blocks.map((b, i) => {
        const h = hint(b, t)
        const text = b.section === undefined ? undefined : item.sections[b.section]
        const layout = STAGE.has(b.kind) || !text ? 'stage' : 'side'
        return (
          <section
            key={b.title + i}
            id={chapterId(i)}
            className={styles.block}
            data-kind={b.kind}
            data-layout={layout}
          >
            <div className="container">
              <div className={styles.chapter}>
                <Reveal className={styles.head}>
                  <div className={styles.headText}>
                    {h && <span className={styles.label}>{h}</span>}
                    <h2 className={styles.title}>{b.title}</h2>
                  </div>
                  {text && (
                    <div className={styles.text}>
                      {text.body.map((p) => (
                        <p key={p.slice(0, 32)}>{p}</p>
                      ))}
                    </div>
                  )}
                </Reveal>
                <Reveal className={styles.demo} delay={120}>
                  <Kind block={b} shots={item.shots} t={t} />
                </Reveal>
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
