'use client'

import { useEffect, useRef, useState } from 'react'
import { QUAD, SCENE, STAR_F, STAR_V } from './shader'
import styles from './Sky.module.css'

type Nav = Navigator & { deviceMemory?: number }
type V3 = [number, number, number]

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
/** Сколько пикселей считаем за кадр: на широком мониторе холст рисуется мельче и растягивается */
const BUDGET = 2_400_000
const BUDGET_WEAK = 620_000
/** Медленное вращение рисуем раз в 33 мс: за кадр Луна сдвигается меньше пикселя. Курсор, скролл и жест рисуются на каждом кадре */
const FRAME = 33
/** Градусов в секунду: вращение едва заметное */
const SPIN = 0.5
const HEAVY = 22

const D = Math.PI / 180
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const point = (lat: number, lon: number): V3 => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)]

/** Поворот из камеры в карту Луны: точка карты lat/lon встаёт под камеру, север смотрит вверх */
function bodyMatrix(C: V3, lat: number, lon: number) {
  const n = norm([-C[0], -C[1], -C[2]])
  const up = norm([-n[1] * n[0], 1 - n[1] * n[1], -n[1] * n[2]])
  const right = cross(up, n)
  const T = point(lat, lon)
  const north = norm([-T[1] * T[0], 1 - T[1] * T[1], -T[1] * T[2]])
  const east = cross(north, T)
  /* По столбцам: R = east⊗right + north⊗up + T⊗n */
  const m = new Float32Array(9)
  for (let c = 0; c < 3; c++)
    for (let r = 0; r < 3; r++) m[c * 3 + r] = east[r] * right[c] + north[r] * up[c] + T[r] * n[c]
  return m
}

function skyMatrix(yaw: number, pitch: number) {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  return new Float32Array([cy, sp * sy, -cp * sy, 0, cp, sp, sy, -sp * cy, cp * cy])
}

/**
 * Фон тем Луна и Космос: одна сцена на обе. В Космосе Луна висит у первого экрана, её можно крутить,
 * в теме Луна камера садится на низкую орбиту и поверхность становится фоном страницы. Смена
 * темы это перелёт. Рисует только когда что-то движется, на слабом устройстве считает меньше
 * пикселей и меньше звёзд, без WebGL2 остаётся ровный цвет темы.
 */
