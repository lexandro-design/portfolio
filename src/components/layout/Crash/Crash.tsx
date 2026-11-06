'use client'

import { useRouter } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { PHOTO } from '@/content/site'
import { Arrow } from '@/components/ui/Arrow'
import { Button } from '@/components/ui/Button'
import { asset } from '@/lib/asset'
import styles from './Crash.module.css'

/** Сколько собираются обломки перед переходом: совпадает с --fix в CSS */
const FIX = 700
const never = () => () => {}

/**
 * Страница 404 как авария: сайт открывается целым, по нему идёт сбой, цифры и куски интерфейса
 * падают вниз, шапка повисает на одном углу, сверху отчёт о падении. Кнопка собирает всё обратно
 * и уводит на главную. Движение одно и один раз, в спокойном виде остаётся только текст
 */
export function Crash() {
  const router = useRouter()
  const path = useSyncExternalStore(never, () => window.location.pathname, () => '/')
  const [fixing, setFixing] = useState(false)
  // ВРЕМЕННО: вариант на выбор, после ответа Lexandro останется один
  const v = useSyncExternalStore(never, () => new URLSearchParams(window.location.search).get('v') ?? 'a', () => 'a')

  const fix = () => {
    setFixing(true)
    window.setTimeout(() => router.push('/'), FIX)
  }

  return (
    <section className={styles.page} data-crash="" data-v={v} data-fixing={fixing || undefined}>
      <div className={styles.debris} aria-hidden="true">
        <svg className={styles.cracks} viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path d="M318 600 356 520 330 470 392 400 372 352 430 300" />
          <path d="M356 520 300 496 262 512" />
          <path d="M392 400 452 412 486 386" />
          <path d="M742 600 716 540 760 492 738 450" />
          <path d="M716 540 664 528" />
        </svg>
        <span className={styles.wire} />
        <span className={`${styles.piece} ${styles.four} ${styles.first}`}>4</span>
        <span className={`${styles.piece} ${styles.zero} ${styles.zeroTop}`}>0</span>
        <span className={`${styles.piece} ${styles.zero} ${styles.zeroLow}`}>0</span>
        <span className={`${styles.piece} ${styles.four} ${styles.hung}`}>4</span>
        <span className={`${styles.piece} ${styles.photo}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
          <img src={asset(PHOTO.formats[0].src)} alt="" width={PHOTO.w} height={PHOTO.h} />
          <svg viewBox="0 0 100 125" preserveAspectRatio="none">
            <path d="M62 44 100 18M62 44 74 0M62 44 18 0M62 44 0 52M62 44 20 125M62 44 88 125M62 44 100 74" />
            <path d="M48 36 74 30 80 54 58 66 42 54Z" />
          </svg>
        </span>
        <span className={`${styles.piece} ${styles.chip}`}>написать →</span>
        <span className={`${styles.piece} ${styles.strip}`}>под ключ: дизайн-система · интерфейсы · вёрстка</span>
        <span className={`${styles.piece} ${styles.tag}`}>01 / 08 · intro</span>
      </div>

      <div className={styles.report}>
        <pre className={styles.log} aria-hidden="true">
          <b>FATAL 404</b>
          {`  страница не найдена
  at router.find("${path}")
  at layout.render: сетка потеряла опору
  at styles.apply: стили отвалились
  at gravity.enable: включилась гравитация`}
        </pre>
        <h1 className={styles.title}>всё сломалось.</h1>
        <p className={styles.text}>Такой страницы нет, и сайт рухнул, пока её искал. Кейсы при этом целы.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.fix} onClick={fix}>
            собрать обратно
            <Arrow />
          </button>
          <Button href="/#works" variant="ghost">
            к кейсам
          </Button>
        </div>
      </div>
    </section>
  )
}
