// Плитки кейсов для главной: один крупный кадр на цветном поле, окно уходит за нижний край.
// public/cases/<slug>/tile.jpg, у кадров со сцены ещё tile-en.jpg, tile-zh.jpg, tile-ja.jpg.
// Сцены снимаются с собранного сайта: node tools/cards/tiles.mjs <адрес сборки> [slug…]
// Плитка подключается полем card в cases.json, у кадров со сцены там же perLocale
import { chromium } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const base = process.argv[2] ?? 'http://localhost:8794/portfolio/'
const only = process.argv.slice(3)
const W = 1216
const H = 860
const SIDE = 88
const TOP = 148
const LOCALES = ['ru', 'en', 'zh', 'ja']
const LIVE = '#2f9e6e'

const accents = JSON.parse(readFileSync(`${ROOT}/src/content/data/accents.json`, 'utf8'))
const CHAT = '[class*="Chat-module"][class*="__chat"]'
const FLOW = '[class*="FlowCard-module"][class*="__root"]'

/** Сайты: кадр из галереи кейса, x, y и w в пикселях файла */
const SITES = {
  saldo: { shot: '05.jpg', x: 0, y: 0, w: 900 },
  'meeting-rooms': { shot: '01.jpg', x: 300, y: 90, w: 900 },
  'meg-site': { shot: '01.jpg', x: 0, y: 0, w: 1100 },
  osq: { shot: '01.jpg', x: 0, y: 0, w: 1100 },
  'ai-translator': { shot: '02.jpg', x: 350, y: 30, w: 1100 },
  svarnoy52: { shot: 'r1.jpg', x: 0, y: 0, w: 1100 },
  'pix-bi': { shot: '01.jpg', x: 330, y: 60, w: 900 },
  /* Без лица героини страницы */
  'ubiray-rf': { shot: '06.jpg', x: 30, y: 1262, w: 1000 },
  /* Заглавный экран игры */
  'garden-td': { shot: 'title.webp', x: 0, y: 120, w: 780 },
  'vacation-plan': { shot: '01.jpg', x: 20, y: 0, w: 850 },
  tetrasis: { shot: '03.jpg', x: 40, y: 0, w: 900 },
  reckon: { shot: '02.jpg', x: 150, y: 30, w: 1100 },
  'prof-study': { shot: '01.jpg', x: 0, y: 0, w: 1100 },
  'svarprom-nn': { shot: 'r1.jpg', x: 0, y: 0, w: 1100 },
  /* Демо-данные, кадр без номеров документов: только чек-лист проверок */
  otrx: { shot: '03.jpg', x: 30, y: 545, w: 700 },
}

/** Сцены: шаг и что снимать. chat ставит шапку сверху и низ ленты под ней */
const SCENES = {
  'rag-mentor': { step: 1, chat: true },
  'fitness-bot': { step: 2, chat: true },
  'food-assistants': { step: 2, chat: true },
  'packaging-bots': { step: 2, chat: true },
  'team-reports': { step: 1, chat: true },
  'uni-bot': { step: 3, chat: true },
  'dice-bots': { step: 4, chat: true },
  'tg-assistant': { step: 1, chat: true },
  'lead-agent': { step: 3, chat: true },
  'channel-pipeline': { step: 3, chat: true },
  'mail-to-crm': { step: 2, sel: '[class*="__board"]' },
  'media-to-rag': { step: 3, sel: '[class*="__cards"]' },
  'ai-office': { sel: FLOW },
  haiku: { sel: FLOW },
  'brain-search': { sel: FLOW },
  'ai-console': { sel: FLOW },
  'call-recorder': { sel: FLOW },
}

/** Фото бота: те же кадры, что на стене в сцене */
const WALL = { mimimibot: ['gold', 'grey', 'dark'] }

/** Составной кадр: экран сайта в окне, поверх него 3D из кейса, вырезанное из рендера (tools/cards/src) */
const STAGE = {
  prosoft: {
    shot: 'stages.webp',
    x: 50,
    y: 72,
    w: 1500,
    glow: '#f77106',
    cuts: [
      { src: 'prosoft-dev.webp', left: 782, top: 22, w: 390 },
      { src: 'prosoft-erp.webp', left: 664, top: 490, w: 530 },
    ],
  },
}

const paper = (slug) => {
  const c = accents[slug] ?? LIVE
  return `background:linear-gradient(150deg,color-mix(in oklab,${c} 78%,#0b0c10) 0%,color-mix(in oklab,${c} 30%,#0b0c10) 100%)`
}

const page = (slug, body) => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
.tile{position:relative;width:100%;height:100%;overflow:hidden;${paper(slug)}}
.win{position:absolute;left:${SIDE}px;right:${SIDE}px;top:${TOP}px;bottom:-40px;overflow:hidden;border-radius:20px 20px 0 0;
  box-shadow:0 0 0 1px rgb(255 255 255/.14),0 50px 110px -10px rgb(0 0 0/.6),0 12px 30px rgb(0 0 0/.3)}
