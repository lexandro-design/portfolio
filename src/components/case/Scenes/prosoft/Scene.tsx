'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { asset } from '@/lib/asset'
import type { SceneProps } from '../types'
import { Back, Brief, Controls, Facts, Lead, Meta, Note, Reveal, Title, usePlay, useReduced } from '../kit'
import scene from '../Scene.module.css'
import styles from './Scene.module.css'

type Page = { id: string; page: string; title: string; text: string }
type Data = {
  note: string
  credit: { role: string; name: string; href: string; handle: string }
  pages: Page[]
}

/** Сцена держится 7 секунд; петли длиной от 5 до 10 секунд, короткая успевает начаться заново */
const SPAN = 7000
const SPANS = Array.from({ length: 7 }, () => SPAN)

/** Телефон получает отдельный файл: кадр срезан к модели и весит втрое меньше */
const PHONE = '(max-width: 767px)'

function usePhone() {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = matchMedia(PHONE)
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

/** Петля 3D-сцены. Постер стоит сразу, ролик проявляется поверх, когда готов. За экраном стоит на паузе */
function Loop({ id, phone, run }: { id: string; phone: boolean; run: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const name = `/cases/prosoft/3d/${id}${phone ? '-sm' : ''}`
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (run) void v.play().catch(() => {})
    else v.pause()
  }, [run, name])
  return (
    <div className={styles.loop}>
      {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
      <img className={styles.media} src={asset(`${name}.webp`)} alt="" width={1600} height={800} decoding="async" />
      {run && <video key={name} ref={ref} className={styles.media} src={asset(`${name}.mp4`)} muted loop playsInline autoPlay preload="auto" aria-hidden="true" />}
    </div>
  )
}

/**
 * ПРО-СОФТ. Сцена: витрина первых экранов сайта. У каждой страницы своя 3D-модель
 * по смыслу услуги, справа в кадре петля, слева заголовок, как на самом макете.
 * Шаг сцены это страница сайта; миниатюры переключают её руками
 */
export function Scene({ item, meta, facts, brief, t, data }: SceneProps) {
  const d = data as unknown as Data
  const [ref, play] = usePlay(SPANS, { hold: SPAN })
  const still = useReduced()
  const phone = usePhone()
  const { step } = play
  const cur = d.pages[step]

  // Прошлая сцена лежит под новой, пока та проявляется: без вспышки фона
  const [prev, setPrev] = useState<string | null>(null)
  const was = useRef(cur.id)
  useEffect(() => {
    if (was.current === cur.id) return
    setPrev(was.current)
    was.current = cur.id
    const id = window.setTimeout(() => setPrev(null), 700)
    return () => window.clearTimeout(id)
  }, [cur.id])

  return (
    <header ref={ref} className={`${scene.scene} ${styles.root}`}>
      <div className="container">
        <Back meta={meta} />
        <Meta item={item} meta={meta} />
        <Title item={item} />
      </div>

      <div className={styles.band}>
        <div className={styles.stage}>
          {prev && <Loop key={prev} id={prev} phone={phone} run={false} />}
          <div key={cur.id} className={styles.now}>
            <Loop id={cur.id} phone={phone} run={play.inView && !still} />
          </div>
          <div key={`t-${cur.id}`} className={styles.copy}>
            <span className={styles.page}>{cur.page}</span>
            <strong className={styles.head}>{cur.title}</strong>
            <span className={styles.text}>{cur.text}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <ol className={styles.thumbs}>
          {d.pages.map((p, i) => (
            <li key={p.id}>
              <button type="button" className={styles.thumb} aria-current={i === step || undefined} onClick={() => play.go(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element -- статическая выгрузка, оптимизатора next/image нет */}
                <img src={asset(`/cases/prosoft/3d/${p.id}-th.webp`)} alt="" width={360} height={240} loading="lazy" decoding="async" />
                <span>{p.page}</span>
                {i === step && play.playing && <i style={{ '--run': `${SPAN}ms` } as CSSProperties} />}
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.under}>
          <Controls play={play} t={{ ...t.show.cast, prev: t.show.prev, next: t.show.next }} className={styles.controls} />
          <Note>{d.note}</Note>
        </div>

        <Reveal className={styles.intro}>
          <Lead item={item} />
          <a className={styles.credit} href={d.credit.href} target="_blank" rel="noreferrer">
            <span>{d.credit.role}</span>
            <b>{d.credit.name}</b>
            <span>github.com/{d.credit.handle}</span>
          </a>
          <Facts facts={facts} className={styles.facts} />
        </Reveal>
      </div>
      <Brief brief={brief} t={t.brief} />
    </header>
  )
}
