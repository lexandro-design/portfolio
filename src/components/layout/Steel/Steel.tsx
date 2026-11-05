'use client'

import { useEffect, useRef } from 'react'
import { readTheme, subscribeTheme } from '@/components/layout/ThemeSwitch/ThemeSwitch'
import { FRAGMENT, VERTEX } from './shader'
import styles from './Steel.module.css'

type Tilt = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> }

/** Лист стали на весь экран: лампа идёт за курсором, пальцем и наклоном телефона,
    при скролле лист едет под лампой. Рисует только когда что-то сдвинулось.
    Без WebGL остаётся картинка steel.webp из темы */
export function Steel() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const shadow = useRef<SVGFEOffsetElement>(null)
  const rim = useRef<SVGFEOffsetElement>(null)

  useEffect(() => {
    const el = canvas.current
    const gl = el?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!el || !gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(program, 'uRes')
    const uLight = gl.getUniformLocation(program, 'uLight')
    const uScroll = gl.getUniformLocation(program, 'uScroll')
    const uDpr = gl.getUniformLocation(program, 'uDpr')

    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    let target = { x: innerWidth * 0.72, y: innerHeight * 0.3 }
    let light = { ...target }
    let frame = 0
    let on = false
    let drawn = ''

    const draw = () => {
      gl.uniform2f(uLight, light.x, light.y)
      gl.uniform1f(uScroll, calm ? 0 : scrollY)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      /* Тень в буквах падает от лампы: сверху вниз, чуть в сторону от неё */
      const dx = (innerWidth / 2 - light.x) / innerWidth
      const dy = 0.6 + (0.5 - light.y / innerHeight) * 0.8
      root.style.setProperty('--steel-x', dx.toFixed(3))
      root.style.setProperty('--steel-y', dy.toFixed(3))
      shadow.current?.setAttribute('dx', (dx * 3).toFixed(2))
      shadow.current?.setAttribute('dy', (dy * 2.4).toFixed(2))
      rim.current?.setAttribute('dx', (dx * 1.4).toFixed(2))
      rim.current?.setAttribute('dy', (dy * 1.2).toFixed(2))
    }

    const tick = () => {
      frame = 0
      if (!on) return
      light.x += (target.x - light.x) * 0.12
      light.y += (target.y - light.y) * 0.12
      const key = `${Math.round(light.x)} ${Math.round(light.y)} ${scrollY} ${el.width}`
      if (key !== drawn) {
        draw()
        drawn = key
      }
      if (Math.abs(target.x - light.x) + Math.abs(target.y - light.y) > 0.5) frame = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (on && !frame) frame = requestAnimationFrame(tick)
    }

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      el.width = Math.round(innerWidth * dpr)
      el.height = Math.round(innerHeight * dpr)
      gl.viewport(0, 0, el.width, el.height)
      gl.uniform2f(uRes, el.width, el.height)
      gl.uniform1f(uDpr, dpr)
      drawn = ''
      wake()
    }

    const follow = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY }
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

    const start = () => {
      if (on) return
      on = true
      el.classList.add(styles.ready)
      addEventListener('resize', resize)
      if (!calm) {
        /* Вход в тему: лампа один раз проходит по листу */
        light = { x: -innerWidth * 0.2, y: target.y }
        addEventListener('pointermove', follow, { passive: true })
        addEventListener('scroll', wake, { passive: true })
        addEventListener('deviceorientation', tilt)
      }
      resize()
    }
    const stop = () => {
      on = false
      cancelAnimationFrame(frame)
      frame = 0
      el.classList.remove(styles.ready)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', follow)
      removeEventListener('scroll', wake)
      removeEventListener('deviceorientation', tilt)
    }
    const sync = () => {
      /* Материал из примерочной рисует свой холст, лист в это время спит */
      if (readTheme() !== 'steel' || document.documentElement.dataset.surface) return stop()
      /* Айфон отдаёт наклон только с разрешения и только из нажатия: тема выбрана нажатием */
      if (!on && navigator.userActivation?.isActive) (DeviceOrientationEvent as Tilt).requestPermission?.().catch(() => {})
      start()
    }

    el.addEventListener('webglcontextlost', stop)
    const unsubscribe = subscribeTheme(sync)
    sync()
    return () => {
      unsubscribe()
      el.removeEventListener('webglcontextlost', stop)
      stop()
    }
  }, [])

  return (
    <>
      <canvas ref={canvas} className={styles.plate} aria-hidden="true" />
      <svg className={styles.defs} aria-hidden="true">
        <filter id="engrave" x="-3%" y="-8%" width="106%" height="116%" colorInterpolationFilters="sRGB">
          <feComponentTransfer in="SourceAlpha" result="hole">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feGaussianBlur in="hole" stdDeviation="1.3" result="soft" />
          <feOffset ref={shadow} in="soft" dx="0" dy="2" result="moved" />
          <feFlood floodColor="#000" floodOpacity=".85" />
          <feComposite in2="moved" operator="in" />
          <feComposite in2="SourceAlpha" operator="in" result="inner" />
          <feOffset ref={rim} in="SourceAlpha" dx="0" dy="1" result="edge" />
          <feFlood floodColor="#fff" floodOpacity=".85" />
          <feComposite in2="edge" operator="in" />
          <feComposite in2="SourceAlpha" operator="out" result="light" />
          <feMerge>
            <feMergeNode in="light" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="inner" />
          </feMerge>
        </filter>
      </svg>
    </>
  )
}
