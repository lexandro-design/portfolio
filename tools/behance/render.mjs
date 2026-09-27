// Набор для Behance по кейсу: обложка, первый экран, тексты картинками, два видео,
// телефон, файл Figma и финальный блок с контактами. У проектов разные тема и раскладки
// (по порядку в cases.json), чтобы профиль не выглядел одним шаблоном.
// Кадры видео снимаются детерминированно (анимация на паузе, перемотка по кадрам),
// потом ffmpeg склеивает MP4 и GIF. Нужен полный ffmpeg: FFMPEG=/путь/к/ffmpeg.
//   node tools/behance/render.mjs [slug…]   → _shots/behance/<slug>/ (без slug — все кейсы со скринами)
//   COVER_ONLY=1 — только обложки, NO_VIDEO=1 — без видео
import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdir, readdir, readFile, rm } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const FFMPEG = process.env.FFMPEG || 'ffmpeg'
const read = async (p) => JSON.parse(await readFile(join(ROOT, 'src/content/data', p), 'utf8'))
const cases = await read('cases.json')
const i18n = await read('cases-i18n/en.json')
const site = await read('site.json')

// Дополнительные проекты, которых нет на сайте: tools/behance/extra/<slug>/case.json —
// та же форма, что у кейса в cases.json, плюс поле en с английскими текстами.
// Пути картинок в нём вида /tools/behance/extra/<slug>/01.jpg
const EXTRA = join(ROOT, 'tools/behance/extra')
for (const dir of await readdir(EXTRA).catch(() => [])) {
  const raw = await readFile(join(EXTRA, dir, 'case.json'), 'utf8').catch(() => null)
  if (!raw) continue
  const { en, ...c } = JSON.parse(raw)
  cases.push(c)
  if (en) i18n[c.slug] = en
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
}
let html = ''
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (path === '/card') return res.writeHead(200, { 'content-type': TYPES['.html'] }).end(html)
  try {
    const body = await readFile(join(ROOT, path))
    res
      .writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
      .end(body)
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(8797, r))

const W = 1400

// Темы. ТИТАН-2 всегда в их синем, остальные по кругу: песок, графит, светлый тон
// из цвета самого сайта. Шрифт заголовков тоже меняется
const THEMES = {
  // ТИТАН-2: их сайты и приложения сами синие, на синем фоне сливались. Фон светлый,
  // фирменный синий — плашкой за устройствами и финальным слайдом
  titan: {
    bg: '#edf1f7',
    fg: '#0b2a5c',
    sub: 'rgb(11 42 92 / .6)',
    bar: '#ffffff',
    dot: 'rgb(11 42 92 / .16)',
    ring: 'rgb(11 42 92 / .1)',
    shade: 'rgb(10 40 90 / .3)',
    head: 'Inter',
    weight: 600,
    brand: '#0a4a9a',
  },
  sand: {
    bg: '#e9e6df',
    fg: '#14140f',
    sub: 'rgb(20 20 15 / .56)',
    bar: '#f6f5f1',
    dot: 'rgb(0 0 0 / .13)',
    ring: 'rgb(0 0 0 / .07)',
    shade: 'rgb(40 30 10 / .22)',
    head: 'Inter',
    weight: 450,
  },
  ink: {
    bg: '#111113',
    fg: '#f5f5f2',
    sub: 'rgb(245 245 242 / .56)',
    bar: '#232327',
    dot: 'rgb(255 255 255 / .18)',
    ring: 'rgb(255 255 255 / .1)',
    shade: 'rgb(0 0 0 / .6)',
    head: 'Unbounded',
    weight: 500,
  },
  tint: (accent) => ({
    bg: `color-mix(in srgb, ${accent} 16%, #f3f2ee)`,
    fg: '#14140f',
    sub: 'rgb(20 20 15 / .58)',
    bar: '#fbfaf8',
    dot: 'rgb(0 0 0 / .13)',
    ring: 'rgb(0 0 0 / .07)',
    shade: `color-mix(in srgb, ${accent} 40%, rgb(0 0 0 / .3))`,
    head: 'Inter',
    weight: 600,
  }),
}

const font = (family, file) =>
  ['cyrillic', 'latin']
    .map(
      (s) =>
        `@font-face{font-family:'${family}';src:url(/node_modules/@fontsource-variable/${file}/files/${file}-${s}-wght-normal.woff2) format('woff2');font-weight:100 900}`,
    )
    .join('')

// Окно всегда целиком: скругление со всех сторон, длинная страница режется внутри рамки,
// а не краем картинки. Тень в видео короче и плотнее: мягкий градиент в GIF идёт грязной
// сеткой дизеринга
const shell = (
  t,
  w,
  h,
  body,
  css = '',
  video = false,
) => `<!doctype html><meta charset="utf-8"><style>
${font('Inter', 'inter')}${font('Mono', 'jetbrains-mono')}${font('Unbounded', 'unbounded')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${t.bg};color:${t.fg};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.m{font-family:Mono,monospace;letter-spacing:.08em;text-transform:uppercase;color:${t.sub}}
.h{font-family:${t.head},Inter,sans-serif;font-weight:${t.weight};letter-spacing:${t.head === 'Unbounded' ? '-.02em' : '-.04em'};line-height:1.04}
.win{position:absolute;background:${t.bar};border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px ${t.ring},${video ? `0 18px 36px -18px ${t.shade}` : `0 2px 6px -2px ${t.shade},0 36px 80px -28px ${t.shade}`}}
.bar{height:40px;display:flex;align-items:center;gap:8px;padding:0 18px}
.bar i{width:11px;height:11px;border-radius:50%;background:${t.dot}}
.bar span{margin:0 auto;width:34%;height:20px;border-radius:10px;background:color-mix(in srgb, ${t.dot} 50%, transparent);font:500 11px/20px Mono,monospace;letter-spacing:.02em;text-align:center;color:${t.sub};overflow:hidden;white-space:nowrap}
.win img{display:block;width:100%;height:auto}
.phone{position:absolute;border-radius:46px;background:#1b1b1d;padding:8px;box-shadow:inset 0 0 0 1.5px #3a3a3e,${video ? `0 18px 36px -18px ${t.shade}` : `0 30px 70px -20px ${t.shade}`}}
.scr{position:relative;width:100%;height:100%;border-radius:38px;overflow:hidden;background:#fff}
.status{position:absolute;inset:0 0 auto;height:44px;background:#fff;color:#111;font:600 14px Inter;padding:15px 0 0 30px}
.island{position:absolute;left:50%;top:18px;width:78px;height:22px;margin-left:-39px;border-radius:12px;background:#000}
.card{border-radius:12px;overflow:hidden;box-shadow:0 0 0 1px ${t.ring},0 14px 30px -16px ${t.shade}}
.card img{display:block;width:100%}
.dev{position:absolute;filter:drop-shadow(0 30px 40px ${t.shade})}
.zoom{position:absolute;overflow:hidden;border-radius:14px;background:#fff;box-shadow:0 0 0 1px ${t.ring},0 28px 60px -20px ${t.shade},0 0 0 6px color-mix(in srgb, ${t.bg} 70%, #fff)}
.mini{height:18px;background:#f1f1f3;border-bottom:1px solid #e3e3e6;font:500 9px/18px Mono,monospace;color:#777;text-align:center}
.brand{position:absolute;border-radius:28px;background:${t.brand ?? 'transparent'}}
${css}</style>${body}`

