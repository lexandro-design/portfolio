// Обложки подборки на главной: сцена из настоящих кадров кейса с глубиной и светом.
// public/cases/<slug>/tile.jpg. Запуск: node tools/cards/stage.mjs [slug…]
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const only = process.argv.slice(2)
const W = 1216
const H = 860

const c = (p) => pathToFileURL(`${ROOT}/public/cases/${p}`).href
const s = (p) => pathToFileURL(`${ROOT}/tools/cards/src/${p}`).href

/** Экран в окне: кадр кейса шириной iw, x0 и y0 сдвигают его внутри окна */
const screen = (src, { x, y, w, h, y0 = 0, x0 = 0, iw = w, r = 14, rot = '', z = 1, shade = '', blend = 'normal', bg = '#fff' }) =>
  `<div class="scr" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;z-index:${z};transform:${rot};background:${bg}">
    <img src="${src}" style="width:${iw}px;max-width:none;margin:${-y0}px 0 0 ${-x0}px">${shade ? `<i style="position:absolute;inset:0;background:${shade};mix-blend-mode:${blend}"></i>` : ''}</div>`

const pic = (src, st) => `<img class="pic" src="${src}" style="${st}">`
const light = (st) => `<i class="light" style="${st}"></i>`

const SCENES = {
  /* Стена страниц сайта в изометрии: главная крупно и в свете, остальные в цвете бренда */
  prosoft: () => {
    const side = (src, x, y, h, y0 = 0) => screen(c(`prosoft/${src}`), { x, y, w: 470, h, y0, r: 12, z: 1, shade: '#0e4cb9', blend: 'multiply' })
    return `<div style="position:absolute;inset:0;background:radial-gradient(90% 80% at 62% 40%,#1a63dc 0%,#0e4cb9 36%,#062253 80%,#04173a 100%)"></div>
    <div class="plane" style="left:-190px;top:-430px;width:1560px;height:1800px;transform:perspective(2600px) rotateX(50deg) rotateZ(-34deg)">
      ${side('p-erp.webp', 0, 150, 620)}
      ${side('p-care.webp', 0, 804, 560)}
      ${side('p-diag.webp', 0, 1398, 620)}
      ${side('p-dev.webp', 1090, 40, 620)}
      ${side('p-upp.webp', 1090, 694, 620)}
      ${side('p-diag.webp', 1090, 1348, 620, 700)}
      ${side('p-upp.webp', 504, -420, 400, 900)}
      ${side('p-dev.webp', 504, 1420, 620, 900)}
      <i class="light" style="left:430px;top:60px;width:800px;height:1400px;border-radius:40px;background:#f77106;filter:blur(46px);opacity:.95"></i>
      ${screen(c('prosoft/p-home.webp'), { x: 520, y: 20, w: 640, h: 1360, r: 16, z: 2 })}
    </div>
    ${light('inset:0;z-index:3;background:radial-gradient(52% 36% at 100% 0%,rgb(4 23 58/.96) 30%,transparent 100%)')}`
  },

  /* Герои игры выходят из заставки на фоне огорода */
  'garden-td': () => {
    const hero = (n, x, y, w, z = 3, rot = 0) =>
      pic(s(`gt-${n}.webp`), `left:${x}px;top:${y}px;width:${w}px;z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 20px 22px rgb(20 10 50/.55))`)
    return `<img src="${s('gt-bg.webp')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 60%">
    ${light('inset:0;z-index:1;background:linear-gradient(180deg,rgb(24 16 70/.62) 0%,rgb(24 16 70/.1) 40%,rgb(18 10 50/.72) 100%)')}
    ${light('inset:0;z-index:1;background:radial-gradient(46% 40% at 50% 34%,rgb(255 214 120/.5),transparent 72%)')}
    ${screen(c('garden-td/s05.webp'), { x: 92, y: 300, w: 276, h: 600, r: 30, z: 2, rot: 'rotate(-7deg)' })}
    ${screen(c('garden-td/s13.webp'), { x: 848, y: 300, w: 276, h: 600, r: 30, z: 2, rot: 'rotate(7deg)' })}
    ${pic(s('gt-logo.webp'), 'left:236px;top:70px;width:744px;z-index:5;filter:drop-shadow(0 18px 26px rgb(20 10 50/.6))')}
    ${hero('tykva', 300, 560, 250, 3, -3)}
    ${hero('kabachok', 690, 500, 270, 4, 4)}
    ${hero('mukhomor', 468, 470, 300, 4)}
    ${hero('morkov', 200, 640, 210, 5, -6)}
    ${hero('chesnok', 860, 650, 210, 5, 5)}
    ${hero('luk', 560, 660, 230, 6)}`
  },

  /* Экран реестра, поверх него расписание и окно брони: три уровня одного сервиса */
  'meeting-rooms': () => `<div style="position:absolute;inset:0;background:radial-gradient(80% 90% at 20% 0%,#4d9ae6 0%,#2466b8 42%,#0d2c5e 100%)"></div>
    ${light('inset:0;background:radial-gradient(40% 34% at 76% 22%,rgb(255 255 255/.34),transparent 72%)')}
    <div class="plane" style="inset:0;transform:perspective(2000px) rotateY(-16deg) rotateX(9deg) rotateZ(2deg)">
      ${screen(c('meeting-rooms/05.jpg'), { x: 500, y: 40, w: 800, h: 569, z: 1, shade: 'rgb(8 30 70/.22)' })}
      ${screen(c('meeting-rooms/01.jpg'), { x: 70, y: 130, w: 960, h: 683, z: 2 })}
    </div>
    ${screen(c('meeting-rooms/03.jpg'), { x: 620, y: 470, w: 640, h: 455, z: 3, rot: 'perspective(2000px) rotateY(-16deg) rotateX(9deg) rotateZ(2deg)' })}`,

  /* Проверка сметы: чек-лист спереди, аналитика и правила уходят назад. Демо-данные, кадры без номеров документов */
  otrx: () => `<div style="position:absolute;inset:0;background:radial-gradient(90% 90% at 80% 0%,#2c6db4 0%,#123a6c 44%,#071a35 100%)"></div>
    ${light('inset:0;background:radial-gradient(38% 30% at 28% 86%,rgb(61 200 130/.32),transparent 74%)')}
    <div class="plane" style="inset:0;transform:perspective(2400px) rotateX(38deg) rotateZ(-22deg) translate(-10px,-40px)">
      ${screen(c('otrx/05.jpg'), { x: 560, y: -150, w: 760, h: 540, z: 1, shade: 'rgb(7 26 53/.3)' })}
      ${screen(c('otrx/04.jpg'), { x: 620, y: 420, w: 780, h: 480, y0: 20, z: 1, shade: 'rgb(7 26 53/.26)' })}
      ${screen(c('otrx/03.jpg'), { x: 40, y: 90, w: 800, h: 620, iw: 1830, x0: 34, y0: 623, z: 2 })}
    </div>`,

  /* Веер настоящих кадров бота: центр в свете, края в тени */
  mimimibot: () => {
    const card = (n, x, y, w, rot, z, dim = 0) =>
      `<div class="scr" style="left:${x}px;top:${y}px;width:${w}px;height:${w * 1.333}px;border-radius:18px;z-index:${z};transform:rotate(${rot}deg);background:#111">
        <img src="${c(`mimimibot/wall/${n}-960.webp`)}" style="width:100%;height:100%;object-fit:cover">${dim ? `<i style="position:absolute;inset:0;background:rgb(10 6 2/${dim})"></i>` : ''}</div>`
    return `<div style="position:absolute;inset:0;background:radial-gradient(70% 70% at 50% 40%,#6b4315 0%,#2b1a08 52%,#0b0703 100%)"></div>
    ${card('stairs', -110, 190, 400, -15, 1, 0.3)}
    ${card('camera', 926, 190, 400, 15, 1, 0.3)}
    ${card('grey', 100, 110, 450, -7, 2, 0.08)}
    ${card('halo', 666, 110, 450, 7, 2, 0.08)}
    ${card('gold', 318, 40, 580, 0, 3)}
    ${light('inset:0;z-index:4;background:linear-gradient(180deg,transparent 62%,rgb(11 7 3/.66) 100%)')}`
  },

  /* Сайт и кабинет настоящего заказчика, спереди контейнер OSQ */
  osq: () => `<div style="position:absolute;inset:0;background:radial-gradient(90% 90% at 22% 8%,#31c7b3 0%,#0a9b8c 44%,#04463f 100%)"></div>
    ${light('inset:0;background:radial-gradient(36% 32% at 84% 84%,rgb(255 214 120/.34),transparent 74%)')}
    <div class="plane" style="inset:0;transform:perspective(2200px) rotateY(14deg) rotateX(6deg) rotateZ(-2deg)">
      ${screen(c('osq/03.jpg'), { x: 600, y: 150, w: 760, h: 560, iw: 1000, y0: 300, z: 1, shade: 'rgb(4 50 45/.16)' })}
      ${screen(c('osq/01.jpg'), { x: 44, y: 150, w: 860, h: 760, z: 2 })}
    </div>
    ${pic(c('osq/real/product-box.webp'), 'left:700px;top:430px;width:500px;z-index:3;filter:drop-shadow(0 40px 44px rgb(2 30 26/.6))')}`,

  /* Сайт в синем свете, справа маска из кейса */
  svarnoy52: () => `<div style="position:absolute;inset:0;background:radial-gradient(80% 90% at 74% 40%,#2a7fb8 0%,#14527f 42%,#061c30 100%)"></div>
    <div class="plane" style="inset:0;transform:perspective(2200px) rotateY(17deg) rotateX(5deg) rotateZ(-1deg)">
      ${screen(c('svarnoy52/r1.jpg'), { x: 30, y: 130, w: 800, h: 770, z: 1 })}
    </div>
    <img src="${c('svarnoy52/3d-about.jpg')}" style="position:absolute;left:470px;top:150px;width:800px;z-index:2;-webkit-mask-image:radial-gradient(50% 50% at 50% 50%,#000 62%,transparent 100%)">`,
}

const page = (body) => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#0b0c10}
.tile{position:relative;width:100%;height:100%;overflow:hidden}
.scr{position:absolute;overflow:hidden;box-shadow:0 0 0 1px rgb(255 255 255/.16),0 44px 90px -8px rgb(0 0 0/.58),0 12px 28px rgb(0 0 0/.3)}
.scr img{display:block}
.plane{position:absolute;transform-style:preserve-3d}
.pic{position:absolute;display:block}
.light{position:absolute;pointer-events:none}
</style><div class="tile">${body}</div>`

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: W, height: H } })
for (const [slug, scene] of Object.entries(SCENES)) {
  if (only.length && !only.includes(slug)) continue
  const tmp = `${ROOT}/tools/cards/.stage-${slug}.html`
  writeFileSync(tmp, page(scene()))
  const p = await ctx.newPage()
  await p.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
  await p.waitForTimeout(250)
  writeFileSync(`${ROOT}/public/cases/${slug}/tile.jpg`, await p.screenshot({ type: 'jpeg', quality: 90 }))
  await p.close()
  const { rmSync } = await import('node:fs')
  rmSync(tmp)
}
await browser.close()
console.log('готово')
