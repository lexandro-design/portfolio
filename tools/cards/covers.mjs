// Обложки кейсов: скриншоты в рамках браузера и телефона на спокойном фоне.
// Скрин целиком помещается в окно, поэтому на обложке нет случайно обрезанных
// кусков интерфейса. Две версии на кейс:
//   public/cases/<slug>/thumb.jpg  — строка на главной, 608×430
//   public/cases/<slug>/cover.jpg  — шапка страницы кейса, 1312×640
// node tools/cards/covers.mjs
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const TYPES = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' }

let html = ''
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (path === '/card') return res.writeHead(200, { 'content-type': TYPES['.html'] }).end(html)
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    res.end(await readFile(join(ROOT, path)))
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(8797, r))

const BG = '#e6e3db'

const css = `
@font-face{font-family:Mono;src:url(/node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2) format('woff2')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{overflow:hidden}
body{background:${BG};background-image:radial-gradient(120% 90% at 30% 0%,#efede7 0%,${BG} 60%,#dcd8cf 100%)}
.stage{position:relative;width:100%;height:100%;overflow:hidden}
.win{position:absolute;border-radius:10px;overflow:hidden;background:#fff;
  box-shadow:0 0 0 1px rgb(20 20 15 / .08),0 24px 60px -12px rgb(20 20 15 / .28),0 8px 18px -8px rgb(20 20 15 / .18)}
.bar{display:flex;align-items:center;gap:6px;height:28px;padding:0 12px;background:#f4f3ef;border-bottom:1px solid rgb(20 20 15 / .07)}
.bar i{width:9px;height:9px;border-radius:50%;background:#d6d3cb}
.bar b{margin:0 auto;height:16px;min-width:34%;padding:0 12px;border-radius:5px;background:#e9e7e1;
  font:500 9px/16px Mono,monospace;color:#8b897f;text-align:center;letter-spacing:.04em}
.win img{display:block;width:100%}
.phone{position:absolute;border-radius:30px;padding:6px;background:#111;
  box-shadow:0 0 0 1px rgb(0 0 0 / .4),0 30px 60px -14px rgb(20 20 15 / .45)}
.phone img{display:block;width:100%;border-radius:24px}
`

const win = (src, style, url = '') =>
  `<div class="win" style="${style}"><div class="bar"><i></i><i></i><i></i><b>${url}</b></div><img src="${src}"></div>`
const phone = (src, style) => `<div class="phone" style="${style}"><img src="${src}"></div>`

const pf = (n) => `/public/cases/parfumeria/0${n}.jpg`
const pm = (n) => `/tools/cards/src/parfumeria-m${n}.jpg`
const mr = (n) => `/public/cases/meeting-rooms/0${n}.jpg`

// Раскладки в CSS-пикселях макета обложки; окна уходят за нижний край
const LAYOUTS = {
  parfumeria: {
    thumb: [
      win(pf(1), 'left:36px;top:44px;width:470px', 'parfumeria.by'),
      phone(pm(2), 'left:438px;top:92px;width:136px'),
    ],
    cover: [
      win(pf(1), 'left:96px;top:72px;width:760px', 'parfumeria.by'),
      phone(pm(2), 'left:820px;top:120px;width:190px'),
      phone(pm(3), 'left:1040px;top:64px;width:190px'),
    ],
  },
  'meeting-rooms': {
    thumb: [
      win(mr(5), 'left:150px;top:30px;width:420px'),
      win(mr(1), 'left:36px;top:78px;width:470px'),
    ],
    cover: [
      win(mr(6), 'left:560px;top:52px;width:660px'),
      win(mr(1), 'left:96px;top:104px;width:720px'),
    ],
  },
  'pix-bi': {
    thumb: [win('/public/cases/pix-bi/01.jpg', 'left:52px;top:52px;width:504px')],
    cover: [win('/public/cases/pix-bi/01.jpg', 'left:256px;top:64px;width:800px')],
  },
}

const browser = await chromium.launch()
const shoot = async (slug, kind, w, h) => {
  html = `<!doctype html><meta charset="utf-8"><style>${css}html,body{width:${w}px;height:${h}px}</style><div class="stage">${LAYOUTS[slug][kind].join('')}</div>`
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  await p.goto('http://localhost:8797/card', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({
    path: join(ROOT, `public/cases/${slug}/${kind}.jpg`),
    type: 'jpeg',
    quality: 86,
  })
  await p.close()
}

for (const slug of Object.keys(LAYOUTS)) {
  await shoot(slug, 'thumb', 608, 430)
  await shoot(slug, 'cover', 1312, 640)
}
await browser.close()
server.close()
console.log('ok')