// Картинки кейсов лежат в public/, у дополнительных проектов — рядом с их case.json
const u = (s) => (s.src.startsWith('/tools/') ? s.src : `/public${s.src}`)
// Адрес живого сайта в строке браузера, у внутренних систем строка пустая
let URL_TEXT = ''
const barHtml = () => `<div class="bar"><i></i><i></i><i></i><span>${URL_TEXT}</span></div>`
// Высота — потолок: широкий экран не оставляет пустое окно под собой
const win = (s, x, y, w, h, attrs = '') =>
  `<div class="win" ${attrs} style="left:${x}px;top:${y}px;width:${w}px;height:${Math.min(h, Math.round((w * s.h) / s.w) + 40)}px">${barHtml()}<img src="${u(s)}"></div>`

const isPhone = (s) => /^телефон/i.test(s.caption)
const isFigma = (s) => /^файл в figma/i.test(s.caption)
const isTablet = (s) => /^планшет/i.test(s.caption)
// Тёмная версия экрана идёт отдельным кадром сразу за светлой
const desktop = (c) =>
  c.shots
    .filter((s) => !isPhone(s) && !isFigma(s) && !isTablet(s) && !/^обложка/i.test(s.caption))
    .flatMap((s) => (s.dark ? [s, { ...s, src: s.dark }] : [s]))

// В английском тексте кейсов встречается тире, в клиентских текстах его не ставим
const clean = (t) =>
  t
    .replaceAll(' — ', ': ')
    .replaceAll('—', '-')
    .replaceAll('TITAN-2', '<span style="white-space:nowrap">TITAN-2</span>')
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const STACK_EN = {
  'Дизайн-система': 'Design system',
  Прототип: 'Prototype',
  'Дизайн-система AIPlan-R': 'AIPlan-R design system',
  Адаптив: 'Responsive',
  'Анимация по скроллу': 'Scroll animation',
  'UI-кит': 'UI kit',
  'Светлая и тёмная тема': 'Light and dark theme',
  Дашборды: 'Dashboards',
  '152-ФЗ': '152-FZ',
  'Vision-модель': 'Vision model',
  Эмбеддинги: 'Embeddings',
}

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
)
const open = async (markup, w, h) => {
  html = markup
  const p = await browser.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:8797/card', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  return p
}
const shot = async (markup, w, h, out) => {
  const p = await open(markup, w, h)
  await p.screenshot({ path: out, type: 'jpeg', quality: 92 })
  await p.close()
}

/** Анализ картинок в браузере: основной цвет сайта и рамка первого экрана телефона */
const probe = async (c) => {
  const p = await open('<body></body>', 100, 100)
  const ph = c.shots.find(isPhone)
  const res = await p.evaluate(
    async ([main, phSrc]) => {
      const load = (src) =>
        new Promise((ok) => {
          const i = new Image()
          i.onload = () => ok(i)
          i.src = src
        })
      const ctx = (img) => {
        const cv = document.createElement('canvas')
        cv.width = img.naturalWidth
        cv.height = img.naturalHeight
        const x = cv.getContext('2d', { willReadFrequently: true })
        x.drawImage(img, 0, 0)
        return x
      }
      // Цвет: среднее по насыщенным пикселям верха главной
      const m = await load(main)
      const d = ctx(m).getImageData(0, 0, m.naturalWidth, Math.min(m.naturalHeight, 1400)).data
      let r = 0
      let g = 0
      let b = 0
      let n = 0
      for (let i = 0; i < d.length; i += 16) {
        const mx = Math.max(d[i], d[i + 1], d[i + 2])
        const mn = Math.min(d[i], d[i + 1], d[i + 2])
        if (mx - mn > 60 && mx > 60) {
          r += d[i]
          g += d[i + 1]
          b += d[i + 2]
          n++
        }
      }
      const accent = n > 200 ? `rgb(${(r / n) | 0} ${(g / n) | 0} ${(b / n) | 0})` : '#9a8f7a'
      if (!phSrc) return { accent }
      // Телефон: от фона по средней строке ищем первый экран, потом его верх и низ
      const im = await load(phSrc)
      const x = ctx(im)
      const IW = im.naturalWidth
      const IH = im.naturalHeight
      const px = (X, Y) => x.getImageData(X, Y, 1, 1).data
      const bg = px(3, 3)
      const diff = (a) => Math.max(...[0, 1, 2].map((k) => Math.abs(a[k] - bg[k]))) > 10
      const y = (IH * 0.45) | 0
      let x0 = 0
      while (x0 < IW && !diff(px(x0, y))) x0++
      let x1 = x0
      let run = 0
      while (x1 < IW && run < 12) {
        run = diff(px(x1, y)) ? 0 : run + 1
        x1++
      }
      x1 -= run
      const cx = ((x0 + x1) / 2) | 0
      let y0 = 0
      while (y0 < IH && !diff(px(cx, y0))) y0++
      let y1 = IH - 1
      while (y1 > 0 && !diff(px(cx, y1))) y1--
      return { accent, screen: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 + 1, W: IW } }
    },
    [u(desktop(c)[0]), ph && !ph.screen && u(ph)],
  )
  await p.close()
  // Телефон снят отдельным экраном (screen: true), а не композицией: экран — вся картинка
  if (ph?.screen) res.screen = { x: 0, y: 0, w: ph.w, h: ph.h, W: ph.w }
  return res
}

