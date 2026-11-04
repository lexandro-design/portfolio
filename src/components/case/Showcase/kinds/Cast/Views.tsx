import type { CastView } from '@/content/casts'
import styles from './Views.module.css'

type Row = CastView['rows'][number]

const PIPS: Record<string, number[]> = {
  '1': [4],
  '2': [0, 8],
  '3': [0, 4, 8],
  '4': [0, 2, 6, 8],
  '5': [0, 2, 4, 6, 8],
  '6': [0, 2, 3, 5, 6, 8],
}

function Die({ value, run }: { value: string; run: boolean }) {
  const pips = PIPS[value] ?? []
  return (
    <span className={styles.die} data-run={run || undefined} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} data-on={pips.includes(i) || undefined} />
      ))}
    </span>
  )
}

/** Учебный рисунок: голова с тенью. До правки голова крупнее и тень не с той стороны */
function Head({ fixed }: { fixed?: boolean }) {
  return (
    <svg className={styles.head} viewBox="0 0 120 150" aria-hidden="true">
      <path d="M22 150c4-30 20-38 38-38s34 8 38 38" />
      <path d="M50 92v22M70 92v22" />
      {fixed ? <ellipse cx="60" cy="60" rx="29" ry="37" /> : <ellipse cx="60" cy="56" rx="38" ry="44" />}
      <g data-shade>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={fixed ? `M${70 + i * 3} ${32 + i * 3}v${54 - i * 6}` : `M${28 + i * 3} ${34 - i}v${48 - i * 4}`} />
        ))}
      </g>
    </svg>
  )
}

function Stages({ rows }: { rows: Row[] }) {
  return (
    <ol className={styles.stages}>
      {rows.map((r) => (
        <li key={r.c[0]} data-s={r.s}>
          <i aria-hidden="true" />
          <span>{r.c[0]}</span>
        </li>
      ))}
    </ol>
  )
}

