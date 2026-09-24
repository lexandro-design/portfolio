/** Стрелка «→» из макета: линия 1.5, цвет от текста */
export function Arrow({
  size = 14,
  dir = 'right',
}: {
  size?: number
  dir?: 'right' | 'left' | 'up-right'
}) {
  const rotate = dir === 'left' ? 180 : dir === 'up-right' ? -45 : 0
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d="M2 8h11.5M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
