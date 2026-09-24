import { asset } from '@/lib/asset'
import type { Shot as ShotType } from '@/content/cases'

type Props = {
  shot: ShotType
  className?: string
  eager?: boolean
}

/** Скриншот кейса: путь с basePath, размеры из данных, чтобы вёрстка не прыгала */
export function Shot({ shot, className, eager }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет
    <img
      className={className}
      src={asset(shot.src)}
      alt={shot.caption}
      width={shot.w}
      height={shot.h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