function Sheet({ cols = [], rows }: { cols?: string[]; rows: Row[] }) {
  return (
    <table className={styles.sheet}>
      <thead>
        <tr>
          {cols.map((c) => (
            <th key={c} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} data-s={r.s}>
            {r.c.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Card({ rows }: { rows: Row[] }) {
  return (
    <dl className={styles.card}>
      {rows.map((r) => (
        <div key={r.c[0]} data-s={r.s}>
          <dt>{r.c[0]}</dt>
          <dd key={r.c[1]}>{r.s ? r.c[1] : ''}</dd>
        </div>
      ))}
    </dl>
  )
}

function Board({ cols = [], rows }: { cols?: string[]; rows: Row[] }) {
  return (
    <div className={styles.board} style={{ '--cols': cols.length } as React.CSSProperties}>
      {cols.map((col, i) => (
        <div key={col} className={styles.col}>
          <span>{col}</span>
          <ul>
            {rows.map(
              (r, n) =>
                r.at === i && (
                  <li key={n} data-s={r.s}>
                    {r.c[0]}
                  </li>
                ),
            )}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Slots({ cols = [], rows }: { cols?: string[]; rows: Row[] }) {
  return (
    <div className={styles.slots} style={{ '--cols': cols.length } as React.CSSProperties}>
      <span />
      {cols.map((c) => (
        <span key={c} className={styles.slotHead}>
          {c}
        </span>
      ))}
      {rows.map((r) => [
        <span key={r.c[0]} className={styles.slotName}>
          {r.c[0]}
        </span>,
        ...r.c.slice(1).map((cell, i) => <i key={`${r.c[0]}${i}`} data-cell={cell} />),
      ])}
    </div>
  )
}

function Rank({ rows }: { rows: Row[] }) {
  return (
    <ol className={styles.rank} style={{ blockSize: `${rows.length * 64}px` }}>
      {rows.map((r) => (
        <li key={r.c[0]} data-s={r.s} style={{ transform: `translateY(${(r.at ?? 0) * 64}px)` }}>
          <b>{(r.at ?? 0) + 1}</b>
          <span>
            {r.c[0]}
            <small>{r.c[1]}</small>
          </span>
        </li>
      ))}
    </ol>
  )
}

function Desks({ rows }: { rows: Row[] }) {
  return (
    <ul className={styles.desks}>
      {rows.map((r) => (
        <li key={r.c[0]} data-s={r.s}>
          <small>{r.c[1]}</small>
          <b>{r.c[0]}</b>
          <span>{r.c[2]}</span>
        </li>
      ))}
    </ul>
  )
}

function Chips({ rows }: { rows: Row[] }) {
  return (
    <ul className={styles.chips}>
      {rows.map((r) => (
        <li key={r.c[0]} data-s={r.s}>
          {r.c[0]}
        </li>
      ))}
    </ul>
  )
}

function Lanes({ rows }: { rows: Row[] }) {
  return (
    <ol className={styles.lanes}>
      {rows.map((r) => (
        <li key={r.c[0]} data-s={r.s}>
          <b>{r.c[0]}</b>
          <small>{r.c[1]}</small>
          <span key={r.c[2]}>{r.c[2]}</span>
        </li>
      ))}
    </ol>
  )
}

/** Сутки по пятнадцать минут: бот просыпается в каждую клетку, пишет только в отмеченные */
function Ticks({ rows }: { rows: Row[] }) {
  const lit = new Set(rows.filter((r) => r.s).map((r) => r.at))
  const now = rows.find((r) => r.s === 'now')?.at
  return (
    <div className={styles.ticks}>
      <div className={styles.tickGrid} aria-hidden="true">
        {Array.from({ length: 96 }, (_, i) => (
          <i key={i} data-on={lit.has(i) || undefined} data-now={now === i || undefined} />
        ))}
      </div>
      <ul>
        {rows.map((r) => (
          <li key={r.c[0]} data-s={r.s}>
            {r.c[0]}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Sketch({ rows }: { rows: Row[] }) {
  const shown = rows.some((r) => r.s)
  const fixed = rows.length > 0 && rows.every((r) => r.s === 'ok')
  return (
    <div className={styles.sketch}>
      <figure data-on={shown || undefined}>
        <Head fixed={fixed} />
      </figure>
      <figure data-on="true" data-ref>
        <Head fixed />
      </figure>
      <ul>
        {rows.map((r) => (
          <li key={r.c[0]} data-s={r.s}>
            <b>{r.c[0]}</b>
            <span key={r.c[1]}>{r.s ? r.c[1] : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Doc({ rows }: { rows: Row[] }) {
  return (
    <ul className={styles.doc}>
      {rows.map((r) => (
        <li key={r.c[0]} data-s={r.s}>
          {r.c[0]}
        </li>
      ))}
    </ul>
  )
}

function DieView({ rows }: { rows: Row[] }) {
  const [die, ...stats] = rows
  return (
    <div className={styles.dieBox}>
      <Die value={die.c[0]} run={die.s === 'run'} />
      <Card rows={stats} />
    </div>
  )
}

/** Что происходит внутри, у каждого кейса свой вид: состояние собирает плеер по шагам */
export function View({ view }: { view: CastView }) {
  const { kind, rows, cols } = view
  switch (kind) {
    case 'stages':
      return <Stages rows={rows} />
    case 'sheet':
      return <Sheet cols={cols} rows={rows} />
    case 'card':
      return <Card rows={rows} />
    case 'board':
      return <Board cols={cols} rows={rows} />
    case 'slots':
      return <Slots cols={cols} rows={rows} />
    case 'rank':
      return <Rank rows={rows} />
    case 'desks':
      return <Desks rows={rows} />
    case 'chips':
      return <Chips rows={rows} />
    case 'lanes':
      return <Lanes rows={rows} />
    case 'ticks':
      return <Ticks rows={rows} />
    case 'sketch':
      return <Sketch rows={rows} />
    case 'doc':
      return <Doc rows={rows} />
    case 'die':
      return <DieView rows={rows} />
  }
}