/** Рамка содержимого на холсте Figma: вокруг макетов много пустого поля */
const contentBox = async (s) => {
  const p = await open('<body></body>', 100, 100)
  const box = await p.evaluate(async (src) => {
    const i = new Image()
    await new Promise((ok) => {
      i.onload = ok
      i.src = src
    })
    const cv = document.createElement('canvas')
    cv.width = i.naturalWidth
    cv.height = i.naturalHeight
    const x = cv.getContext('2d')
    x.drawImage(i, 0, 0)
    const d = x.getImageData(0, 0, cv.width, cv.height).data
    const bg = [d[0], d[1], d[2]]
    let x0 = cv.width
    let y0 = cv.height
    let x1 = 0
    let y1 = 0
    for (let y = 0; y < cv.height; y += 3)
      for (let X = 0; X < cv.width; X += 3) {
        const k = (y * cv.width + X) * 4
        if (Math.max(...[0, 1, 2].map((j) => Math.abs(d[k + j] - bg[j]))) > 14) {
          if (X < x0) x0 = X
          if (X > x1) x1 = X
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
    return { x0, y0, x1, y1, W: cv.width, H: cv.height }
  }, u(s))
  await p.close()
  const pad = Math.round(Math.max(box.x1 - box.x0, box.y1 - box.y0) * 0.04)
  const x = Math.max(0, box.x0 - pad)
  const y = Math.max(0, box.y0 - pad)
  return {
    x,
    y,
    w: Math.min(box.W, box.x1 + pad) - x,
    h: Math.min(box.H, box.y1 + pad) - y,
    W: box.W,
  }
}

/** Телефон с первым экраном из композиции «Телефон: …» */
const phoneEl = (ph, scr, x, y, w) => {
  if (!ph || !scr || scr.w < 80) return ''
  const k = (w - 16) / scr.w
  const h = Math.min(Math.round(scr.h * k) + 44, Math.round((w - 16) * 2.17)) + 16
  return `<div class="phone" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="scr"><img src="${u(ph)}" style="position:absolute;width:${(scr.W * k).toFixed(1)}px;left:${(-scr.x * k).toFixed(1)}px;top:${(44 - scr.y * k).toFixed(1)}px"><b class="status">9:41</b></div><i class="island"></i></div>`
}

/** Экран устройства: картинка сверху по ширине, у сайта с адресом — тонкая строка браузера */
const screen = (s, fit = 'cover') =>
  `${URL_TEXT ? `<div class="mini">${URL_TEXT}</div>` : ''}<img src="${u(s)}" style="display:block;width:100%;height:${URL_TEXT ? 'calc(100% - 18px)' : '100%'};object-fit:${fit};object-position:top center">`

/** Ноутбук: крышка с тёмной рамкой и светлое основание */
const laptop = (s, x, y, w) => {
  const h = Math.round(w * 0.63)
  return `<div class="dev" style="left:${x}px;top:${y}px;width:${w}px">
    <div style="height:${h}px;border-radius:${Math.round(w * 0.028)}px ${Math.round(w * 0.028)}px 4px 4px;background:#1c1c1e;padding:${Math.round(w * 0.022)}px ${Math.round(w * 0.022)}px ${Math.round(w * 0.03)}px;box-shadow:inset 0 0 0 1.5px #3a3a3e">
      <div style="height:100%;overflow:hidden;border-radius:3px;background:#fff">${screen(s)}</div>
    </div>
    <div style="position:relative;height:${Math.round(w * 0.032)}px;margin:0 -${Math.round(w * 0.075)}px;border-radius:0 0 ${Math.round(w * 0.05)}px ${Math.round(w * 0.05)}px;background:linear-gradient(#e4e5e8,#a9abb1)"><i style="position:absolute;left:50%;top:0;width:${Math.round(w * 0.16)}px;margin-left:-${Math.round(w * 0.08)}px;height:${Math.round(w * 0.012)}px;border-radius:0 0 8px 8px;background:#b9bbc0"></i></div>
  </div>`
}

/** Монитор на подставке; ratio — пропорция экрана (для таблиц бывает ультраширокий) */
const monitor = (s, x, y, w, ratio = 1.6) => {
  const h = Math.round(w / ratio)
  const neck = Math.round(w * 0.11)
  return `<div class="dev" style="left:${x}px;top:${y}px;width:${w}px">
    <div style="height:${h}px;border-radius:12px;background:#151517;padding:10px;box-shadow:inset 0 0 0 1.5px #333">
      <div style="height:100%;overflow:hidden;border-radius:3px;background:#fff">${screen(s)}</div>
    </div>
    <div style="width:${Math.round(w * 0.12)}px;height:${neck}px;margin:0 auto;background:linear-gradient(90deg,#b7b9be,#e1e2e5,#b7b9be)"></div>
    <div style="width:${Math.round(w * 0.32)}px;height:10px;margin:0 auto;border-radius:6px 6px 3px 3px;background:linear-gradient(#e6e7ea,#b3b5ba)"></div>
  </div>`
}

/** Лупа: кусок экрана в натуральном размере карточкой поверх устройства */
const zoomCard = (s, x, y, w, h, fx = 0.3, fy = 0.14) =>
  `<div class="zoom" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><img src="${u(s)}" style="position:absolute;width:${s.w}px;left:${-Math.round(s.w * fx)}px;top:${-Math.round(s.h * fy)}px;max-width:none"></div>`

/** Видео: страница с CSS-анимацией, кадр за кадром по времени, потом MP4 и GIF */
const video = async (markup, w, h, seconds, out, gifW = w, fps = 30) => {
  const dir = `${out}-frames`
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  const p = await open(markup, w, h)
  await p.evaluate(() => document.getAnimations().forEach((a) => a.pause()))
  const frames = Math.round(seconds * fps)
  for (let i = 0; i < frames; i++) {
    await p.evaluate(
      (t) => document.getAnimations().forEach((a) => (a.currentTime = t)),
      (i / fps) * 1000,
    )
    await p.screenshot({ path: join(dir, `${String(i).padStart(4, '0')}.png`) })
  }
  await p.close()
  const ff = (...args) => execFileSync(FFMPEG, ['-y', '-loglevel', 'error', ...args])
  ff(
    ...['-framerate', String(fps), '-i', join(dir, '%04d.png')],
    ...['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow'],
    ...['-movflags', '+faststart', `${out}.mp4`],
  )
  ff(
    ...['-i', `${out}.mp4`, '-vf'],
    `fps=${process.env.GIF_FPS || 10},scale=${gifW}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`,
    `${out}.gif`,
  )
  await rm(dir, { recursive: true, force: true })
}

// ——— Слайды ———

const kindOf = (c) =>
  c.directions.includes('web')
    ? 'Design · Website'
    : c.group === 'titan'
      ? 'Product design'
      : 'UX/UI · Design system'

const COVERS = {
  phoneWin:
    // 0. Заголовок сверху, окно сайта и телефон ровно
    ({ t, c, a, ph, scr, tag }) =>
      shell(
        t,
        808,
        632,
        `<div class="m" style="position:absolute;left:48px;top:48px;font-size:12px">${kindOf(c)} · ${c.year}</div>
      <div class="h" style="position:absolute;left:48px;top:74px;font-size:46px">${c.title}</div>
      <div style="position:absolute;left:48px;top:134px;width:430px;font-size:16px;line-height:1.45;color:${t.sub}">${tag}</div>
      ${win(a, 48, 228, 620, 520)}
      ${phoneEl(ph, scr, 512, 150, 266)}`,
      ),
  // Три окна лесенкой
  stack: ({ t, c, a, b, d, tag }) =>
    shell(
      t,
      808,
      632,
      `${win(d, 330, 200, 440, 480)}${win(b, 190, 250, 440, 480)}${win(a, 48, 300, 440, 480)}
      <div class="m" style="position:absolute;left:48px;top:48px;font-size:12px">${kindOf(c)} · ${c.year}</div>
      <div class="h" style="position:absolute;left:48px;top:74px;font-size:44px">${c.title}</div>
      <div style="position:absolute;left:48px;top:132px;width:520px;font-size:16px;line-height:1.45;color:${t.sub}">${tag}</div>`,
    ),
  // Название по центру, одно большое окно
  center: ({ t, c, a, tag }) =>
    shell(
      t,
      808,
      632,
      `<div style="position:absolute;inset:44px 0 auto;text-align:center">
        <div class="m" style="font-size:12px">${kindOf(c)} · ${c.year}</div>
        <div class="h" style="margin-top:14px;font-size:48px">${c.title}</div>
        <div style="margin-top:12px;font-size:16px;color:${t.sub}">${tag}</div>
      </div>
      ${win(a, 84, 222, 640, 470)}`,
    ),

  // Ноутбук и телефон
  laptopPhone: ({ t, c, a, ph, scr, tag }) =>
    shell(
      t,
      808,
      632,
      `${head(t, c, tag)}${laptop(a, 60, 214, 540)}${phoneEl(ph, scr, 548, 170, 226)}`,
    ),
  // ТИТАН-2: ноутбук на фирменной плашке и лупа с куском экрана
  laptopZoom: ({ t, c, a, tag, zoom }) =>
    shell(
      t,
      808,
      632,
      `${head(t, c, tag)}<div class="brand" style="left:300px;top:250px;width:560px;height:420px"></div>
      ${laptop(a, 70, 232, 560)}${zoomCard(a, 470, 380, 300, 196, ...zoom)}`,
    ),
  // ТИТАН-2: монитор на плашке и лупа
  monitorZoom: ({ t, c, a, tag, zoom }) =>
    shell(
      t,
      808,
      632,
      `${head(t, c, tag)}<div class="brand" style="left:-40px;top:300px;width:620px;height:400px"></div>
      ${monitor(a, 150, 206, 560)}${zoomCard(a, 36, 404, 300, 190, ...zoom)}`,
    ),
  // Ультраширокий монитор под таблицу
  ultrawide: ({ t, c, a, wide, tag, zoom }) =>
    shell(
      t,
      808,
      632,
      `${head(t, c, tag)}<div class="brand" style="left:120px;top:330px;width:760px;height:360px"></div>
      ${monitor(wide, 34, 250, 740, wide.w / wide.h)}${zoomCard(a, 330, 360, 430, 250, ...zoom)}`,
    ),
  // Светлая и тёмная тема одним экраном, разрез посередине
  themeSplit: ({ t, c, a, b, tag }) =>
    shell(t, 808, 632, `${head(t, c, tag, true)}${split(a, b, 74, 222, 660)}`),
  // Фон из самого сайта под ноутбуком и телефоном
  bleed: ({ t, c, a, ph, scr, tag }) =>
    shell(
      t,
      808,
      632,
      `${bleedBg(t, a)}${head(t, c, tag)}${laptop(a, 60, 220, 530)}${phoneEl(ph, scr, 540, 176, 226)}`,
    ),
  // Семейство устройств: монитор, ноутбук, телефон
  family: ({ t, c, a, b, ph, scr, tag }) =>
    shell(
      t,
      808,
      632,
      `${head(t, c, tag)}${monitor(b, 250, 180, 500)}${laptop(a, 40, 318, 420)}${phoneEl(ph, scr, 620, 290, 160)}`,
    ),
}

/** Шапка обложки: тип и год, название, подпись */
const head = (t, c, tag, center = false) =>
  `<div style="position:absolute;left:48px;right:48px;top:44px;${center ? 'text-align:center' : ''}">
    <div class="m" style="font-size:12px">${kindOf(c)} · ${c.year}</div>
    <div class="h" style="margin-top:12px;font-size:46px">${c.title}</div>
    <div style="margin-top:10px;font-size:16px;line-height:1.45;color:${t.sub}">${tag}</div>
  </div>`

/** Окно, где слева светлая тема, справа тёмная, и ручка разреза */
const split = (light, dark, x, y, w) => {
  const h = Math.round((w * light.h) / light.w) + 40
  return `<div class="win" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${barHtml()}<div style="position:relative">
    <img src="${u(light)}"><img src="${u(dark)}" style="position:absolute;inset:0;clip-path:inset(0 0 0 50%)">
    <i style="position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 12px rgb(0 0 0 / .3)"></i>
    <b style="position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px;border-radius:50%;background:#fff;box-shadow:0 4px 14px rgb(0 0 0 / .3)"></b>
    <span class="m" style="position:absolute;left:calc(50% - 76px);top:12px;padding:3px 8px;border-radius:4px;background:#fff;color:#333;font-size:10px">Light</span>
    <span class="m" style="position:absolute;left:calc(50% + 12px);top:12px;padding:3px 8px;border-radius:4px;background:#1c2233;color:#dfe6ff;font-size:10px">Dark</span>
  </div></div>`
}

/** Фон из скриншота, притушенный цветом темы */
const bleedBg = (t, a) =>
  `<div style="position:absolute;inset:-20px;background:url(${u(a)}) top center/cover;filter:blur(8px) saturate(1.2)"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb, ${t.bg} 97%, transparent) 0%,color-mix(in srgb, ${t.bg} 90%, transparent) 30%,color-mix(in srgb, ${t.bg} 55%, transparent) 60%,color-mix(in srgb, ${t.bg} 90%, transparent) 100%)"></div>`

const HEROES = {
  pair:
    // 0. Название слева сверху, два окна внахлёст
    ({ t, c, a, b }) =>
      shell(
        t,
        W,
        900,
        `${win(b, 600, 150, 720, 560)}${win(a, 80, 290, 800, 540)}
      <div class="h" style="position:absolute;left:80px;top:72px;font-size:60px">${c.title}</div>
      <div class="m" style="position:absolute;right:80px;top:94px;font-size:14px">${c.year}</div>`,
      ),
  // По центру: название, подпись, широкое окно и телефон
  center: ({ t, c, a, ph, scr, tag }) =>
    shell(
      t,
      W,
      900,
      `<div style="position:absolute;inset:70px 0 auto;text-align:center">
        <div class="m" style="font-size:13px">${kindOf(c)} · ${c.year}</div>
        <div class="h" style="margin-top:18px;font-size:68px">${c.title}</div>
        <div style="margin-top:16px;font-size:22px;color:${t.sub}">${tag}</div>
      </div>
      ${win(a, 150, 300, 1000, 540)}
      ${phoneEl(ph, scr, 1030, 360, 230)}`,
    ),
  // Слева текст колонкой, справа высокое окно
  column: ({ t, c, a, tag, stack }) =>
    shell(
      t,
      W,
      900,
      `<div style="position:absolute;left:80px;top:90px;width:430px">
        <div class="m" style="font-size:13px">${kindOf(c)} · ${c.year}</div>
        <div class="h" style="margin-top:22px;font-size:60px">${c.title}</div>
        <div style="margin-top:22px;font-size:22px;line-height:1.45;color:${t.sub}">${tag}</div>
        <div class="m" style="margin-top:48px;font-size:12px;line-height:2">${stack.join('<br>')}</div>
      </div>
      ${win(a, 600, Math.max(80, Math.round((900 - Math.min(740, (720 * a.h) / a.w + 40)) / 2)), 720, 740)}`,
    ),

  // Слева текст колонкой, справа ноутбук и телефон
  laptop: ({ t, c, a, ph, scr, tag, stack }) =>
    shell(
      t,
      W,
      900,
      `${heroText(t, c, tag, stack)}${laptop(a, 560, 190, 740)}${phoneEl(ph, scr, 1150, 360, 200)}`,
    ),
  // ТИТАН-2: монитор на фирменной плашке и лупа
  monitor: ({ t, c, a, b, tag, zoom }) =>
    shell(
      t,
      W,
      900,
      `<div class="brand" style="left:520px;top:150px;width:960px;height:820px"></div>
      <div style="position:absolute;left:80px;top:80px;width:420px">
        <div class="m" style="font-size:13px">${kindOf(c)} · ${c.year}</div>
        <div class="h" style="margin-top:20px;font-size:60px">${c.title}</div>
        <div style="margin-top:18px;font-size:22px;line-height:1.45;color:${t.sub}">${tag}</div>
      </div>
      ${monitor(a, 440, 110, 860)}${zoomCard(b, 80, 470, 440, 290, ...zoom)}`,
    ),
  // Ультраширокий монитор во всю ширину
  ultra: ({ t, c, a, wide, tag, zoom }) =>
    shell(
      t,
      W,
      900,
      `<div class="brand" style="left:200px;top:420px;width:1300px;height:600px"></div>
      <div style="position:absolute;left:80px;top:72px">
        <div class="m" style="font-size:13px">${kindOf(c)} · ${c.year}</div>
        <div class="h" style="margin-top:18px;font-size:60px">${c.title}</div>
        <div style="margin-top:14px;font-size:22px;color:${t.sub}">${tag}</div>
      </div>
      ${monitor(wide, 80, 250, 1240, wide.w / wide.h)}${zoomCard(a, 700, 470, 620, 360, ...zoom)}`,
    ),
  // Светлая и тёмная тема крупно
  split: ({ t, c, a, b, tag }) =>
    shell(
      t,
      W,
      900,
      `<div style="position:absolute;inset:64px 0 auto;text-align:center">
        <div class="m" style="font-size:13px">${kindOf(c)} · ${c.year}</div>
        <div class="h" style="margin-top:16px;font-size:64px">${c.title}</div>
        <div style="margin-top:12px;font-size:22px;color:${t.sub}">${tag}</div>
      </div>${split(a, b, 250, 290, 900)}`,
    ),
}

const heroText = (t, c, tag, stack) =>
  `<div style="position:absolute;left:80px;top:100px;width:430px">
    <div class="m" style="font-size:13px">${kindOf(c)} · ${c.year}</div>
    <div class="h" style="margin-top:22px;font-size:60px">${c.title}</div>
    <div style="margin-top:22px;font-size:22px;line-height:1.45;color:${t.sub}">${tag}</div>
    <div class="m" style="margin-top:48px;font-size:12px;line-height:2">${stack.join('<br>')}</div>
  </div>`

/** Текстовый блок картинкой: в редакторе Behance текст не оформить. Высота по содержимому */
const textShot = async (t, variant, label, title, body, out, foot = '') => {
  const grid =
    variant === 1
      ? 'display:block;max-width:900px;margin:0 auto;padding:130px 0'
      : 'display:grid;grid-template-columns:5fr 7fr;gap:64px;padding:120px 80px'
  const p = await open(
    shell(
      t,
      W,
      2400,
      `<div class="t" style="${grid}">
        <div class="m" style="font-size:14px;padding-top:14px;${variant === 1 ? 'margin-bottom:28px' : ''}">${label}</div>
        <div>
          <div class="h" style="font-size:${variant === 1 ? 56 : 48}px;line-height:1.1">${title}</div>
          ${body.map((x) => `<p style="margin-top:28px;font-size:22px;line-height:1.6;color:${t.sub}">${x}</p>`).join('')}
          ${foot ? `<div class="m" style="margin-top:48px;font-size:13px;line-height:1.8">${foot}</div>` : ''}
        </div></div>`,
    ),
    W,
    2400,
  )
  const h = await p.$eval('.t', (e) => Math.ceil(e.getBoundingClientRect().height))
  await p.screenshot({
    path: out,
    type: 'jpeg',
    quality: 92,
    clip: { x: 0, y: 0, width: W, height: h },
  })
  await p.close()
}

/** Картинка композиции (телефоны, файл Figma) карточкой на фоне темы */
const framed = async (t, s, out, crop) => {
  // crop — часть картинки в её пикселях; без него картинка целиком
  const cw = crop?.w ?? s.w
  const ch = crop?.h ?? s.h
  // Высокая картинка (один телефон) не шире, чем влезает в 1100 по высоте
  const iw = Math.min(W - 160, Math.round((1100 * cw) / ch))
  const k = iw / cw
  const ih = Math.round(ch * k)
  const h = ih + 160
  const img = crop
    ? `<img src="${u(s)}" style="position:absolute;width:${(crop.W * k).toFixed(1)}px;max-width:none;left:${(-crop.x * k).toFixed(1)}px;top:${(-crop.y * k).toFixed(1)}px">`
    : `<img src="${u(s)}">`
  await shot(
    shell(
      t,
      W,
      h,
      `<div class="card" style="position:absolute;left:${(W - iw) / 2}px;top:80px;width:${iw}px;height:${ih}px;${crop ? 'background:#1e1e1e' : ''}">${img}</div>`,
    ),
    W,
    h,
    out,
  )
}

/** Телефоны, снятые отдельными экранами, в рамках рядом */
const phonesShot = async (t, list, out) => {
  const pw = 300
  const gap = 60
  const x0 = (W - list.length * pw - (list.length - 1) * gap) / 2
  const els = list
    .map((s, i) =>
      phoneEl(
        s,
        { x: 0, y: 0, w: s.w, h: s.h, W: s.w },
        x0 + i * (pw + gap),
        90 + (i % 2) * 40,
        pw,
      ),
    )
    .join('')
  await shot(shell(t, W, 900, els), W, 900, out)
}

const thanks = async (theme, variant, out) => {
  // У ТИТАН-2 финальный слайд в их синем
  const t = theme.brand
    ? {
        ...theme,
        bg: theme.brand,
        fg: '#fff',
        sub: 'rgb(255 255 255 / .66)',
        ring: 'rgb(255 255 255 / .22)',
      }
    : theme
  const rows = [
    ['Telegram', site.contacts.telegramHandle],
    ['GitHub', site.contacts.github.replace('https://', '')],
    ['Portfolio', 'lexandro-design.github.io/portfolio'],
    ['Email', site.contacts.email],
  ]
  await shot(
    shell(
      t,
      W,
      720,
      `<div style="position:absolute;left:80px;right:80px;top:110px;${variant === 1 ? 'text-align:center' : ''}">
        <div class="m" style="font-size:13px"><b style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#35c46a;margin-right:10px"></b>Open to new projects</div>
        <div class="h" style="margin-top:26px;font-size:${t.head === 'Unbounded' ? 76 : 92}px">Thanks for watching.</div>
        <div style="margin-top:22px;font-size:24px;color:${t.sub}">Design, websites and automation. Let's build yours.</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:90px;display:flex;justify-content:space-between;gap:24px;border-top:1px solid ${t.ring};padding-top:34px">
        ${rows.map(([k, v]) => `<div><div class="m" style="font-size:12px">${k}</div><div style="margin-top:10px;font-size:19px">${v}</div></div>`).join('')}
      </div>`,
    ),
    W,
    720,
    out,
  )
}

// ——— Видео ———

/** Прокрутка длинной страницы в окне: вниз, пауза, обратно. Рядом может стоять телефон */
const scrollVideo = (t, a, out, ph, scr) => {
  const withPhone = Boolean(ph && scr)
  const ww = withPhone ? 900 : 1100
  const x = withPhone ? 110 : 150
  const viewH = 900 - 70 - 60 - 40
  const dist = Math.max(0, Math.round((ww * a.h) / a.w) - viewH)
  return video(
    shell(
      t,
      W,
      900,
      `<div class="win" style="left:${x}px;top:70px;width:${ww}px;height:${viewH + 40}px">${barHtml()}<div style="height:${viewH}px;overflow:hidden"><img class="sc" src="${u(a)}"></div></div>
      ${withPhone ? phoneEl(ph, scr, 1040, 190, 250) : ''}`,
      `@keyframes sc{0%,8%{transform:translateY(0)}46%,56%{transform:translateY(-${dist}px)}94%,100%{transform:translateY(0)}}
       .sc{animation:sc 12s cubic-bezier(.65,0,.35,1) infinite}`,
      true,
    ),
    W,
    900,
    12,
    out,
  )
}

/** Экраны по очереди в одном окне: смена с лёгким подъёмом */
const fadeVideo = (t, list, out) => {
  const per = 2.4
  const total = per * list.length
  const pct = (s) => ((s / total) * 100).toFixed(2)
  return video(
    shell(
      t,
      W,
      900,
      list.map((s, i) => win(s, 150, 80, 1100, 740, `data-i="${i}"`)).join(''),
      list
        .map((_, i) => {
          const st = i * per
          const last = i === list.length - 1
          const enter = i
            ? `${pct(st - 0.01)}%{opacity:0;transform:translateY(24px)}${pct(st + 0.5)}%{opacity:1;transform:none}`
            : ''
          const leave = last ? '' : `${pct(st + per + 0.5)}%{opacity:0}`
          return `@keyframes f${i}{0%{opacity:${i ? 0 : 1};transform:translateY(${i ? 24 : 0}px)}${enter}${pct(st + per)}%{opacity:1;transform:none}${leave}100%{opacity:${last ? 1 : 0}}}
          [data-i="${i}"]{animation:f${i} ${total}s cubic-bezier(.25,1,.5,1) infinite both}`
        })
        .join('\n'),
      true,
    ),
    W,
    900,
    total,
    out,
  )
}

/** Экраны слайдами влево, как карусель: для приложений с широкими экранами */
const slideVideo = (t, list, out) => {
  const per = 2.6
  const n = list.length
  const ww = 1000
  const step = ww + 60
  const loop = [...list, list[0]]
  const keys = list
    .map((_, i) => {
      const at = ((i * per) / (n * per)) * 100
      const hold = ((i * per + per - 0.8) / (n * per)) * 100
      return `${at.toFixed(2)}%{transform:translateX(${-i * step}px)}${hold.toFixed(2)}%{transform:translateX(${-i * step}px)}`
    })
    .join('')
  return video(
    shell(
      t,
      W,
      900,
      `<div class="rail" style="position:absolute;left:200px;top:110px;height:680px">${loop
        .map((s, i) => win(s, i * step, 0, ww, 680))
        .join('')}</div>`,
      `@keyframes rail{${keys}100%{transform:translateX(${-n * step}px)}}
       .rail{animation:rail ${n * per}s cubic-bezier(.7,0,.3,1) infinite}`,
      true,
    ),
    W,
    900,
    n * per,
    out,
  )
}

/** Наезд на экран приложения: окно во всю ширину, внутри экран крупно плывёт по деталям */
const detailVideo = (t, s, out) => {
  const ww = 1240
  const vh = 780
  const zoom = 1.7
  const iw = Math.round(ww * zoom)
  const ih = Math.round((iw * s.h) / s.w)
  const dx = iw - ww
  const dy = Math.max(0, Math.min(ih - vh, 700))
  // Начало и конец: экран целиком по ширине окна
  const k = (1 / zoom).toFixed(4)
  return video(
    shell(
      t,
      W,
      900,
      `<div class="win" style="left:80px;top:40px;width:${ww}px;height:${vh + 40}px">${barHtml()}<div style="position:relative;height:${vh}px;overflow:hidden"><img class="zm" src="${u(s)}" style="position:absolute;left:0;top:0;width:${iw}px"></div></div>`,
      `@keyframes zm{0%,6%{transform:translate(0,0) scale(${k})}24%,40%{transform:translate(0,0) scale(1)}64%,76%{transform:translate(-${dx}px,-${dy}px) scale(1)}94%,100%{transform:translate(0,0) scale(${k})}}
       .zm{transform-origin:0 0;animation:zm 12s cubic-bezier(.65,0,.35,1) infinite}`,
      true,
    ),
    W,
    900,
    12,
    out,
  )
}

/** Три колонки экранов едут навстречу друг другу, бесшовно по кругу */
const marqueeVideo = (t, list, out) => {
  const colW = 380
  const gap = 28
  const seconds = 10
  const hOf = (s) => Math.round(colW * Math.min(s.h / s.w, 1.6))
  const cols = [0, 1, 2].map((k) => list.filter((_, i) => i % 3 === k))
  const html = cols
    .map((col, k) => {
      const seq = col.length ? col : list
      const cycle = seq.reduce((sum, s) => sum + hOf(s) + gap, 0)
      const reps = Math.ceil(1100 / cycle)
      const one = Array.from({ length: reps }, () => seq).flat()
      const H = cycle * reps
      const items = [...one, ...one]
        .map(
          (s) =>
            `<div class="card" style="height:${hOf(s)}px;margin-bottom:${gap}px"><img src="${u(s)}"></div>`,
        )
        .join('')
      const dir =
        k === 1
          ? `from{transform:translateY(-${H}px)}to{transform:translateY(0)}`
          : `from{transform:translateY(0)}to{transform:translateY(-${H}px)}`
      const left = (W - 3 * colW - 2 * gap) / 2 + k * (colW + gap)
      return `<style>@keyframes c${k}{${dir}}</style><div style="position:absolute;top:0;left:${left}px;width:${colW}px;animation:c${k} ${seconds}s linear infinite">${items}</div>`
    })
    .join('')
  // Колонки меняют каждый пиксель кадра, GIF во всю ширину весил 50 МБ
  return video(
    shell(
      t,
      W,
      900,
      `<div style="position:absolute;inset:0;-webkit-mask:linear-gradient(transparent,#000 90px,#000 810px,transparent)">${html}</div>`,
      '',
      true,
    ),
    W,
    900,
    seconds,
    out,
    1000,
  )
}

// ——— Сборка ———

const rendered = cases.filter((c) => desktop(c).length)
const own = rendered.filter((c) => c.group !== 'titan')
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : rendered.map((c) => c.slug)

// Профиль Behance английский: название из перевода, у кого его нет, латиницей тут.
// Убирай.рф Lexandro хочет видеть по-русски
const EN_TITLE = { tetrasis: 'Tetrasis', 'ubiray-rf': 'Убирай.рф' }

// Адреса живых сайтов для строки браузера. Внутренним системам ТИТАН-2 и Parfumeria
// (демо пока не публичное) адрес не ставим
const URLS = {
  reckon: 'reckon.su',
  svarnoy52: 'svarnoy52.ru',
  'svarprom-nn': 'svarprom-nn.ru',
  'ubiray-rf': 'убирай.рф',
  'prof-study': 'titan2.ru/studprofi',
}

// Обложка и первый экран по проекту: разные устройства и раскладки, чтобы сетка
// профиля не была одним шаблоном. Кого нет в списке — по кругу
const RECIPES = {
  parfumeria: ['phoneWin', 'pair'],
  'meeting-rooms': ['laptopZoom', 'monitor'],
  otrx: ['monitorZoom', 'monitor'],
  'pix-bi': ['monitorZoom', 'laptop'],
  'vacation-plan': ['ultrawide', 'ultra'],
  'ai-translator': ['themeSplit', 'split'],
  'meg-site': ['family', 'pair'],
  'prof-study': ['laptopPhone', 'center'],
  osq: ['bleed', 'center'],
  lotus: ['bleed', 'center'],
  tetrasis: ['laptopPhone', 'laptop'],
  'ubiray-rf': ['family', 'column'],
  svarnoy52: ['phoneWin', 'pair'],
  'svarprom-nn': ['center', 'column'],
  reckon: ['phoneWin', 'pair'],
  'portfolio-site': ['phoneWin', 'pair'],
}
// Где у экрана лупа: доли ширины и высоты от левого верхнего угла
const ZOOM = {
  'meeting-rooms': [0.2, 0.3],
  otrx: [0.03, 0.14],
  'pix-bi': [0.2, 0.44],
  'vacation-plan': [0.12, 0.36],
}
for (const slug of slugs) {
  const raw = cases.find((x) => x.slug === slug)
  if (!raw) throw new Error(`нет кейса ${slug}`)
  const c = { ...raw, title: clean(EN_TITLE[slug] ?? i18n[slug]?.title ?? raw.title) }
  const list = desktop(c)
  if (!list.length) {
    console.log('пропуск, нет скринов:', slug)
    continue
  }
  const idx = rendered.indexOf(raw)
  const v = idx % 3
  const { accent, screen: scr } = await probe(c)
  const t =
    c.group === 'titan'
      ? THEMES.titan
      : [THEMES.sand, THEMES.ink, THEMES.tint(accent)][own.indexOf(raw) % 3]
  const out = join(ROOT, '_shots/behance', slug)
  // NO_VIDEO пересобирает только картинки, видео остаются на месте
  if (!process.env.NO_VIDEO && !process.env.COVER_ONLY)
    await rm(out, { recursive: true, force: true })
  await mkdir(out, { recursive: true })

  const en = i18n[slug]
  const [a, b = a, d = b] = list
  const ph = c.shots.find(isPhone)
  const fig = c.shots.find(isFigma)
  const hasPhone = Boolean(ph && scr && scr.w >= 80)
  URL_TEXT = URLS[slug] ?? ''
  const wide = list.find((x) => /монитор/i.test(x.caption)) ?? a
  const zoom = ZOOM[slug] ?? [0.25, 0.14]
  const tag = clean(cap(en?.tagline ?? c.tagline))
  const stack = c.stack.map((x) => STACK_EN[x] ?? x)
  const ctx = { t, c, a, b, d, ph, scr, tag, stack, wide, zoom }
  let n = 0
  const file = (name) => join(out, `${String(++n).padStart(2, '0')}-${name}`)

  // Обложке и первому экрану с телефоном он нужен, иначе берём вариант без него
  const [cv, hv0] = RECIPES[slug] ?? [
    ['phoneWin', 'stack', 'center'][v === 0 && !hasPhone ? 1 : v],
    ['pair', 'center', 'column'][v],
  ]
  await shot(COVERS[cv](ctx), 808, 632, file('cover.jpg'))
  if (process.env.COVER_ONLY) continue
  // Широкий экран приложения в колонке справа выходит мелким, ему нужен вариант по центру
  // Страница сайта выше ширины, экран приложения шире высоты
  const tall = a.h / a.w > 1
  // Колонке справа нужен высокий экран, широкий выходит мелким — тогда окно по центру
  const hv = hv0 === 'column' && !tall ? 'center' : hv0
  await shot(HEROES[hv](ctx), W, 900, file('hero.jpg'))

  const secs = (en?.sections ?? c.sections).map((s) => ({
    title: clean(s.title),
    body: s.body.map(clean),
  }))
  const lastSec = Math.min(secs.length, 3) - 1
  const tv = idx % 2
  const block = (i, title = cap(secs[i].title)) =>
    textShot(
      t,
      tv,
      `${String(i + 1).padStart(2, '0')} / ${c.title}`,
      title,
      i === lastSec
        ? secs.slice(i).flatMap((x, j) => (j ? [cap(x.title), ...x.body] : x.body))
        : secs[i].body,
      file('text.jpg'),
      i === lastSec ? `Stack: ${stack.join(', ')}` : '',
    )
  if (secs[0]) await block(0, clean(en?.lead ?? c.lead))

  // Первое видео: длинная страница листается, широкие экраны едут каруселью
  const vid = !process.env.NO_VIDEO
  if (tall) {
    const f = file('scroll')
    if (vid) await scrollVideo(t, a, f, v === 2 ? ph : null, scr)
  } else if (list.length > 1) {
    const f = file('slides')
    if (vid) await slideVideo(t, list.slice(0, 5), f)
  }
  if (secs[1]) await block(1)

  // Второе видео. Экраны приложений: наезд на детали, в колонках их таблицы не читаются.
  // Страницы сайтов: колонки экранов или смена экранов в окне
  const pool = [...list, ...c.shots.filter(isTablet)]
  if (!tall) {
    const f = file('detail')
    if (vid) await detailVideo(t, list[1] ?? a, f)
  } else if (pool.length >= 4 && idx % 2 === 0) {
    const f = file('screens')
    if (vid) await marqueeVideo(t, pool, f)
  } else if (list.length > 1) {
    const f = file('screens')
    if (vid) await fadeVideo(t, list.slice(0, 5), f)
  }
  if (secs[2]) await block(2)

  const phones = c.shots.filter((x) => isPhone(x) && x.screen)
  if (phones.length) await phonesShot(t, phones, file('phone.jpg'))
  else if (ph) await framed(t, ph, file('phone.jpg'))
  if (fig) await framed(t, fig, file('figma.jpg'), await contentBox(fig))
  await thanks(t, tv, file('thanks.jpg'))
  console.log('готово:', slug)
}
await browser.close()
server.close()