export default function Scene() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [gen, setGen] = useState(0)

  useEffect(() => {
    const el = canvas.current
    const gl = el?.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!el || !gl) return
    /* Повторный монтаж на том же холсте (StrictMode в dev): контекст уже потерян, берём новый холст */
    if (gl.isContextLost()) {
      setGen((g) => g + 1)
      return
    }

    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const nav = navigator as Nav
    const weak = matchMedia('(pointer: coarse)').matches || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4

    const program = (vs: string, fs: string) => {
      const p = gl.createProgram()!
      for (const [type, source] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
        const s = gl.createShader(type)!
        gl.shaderSource(s, source)
        gl.compileShader(s)
        gl.attachShader(p, s)
      }
      gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.warn(gl.getProgramInfoLog(p))
      return p
    }
    const scene = program(QUAD, SCENE)
    const stars = program(STAR_V, STAR_F)
    const loc = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n)
    const u = Object.fromEntries(
      ['uRes', 'uFocal', 'uC', 'uBody', 'uSkyM', 'uSun', 'uIn'].map((n) => [n, loc(scene, n)]),
    )
    const s = Object.fromEntries(['uRes', 'uFocal', 'uC', 'uSkyT', 'uPx', 'uDim'].map((n) => [n, loc(stars, n)]))

    const quad = gl.createVertexArray()
    gl.bindVertexArray(quad)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const qp = gl.getAttribLocation(scene, 'p')
    gl.enableVertexAttribArray(qp)
    gl.vertexAttribPointer(qp, 2, gl.FLOAT, false, 0, 0)

    /* Яркость звёзд по степенному закону: много слабых, единицы ярких. Сид постоянный */
    const count = weak ? 2600 : 6500
    const data = new Float32Array(count * 5)
    let seed = 1969
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
    for (let i = 0; i < count; i++) {
      const z = rnd() * 2 - 1
      const a = rnd() * Math.PI * 2
      const r = Math.sqrt(1 - z * z)
      data.set([r * Math.cos(a), z, r * Math.sin(a), rnd() ** 5, rnd()], i * 5)
    }
    const field = gl.createVertexArray()
    gl.bindVertexArray(field)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    const sp = gl.getAttribLocation(stars, 'p')
    const sm = gl.getAttribLocation(stars, 'm')
    gl.enableVertexAttribArray(sp)
    gl.vertexAttribPointer(sp, 3, gl.FLOAT, false, 20, 0)
    gl.enableVertexAttribArray(sm)
    gl.vertexAttribPointer(sm, 2, gl.FLOAT, false, 20, 12)

    /* Текстуры приходят после первой отрисовки, до них видно только звёзды */
    gl.useProgram(scene)
    const slots = ['uAlb', 'uNx', 'uNy', 'uSky'] as const
    const blank = new Uint8Array([0, 0, 0, 255])
    slots.forEach((name, i) => {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blank)
      gl.uniform1i(loc(scene, name), i)
    })
    const tag = weak ? '-lo' : ''
    const files = [`moon-albedo${tag}`, `moon-nx${tag}`, `moon-ny${tag}`, 'sky']
    let waiting = files.length
    let shown = 0
    let mounted = true
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic')
    files.forEach((name, i) => {
      const img = new Image()
      img.onload = () => {
        if (!mounted) return
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, weak ? 2 : 4)
        waiting -= 1
        wake()
      }
      img.src = `${BASE}/space/${name}.webp`
    })

    let spin = 0
    let lastSpin = 0
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const grab = { on: false, x: 0, y: 0, lon: 0, lat: 0, vx: 0 }
    const turn = { lon: 0, lat: 0 }

    let frame = 0
    let last = 0
    let scale = 1
    let slow = 0
    let slowed = 0
    let still = calm
    let drawnCount = 0
    const pixel = new Uint8Array(4)

    /* Где стоит Луна, решает вёрстка: первый экран держит пустой блок data-moon. Нет блока, Луны на странице нет */
    const place = () => {
      const box = document.querySelector('[data-moon]')?.getBoundingClientRect()
      if (!box?.width) return { x: innerWidth * 3, y: -innerHeight * 3, r: 40, top: -1 }
      const title = document.getElementById('hero-title')?.getBoundingClientRect()
      return {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
        r: box.width / 2,
        top: title ? title.top + scrollY - 46 : -1,
      }
    }

    const draw = (at: ReturnType<typeof place>) => {
      const W = el.width
      const H = el.height
      const k = W / innerWidth
      const y = calm ? 0 : scrollY
      const vh = innerHeight
      const fov = 26 * D
      const focal = H / 2 / Math.tan(fov / 2)

      /* Сфера нужного размера в нужном месте экрана */
      const dist = (focal / k / at.r) * (1 + Math.min(y / vh, 1.4) * 0.3)
      /* Параллакс: шар чуть отстаёт от страницы при скролле и плывёт навстречу курсору, звёзды глубже и двигаются меньше */
      const sx = (((at.x - innerWidth / 2 - pointer.x * 18) * k) / focal) * dist
      const sy = (((innerHeight / 2 - at.y - y * 0.22 + pointer.y * 14) * k) / focal) * dist
      const far: V3 = [sx, sy, -dist]

      const C = far

      /* Со скроллом и курсором шар чуть поворачивается, как будто смотришь на него с разных сторон */
      const lat = 4 * D + turn.lat - pointer.y * 3 * D - (y / vh) * 2.5 * D
      const lon = -6 * D + spin + turn.lon + pointer.x * 4 * D + (y / vh) * 5 * D
      const body = bodyMatrix(C, lat, lon)

      const sun = norm([
        0.86 + pointer.x * 0.16,
        0.24 - pointer.y * 0.16,
        0.42,
      ])
      const skyM = skyMatrix(y * 0.00011 + pointer.x * 0.008, y * 0.00005 - pointer.y * 0.006)

      gl.disable(gl.BLEND)
      gl.useProgram(scene)
      gl.bindVertexArray(quad)
      gl.uniform2f(u.uRes, W, H)
      gl.uniform1f(u.uFocal, focal)
      gl.uniform3f(u.uC, C[0], C[1], C[2])
      gl.uniformMatrix3fv(u.uBody, false, body)
      gl.uniformMatrix3fv(u.uSkyM, false, skyM)
      gl.uniform3f(u.uSun, sun[0], sun[1], sun[2])
      gl.uniform1f(u.uIn, shown)
      const watched = ++drawnCount % 4 === 0
      const start = performance.now()
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE)
      gl.useProgram(stars)
      gl.bindVertexArray(field)
      gl.uniform2f(s.uRes, W, H)
      gl.uniform1f(s.uFocal, focal)
      gl.uniform3f(s.uC, C[0], C[1], C[2])
      /* Обратный поворот это транспонированная матрица */
      gl.uniformMatrix3fv(s.uSkyT, true, skyM)
      gl.uniform1f(s.uPx, Math.max(k, 0.8))
      gl.uniform1f(s.uDim, 1)
      gl.drawArrays(gl.POINTS, 0, count)
      if (!watched || still) return
      /* rAF о загрузке видеокарты не говорит: readPixels ждёт, пока кадр дорисуется */
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      slow = performance.now() - start > HEAVY ? slow + 1 : Math.max(0, slow - 1)
      if (slow < 6) return
      slow = 0
      slowed += 1
      if (slowed > 2) still = true
      else {
        scale *= 0.74
        resize()
      }
    }

    let drawn = ''
    const tick = (now: number) => {
      frame = 0
      if (!waiting && shown < 1) shown = Math.min(1, shown + 0.04)
      const dtf = lastSpin ? Math.min(now - lastSpin, 100) : 16
      const ease = 1 - 0.92 ** (dtf / 33)
      pointer.x += (pointer.tx - pointer.x) * ease
      pointer.y += (pointer.ty - pointer.y) * ease
      if (!grab.on) {
        turn.lon += grab.vx
        grab.vx *= 0.94
      }
      const dt = lastSpin ? Math.min(now - lastSpin, 100) : 0
      lastSpin = now
      const at = place()
      const turning = !still && !document.hidden && scrollY < innerHeight * 1.2 && at.top !== -1
      if (turning) spin += dt * SPIN * D * 0.001
      const settling =
        (!waiting && shown < 1) ||
        Math.abs(grab.vx) > 1e-5 ||
        Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002
      const key = `${scrollY} ${el.width} ${el.height} ${waiting}`
      const moving = turning || settling
      /* Курсор, скролл и жест рисуем на каждом кадре, одно вращение раз в FRAME */
      if (settling || key !== drawn || (turning && now - last >= FRAME)) {
        last = now
        draw(at)
        drawn = key
      }
      if (moving && !document.hidden) frame = requestAnimationFrame(tick)
    }
    function wake() {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    function resize() {
      if (!el) return
      const fit = Math.sqrt((weak ? BUDGET_WEAK : BUDGET) / (innerWidth * innerHeight))
      const px = Math.min(devicePixelRatio || 1, 2, fit) * scale
      el.width = Math.round(innerWidth * px)
      el.height = Math.round(innerHeight * px)
      gl!.viewport(0, 0, el.width, el.height)
      drawn = ''
      wake()
    }

    const follow = (e: PointerEvent) => {
      pointer.tx = e.clientX / innerWidth - 0.5
      pointer.ty = e.clientY / innerHeight - 0.5
      if (grab.on) {
        const at = place()
        const lon = grab.lon - ((e.clientX - grab.x) / at.r) * 1.1
        grab.vx = (lon - turn.lon) * 0.5
        turn.lon = lon
        turn.lat = Math.max(-1, Math.min(1, grab.lat + ((e.clientY - grab.y) / at.r) * 1.1))
      }
      wake()
    }
    /* Хватаем только за саму Луну и только мимо текста и кнопок */
    const press = (e: PointerEvent) => {
      if (!(e.target as Element).closest('[data-moon]')) return
      const at = place()
      if (Math.hypot(e.clientX - at.x, e.clientY - at.y) > at.r) return
      grab.on = true
      grab.x = e.clientX
      grab.y = e.clientY
      grab.lon = turn.lon
      grab.lat = turn.lat
      document.documentElement.style.cursor = 'grabbing'
    }
    const release = () => {
      grab.on = false
      document.documentElement.style.cursor = ''
    }

    addEventListener('resize', resize)
    addEventListener('scroll', wake, { passive: true })
    addEventListener('visibilitychange', wake)
    if (!calm) {
      addEventListener('pointermove', follow, { passive: true })
      addEventListener('pointerdown', press, { passive: true })
      addEventListener('pointerup', release, { passive: true })
      addEventListener('pointercancel', release, { passive: true })
    }
    resize()
    el.classList.add(styles.ready)

    return () => {
      mounted = false
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      cancelAnimationFrame(frame)
      removeEventListener('resize', resize)
      removeEventListener('scroll', wake)
      removeEventListener('visibilitychange', wake)
      removeEventListener('pointermove', follow)
      removeEventListener('pointerdown', press)
      removeEventListener('pointerup', release)
      removeEventListener('pointercancel', release)
    }
  }, [gen])

  return <canvas key={gen} ref={canvas} className={styles.plate} aria-hidden="true" />
}
