/** Порог Байера: удваиваем матрицу, из 2×2 выходит 8×8 */
const bayer = (a: number[][]): number[][] => {
  const n = a.length
  const out = Array.from({ length: n * 2 }, () => Array<number>(n * 2).fill(0))
  a.forEach((row, y) =>
    row.forEach((v, x) => {
      out[y][x] = v * 4
      out[y][x + n] = v * 4 + 2
      out[y + n][x] = v * 4 + 3
      out[y + n][x + n] = v * 4 + 1
    }),
  )
  return out
}

const rects = bayer(
  bayer([
    [0, 2],
    [3, 1],
  ]),
)
  .flatMap((row, y) =>
    row.map((v, x) => {
      const c = Math.round(((v + 0.5) / 64) * 255)
      return `<rect x='${x * 2}' y='${y * 2}' width='2' height='2' fill='rgb(${c},${c},${c})'/>`
    }),
  )
  .join('')
const tile = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'>${rects}</svg>`,
)}`

/** Фильтр растра для темы «Один бит»: яркость плюс порог, на выходе только чёрное и белое */
export function Dither() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="dither" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="matrix" values=".3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0" result="gray" />
        <feImage href={tile} x="0" y="0" width="16" height="16" result="cell" />
        <feTile in="cell" result="grid" />
        <feComposite in="gray" in2="grid" operator="arithmetic" k1="0" k2="1" k3="1" k4="-.5" result="sum" />
        <feComponentTransfer in="sum">
          <feFuncR type="discrete" tableValues="0 1" />
          <feFuncG type="discrete" tableValues="0 1" />
          <feFuncB type="discrete" tableValues="0 1" />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}
