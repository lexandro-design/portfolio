import type { CSSProperties } from 'react'

export type Variant = 'etalon' | 'student' | 'fixed'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/**
 * Условный лист с рисунком: кувшин и яблоко линией и штриховкой. Три варианта:
 * эталон (точный эллипс, тень с рефлексом), работа ученика (узкий эллипс, тень
 * плоская) и исправленная работа. Всё линиями на токенах темы, без картинок
 */
export function Art({ variant, className, style }: { variant: Variant; className?: string; style?: CSSProperties }) {
  const good = variant !== 'student'
  const ry = good ? 15 : 7
  const tilt = variant === 'student' ? 2 : 0
  return (
    <svg viewBox="40 40 320 240" className={className} style={style} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* стол */}
        <path d="M30 238 H370" strokeWidth="1" opacity="0.45" />
        {/* корпус кувшина */}
        <path d="M124 74 C108 118 106 192 130 234 L212 234 C236 192 234 118 218 74" strokeWidth="1.8" />
        {/* горло и край */}
        <ellipse cx="171" cy="74" rx="47" ry={ry} strokeWidth="1.8" transform={`rotate(${tilt} 171 74)`} />
        <path d="M130 74 C132 88 150 96 171 96 C192 96 210 88 212 74" strokeWidth="1" opacity="0.5" />
        {/* ручка */}
        <path d="M122 92 C80 86 74 152 118 182" strokeWidth="1.8" />
        <path d="M126 100 C94 98 92 142 122 168" strokeWidth="1" opacity="0.6" />
        {/* яблоко */}
        <path d="M262 180 C232 178 226 226 250 238 C262 242 272 240 280 238 C304 226 296 178 262 180 Z" strokeWidth="1.8" />
        <path d="M264 180 C264 172 268 166 274 164" strokeWidth="1.6" />
        {/* штриховка корпуса: тёмная левая сторона */}
        <g strokeWidth="1" opacity="0.7">
          {range(15).map((i) => (
            <path key={i} d={`M${112 + i * 2.4} ${118 + i * 6.2} l 22 -9`} />
          ))}
          {range(11).map((i) => (
            <path key={`b${i}`} d={`M${126 + i * 1.5} ${124 + i * 9} l 30 -11`} opacity="0.7" />
          ))}
        </g>
        {/* штриховка яблока */}
        <g strokeWidth="1" opacity="0.6">
          {range(7).map((i) => (
            <path key={i} d={`M${236 + i * 3} ${206 + i * 4} l 16 -8`} />
          ))}
        </g>
        {/* тень на столе */}
        <g strokeWidth="1" opacity={good ? 0.75 : 0.55}>
          {range(20).map((i) => (
            <path key={i} d={`M${216 + i * 6} ${240} l -9 ${good && i > 8 && i < 14 ? 6 : 14}`} />
          ))}
          {good &&
            range(9).map((i) => (
              <path key={`g${i}`} d={`M${220 + i * 12} 247 l -8 9`} opacity="0.8" />
            ))}
        </g>
      </g>
    </svg>
  )
}
