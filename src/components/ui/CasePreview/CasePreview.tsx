import type { CSSProperties } from 'react'
import type { Preview } from '@/content/cases'
import styles from './CasePreview.module.css'

type Props = {
  index: number
  year: string
  stack: string[]
  size?: 'row' | 'cover'
  /** Чем заполнить плашку: цепочка шагов или переписка. Нет — только номер и стек */
  preview?: Preview
}

// Порядковый номер элемента в CSS: от него считаются задержки анимации
const order = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Превью кейса без скриншотов: плашка с уголками, номер кейса контуром
 * и стек. У автоматизаций картинок нет вообще, поэтому на плашке видно,
 * как они работают: шаги цепочки по очереди подсвечиваются, а переписка
 * с ботом набирается сообщение за сообщением. Так кейсы без фото стоят
 * в том же ритме, что и с фото, и не выглядят пустыми.
 */
export function CasePreview({ index, year, stack, size = 'row', preview }: Props) {
  const n = String(index).padStart(2, '0')

  return (
    <div className={styles.preview} data-size={size} data-kind={preview?.kind} aria-hidden="true">
      <span className={styles.corner} data-pos="tl" />
      <span className={styles.corner} data-pos="br" />
      <span className={styles.top}>
        <span>case {n}</span>
        <span>{year}</span>
      </span>
      <span className={styles.number}>{n}</span>

      {preview?.kind === 'flow' && (
        <span className={styles.flow}>
          {preview.steps.map((step, i) => (
            <span key={step} className={styles.step} style={order(i)}>
              <span className={styles.stepIndex}>{String(i + 1).padStart(2, '0')}</span>
              {step}
            </span>
          ))}
        </span>
      )}

      {preview?.kind === 'chat' && (
        <span className={styles.chat}>
          {preview.lines.map((line, i) => (
            <span key={line.text} className={styles.bubble} data-from={line.from} style={order(i)}>
              {line.text}
            </span>
          ))}
        </span>
      )}

      {!preview && (
        <span className={styles.stack}>
          {stack.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </span>
      )}
    </div>
  )
}
