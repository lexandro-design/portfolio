'use client'

import { useEffect, useRef } from 'react'
import { readTheme, subscribeTheme, THEME_EVENT } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import { VERTEX } from '../Steel/shader'
import { BANDS, MATERIALS, TINTS, type Material } from './materials'
import { readChoice, subscribeChoice } from './store'
import styles from './Surface.module.css'

type Tilt = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> }
type Nav = Navigator & { deviceMemory?: number }

/** Сколько пикселей считаем за кадр: на широком мониторе холст рисуется мельче и растягивается */
const BUDGET = 3_000_000
const BUDGET_MOVING = 1_400_000
const BUDGET_WEAK = 700_000
/** Живые материалы не чаще 30 кадров в секунду */
const FRAME = 33

const NAMES = ['uRes', 'uLight', 'uScroll', 'uDpr', 'uTime', 'uIn', 'uBand', 'uTint', 'uAmount', 'uSat'] as const

/**
 * Холст примерочной фона: один WebGL на все материалы, программа собирается
 * при первом выборе. Рисует только когда сдвинулась лампа или страница; живые
 * материалы идут во времени, пока вкладка видна. На слабом устройстве считает
 * меньше пикселей, а если кадры всё равно не успевают, останавливает движение
 */
export function Surface() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const gl = el?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!el || !gl) return

    const root = document.documentElement
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const nav = navigator as Nav
    const weak = matchMedia('(pointer: coarse)').matches || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    type Built = { program: WebGLProgram; u: Record<(typeof NAMES)[number], WebGLUniformLocation | null> }
    const built = new Map<string, Built>()
    const build = (m: Material) => {
      const ready = built.get(m.id)
      if (ready) return ready
      const program = gl.createProgram()!
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `${weak ? '#define LOW\n' : ''}${m.source}`))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
      const u = Object.fromEntries(NAMES.map((n) => [n, gl.getUniformLocation(program, n)])) as Built['u']
      const out = { program, u }
      built.set(m.id, out)
      return out
    }

    let active: { material: Material; run: Built } | null = null
    let target = { x: innerWidth * 0.72, y: innerHeight * 0.3 }
    const light = { ...target }
    let frame = 0
    let drawn = ''
    let last = 0
    let scale = 1
    let moving = false
    let slow = 0
    let slowed = 0

    const draw = (now: number) => {
      if (!active) return
      const { u } = active.run
      gl.uniform2f(u.uLight, light.x, light.y)
      gl.uniform1f(u.uScroll, calm ? 0 : scrollY)
      gl.uniform1f(u.uTime, now / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    /* Кадры не успевают: сначала считаем меньше пикселей, потом останавливаем время */
    const watch = (gap: number) => {
      if (gap > 200) return
      slow = gap > 48 ? slow + 1 : Math.max(0, slow - 1)
      if (slow < 12) return
      slow = 0
      slowed += 1
      if (slowed > 2) moving = false
      else {
        scale *= 0.72
        resize()
      }
    }

    const tick = (now: number) => {
      frame = 0
      if (!active) return
      light.x += (target.x - light.x) * 0.12
      light.y += (target.y - light.y) * 0.12
      const settling = Math.abs(target.x - light.x) + Math.abs(target.y - light.y) > 0.5
      const key = `${Math.round(light.x)} ${Math.round(light.y)} ${scrollY} ${el.width}`
      if (moving && now - last >= FRAME) {
        if (last) watch(now - last)
        last = now
        draw(now)
      } else if (!moving && key !== drawn) {
        draw(now)
        drawn = key
      }
      if ((moving || settling) && !document.hidden) frame = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (active && !frame) frame = requestAnimationFrame(tick)
    }

    function resize() {
      if (!el || !active) return
      const budget = weak ? BUDGET_WEAK : active.material.moving ? BUDGET_MOVING : BUDGET
      const fit = Math.sqrt(budget / (innerWidth * innerHeight))
      const dpr = Math.min(devicePixelRatio || 1, 2, fit) * scale
      el.width = Math.round(innerWidth * dpr)
      el.height = Math.round(innerHeight * dpr)
      gl!.viewport(0, 0, el.width, el.height)
      gl!.uniform2f(active.run.u.uRes, el.width, el.height)
      gl!.uniform1f(active.run.u.uDpr, dpr)
      drawn = ''
      wake()
    }

    const follow = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY }
      wake()
    }
    const touch = (event: TouchEvent) => {
      const t = event.touches[0]
      if (t) target = { x: t.clientX, y: t.clientY }
      wake()
    }
    const tilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return
      target = {
        x: innerWidth * (0.5 + (event.gamma / 40) * 0.7),
        y: innerHeight * (0.5 + ((event.beta - 45) / 40) * 0.7),
      }
      wake()
    }

    const listen = (on: boolean) => {
      const set = (on ? window.addEventListener : window.removeEventListener).bind(window) as (
        type: string,
        fn: EventListener,
        options?: AddEventListenerOptions,
      ) => void
      set('resize', resize)
      set('scroll', wake, { passive: true })
      set('visibilitychange', wake)
      if (calm) return
      set('pointermove', follow as EventListener, { passive: true })
      set('touchmove', touch as EventListener, { passive: true })
      set('deviceorientation', tilt as EventListener)
    }

    const off = () => {
      if (!active) return
      active = null
      listen(false)
      cancelAnimationFrame(frame)
      frame = 0
      el.classList.remove(styles.ready)
      delete root.dataset.surface
      window.dispatchEvent(new Event(THEME_EVENT))
    }

    const sync = () => {
      const theme = readTheme()
      const choice = readChoice()
      const material = MATERIALS.find((m) => m.id === choice.material)
      const tint = TINTS.find((t) => t.id === choice.tint) ?? TINTS[0]
      /* Родная сталь в теме Сталь и есть нынешний лист, рисует компонент Steel */
      if (!material || (material.id === 'steel' && theme === 'steel' && !tint.amount)) return off()

      const run = build(material)
      if (!run) return off()
      const first = !active
      const changed = active?.material.id !== material.id
      active = { material, run }
      gl.useProgram(run.program)
      const position = gl.getAttribLocation(run.program, 'p')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
      const { band, sat } = BANDS[theme] ?? BANDS.dark
      gl.uniform2f(run.u.uIn, material.range[0], material.range[1])
      gl.uniform2f(run.u.uBand, band[0], band[1])
      gl.uniform3f(run.u.uTint, tint.color[0], tint.color[1], tint.color[2])
      gl.uniform1f(run.u.uAmount, tint.amount)
      gl.uniform1f(run.u.uSat, sat)
      if (changed) {
        moving = Boolean(material.moving) && !calm
        slow = 0
        slowed = 0
        scale = 1
        last = 0
      }
      if (first) {
        listen(true)
        /* Айфон отдаёт наклон только с разрешения и только из нажатия: материал выбран нажатием */
        if (navigator.userActivation?.isActive) (DeviceOrientationEvent as Tilt).requestPermission?.().catch(() => {})
      }
      el.classList.add(styles.ready)
      if (root.dataset.surface !== material.id) {
        root.dataset.surface = material.id
        window.dispatchEvent(new Event(THEME_EVENT))
      }
      resize()
      draw(performance.now())
    }

    const lost = () => off()
    el.addEventListener('webglcontextlost', lost)
    const unTheme = subscribeTheme(sync)
    const unChoice = subscribeChoice(sync)
    sync()
    return () => {
      unTheme()
      unChoice()
      el.removeEventListener('webglcontextlost', lost)
      off()
    }
  }, [])

  return <canvas ref={canvas} className={styles.plate} aria-hidden="true" />
}