.win img{display:block;width:100%}
.top,.low{background-repeat:no-repeat;background-size:100% auto}
.top{background-position:top}.low{position:absolute;inset:var(--hdr) 0 40px;background-position:bottom}
.fit{bottom:64px;border-radius:20px;display:grid;place-items:center}.fit img{width:100%;height:100%;object-fit:contain}
.wall{position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#0b0c10}
.wall img{width:100%;height:100%;object-fit:cover;object-position:50% 22%;display:block}
</style><div class="tile">${body}</div>`

const data = (buf, type = 'png') => `data:image/${type};base64,${buf.toString('base64')}`

const browser = await chromium.launch()
const composer = await browser.newContext({ viewport: { width: W, height: H } })

async function render(slug, html, name) {
  const p = await composer.newPage()
  await p.setContent(html, { waitUntil: 'load' })
  await p.waitForTimeout(150)
  const dir = `${ROOT}/public/cases/${slug}`
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/${name}.jpg`, await p.screenshot({ type: 'jpeg', quality: 90 }))
  await p.close()
}

async function site(slug, s) {
  const buf = readFileSync(`${ROOT}/public/cases/${slug}/${s.shot}`)
  const inner = W - SIDE * 2
  const k = inner / s.w
  const img = `<img src="${data(buf, s.shot.endsWith('webp') ? 'webp' : 'jpeg')}" style="position:absolute;width:auto;max-width:none;transform-origin:0 0;transform:translate(${-s.x * k}px,${-s.y * k}px) scale(${k})">`
  await render(slug, page(slug, `<div class="win" style="background:#fff">${img}</div>`), 'tile')
}

async function stage(slug, s) {
  const inner = W - SIDE * 2
  const k = inner / s.w
  const buf = readFileSync(`${ROOT}/public/cases/${slug}/${s.shot}`)
  const cut = (c, z) => `<img src="${data(readFileSync(`${ROOT}/tools/cards/src/${c.src}`), 'webp')}" style="position:absolute;z-index:${z};left:${c.left}px;top:${c.top}px;width:${c.w}px;filter:drop-shadow(0 34px 44px rgb(2 10 30/.55))">`
  const glow = `<i style="position:absolute;inset:0;z-index:2;mix-blend-mode:screen;background:radial-gradient(44% 42% at 76% 90%,color-mix(in srgb,${s.glow} 46%,transparent),transparent 74%)"></i>`
  const win = `<div class="win" style="z-index:2;background:#062253"><img src="${data(buf, 'webp')}" style="position:absolute;width:auto;max-width:none;transform-origin:0 0;transform:translate(${-s.x * k}px,${-s.y * k}px) scale(${k})"></div>`
  await render(slug, page(slug, `${win}${glow}${s.cuts.map((c) => cut(c, 3)).join('')}`), 'tile')
}

async function wall(slug, names) {
  const imgs = names.map((n) => `<img src="${data(readFileSync(`${ROOT}/public/cases/${slug}/wall/${n}-960.webp`), 'webp')}">`)
  await render(slug, page(slug, `<div class="wall">${imgs.join('')}</div>`), 'tile')
}

async function scene(slug, s, locale, ctx) {
  const p = await ctx.newPage()
  await p.goto(`${base}${locale === 'ru' ? '' : `${locale}/`}cases/${slug}/`, { waitUntil: 'load' })
  await p.waitForTimeout(700)
  if (s.step !== undefined) {
    await p.locator('[data-scene] ol button[aria-label]').nth(s.step).click({ timeout: 4000 }).catch(() => {})
    await p.waitForTimeout(3600)
  }
  const l = p.locator(s.chat ? CHAT : s.sel).first()
  await l.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await p.waitForTimeout(500)
  const buf = await l.screenshot()
  await p.close()
  const url = data(buf)
  const hdr = 150
  const body = s.chat
    ? `<div class="win" style="--hdr:${hdr}px;background:#101114"><div class="top" style="height:${hdr}px;background-image:url(${url})"></div><div class="low" style="background-image:url(${url})"></div></div>`
    : `<div class="win${s.sel === FLOW ? ' fit' : ''}" style="background:#101114"><img src="${url}"></div>`
  await render(slug, page(slug, body), locale === 'ru' ? 'tile' : `tile-${locale}`)
}

const want = (s) => !only.length || only.includes(s)
for (const [slug, s] of Object.entries(SITES)) if (want(slug)) await site(slug, s)
for (const [slug, n] of Object.entries(WALL)) if (want(slug)) await wall(slug, n)
for (const [slug, s] of Object.entries(STAGE)) if (want(slug)) await stage(slug, s)

const ctx = await browser.newContext({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 3 })
await ctx.addInitScript(() => {
  try {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('sky-ask', 'no')
  } catch {}
})
const jobs = []
for (const [slug, s] of Object.entries(SCENES)) if (want(slug)) for (const l of LOCALES) jobs.push([slug, s, l])
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (;;) {
      const j = jobs.shift()
      if (!j) return
      await scene(j[0], j[1], j[2], ctx).catch((e) => console.log('сбой', j[0], j[2], String(e).slice(0, 300)))
    }
  }),
)
await browser.close()
console.log('готово')
