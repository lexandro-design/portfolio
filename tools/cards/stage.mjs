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

  /* Герои и экраны из текущей сборки игры */
  'garden-td': () => {
    const hero = (n, x, y, w, z = 3, rot = 0) =>
      pic(s(`gt-${n}.webp`), `left:${x}px;top:${y}px;width:${w}px;z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 22px 24px rgb(20 10 50/.6))`)
    return `<img src="${s('gt-bg.webp')}" style="position:absolute;inset:-30px;width:calc(100% + 60px);height:calc(100% + 60px);object-fit:cover;object-position:50% 40%;filter:blur(2px) saturate(1.1)">
    ${light('inset:0;z-index:1;background:linear-gradient(180deg,rgb(24 14 60/.42) 0%,rgb(24 14 60/.02) 44%,rgb(16 8 44/.72) 100%)')}
    ${light('inset:0;z-index:1;background:radial-gradient(44% 38% at 50% 56%,rgb(255 196 90/.5),transparent 74%)')}
    ${screen(s('gt-battle.webp'), { x: 56, y: 216, w: 310, h: 671, r: 34, z: 2, rot: 'rotate(-7deg)' })}
    ${screen(s('gt-home.webp'), { x: 850, y: 216, w: 310, h: 671, r: 34, z: 2, rot: 'rotate(7deg)' })}
    ${pic(s('gt-logo.webp'), 'left:358px;top:44px;width:500px;z-index:6;filter:drop-shadow(0 16px 24px rgb(20 10 50/.6))')}
    ${hero('gorynych', 300, 400, 250, 3, -4)}
    ${hero('tomat', 668, 420, 226, 3, 4)}
    ${hero('chudo', 452, 318, 312, 4)}
    ${hero('tykva', 236, 610, 250, 5, -3)}
    ${hero('lyagushka', 722, 610, 220, 5, 3)}
    ${hero('morkov', 498, 590, 214, 6)}`
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

  /* Лендинг в цвете бренда: первый экран крупно, за ним профессии, спереди этапы участия */
  'prof-study': () => `<div style="position:absolute;inset:0;background:radial-gradient(90% 90% at 78% 10%,#2f7fe0 0%,#0a55b4 40%,#00306f 78%,#001c44 100%)"></div>
    ${light('inset:0;background:radial-gradient(40% 36% at 92% 92%,rgb(176 255 64/.3),transparent 74%)')}
    <div class="plane" style="inset:0;transform:perspective(2400px) rotateY(12deg) rotateX(5deg) rotateZ(-1.5deg)">
      ${screen(c('prof-study/04.jpg'), { x: 640, y: 40, w: 680, h: 520, iw: 900, y0: 566, z: 1, shade: 'rgb(0 28 68/.24)', bg: '#004a9f' })}
      ${screen(c('prof-study/01.jpg'), { x: 70, y: 130, w: 860, h: 640, z: 2, bg: '#004a9f' })}
      ${screen(c('prof-study/02.jpg'), { x: 780, y: 440, w: 470, h: 346, iw: 800, y0: 240, x0: 20, z: 3, bg: '#004a9f' })}
    </div>`,

  /* Монохром бренда: фото из кампании на весь край, спереди экраны магазина на телефоне */
  reckon: () => {
    const phone = (x0, x, y, rot, z) => screen(c('reckon/03.jpg'), { x, y, w: 300, h: 650, iw: 1056, x0: x0 * 0.66, y0: 49, r: 26, z, rot: `rotate(${rot}deg)` })
    return `<div style="position:absolute;inset:0;background:#1b1b1b"></div>
    <div class="scr" style="left:-40px;top:-30px;width:760px;height:920px;box-shadow:none;background:#fff"><img src="${c('reckon/05.jpg')}" style="position:absolute;height:100%;left:-300px;max-width:none"></div>
    ${phone(583, 610, 130, -4, 2)}
    ${phone(1081, 880, 90, 4, 3)}`
  },

  /* Сайт в синем свете: главная спереди, каталог за ней. Без 3D */
  svarnoy52: () => `<div style="position:absolute;inset:0;background:radial-gradient(80% 90% at 74% 40%,#2a7fb8 0%,#14527f 42%,#061c30 100%)"></div>
    ${light('inset:0;background:radial-gradient(40% 34% at 80% 18%,rgb(255 255 255/.28),transparent 72%)')}
    <div class="plane" style="inset:0;transform:perspective(2200px) rotateY(-14deg) rotateX(7deg) rotateZ(1.5deg)">
      ${screen(c('svarnoy52/r2.jpg'), { x: 560, y: 60, w: 760, h: 700, z: 1, shade: 'rgb(6 28 48/.22)' })}
      ${screen(c('svarnoy52/r1.jpg'), { x: 60, y: 150, w: 860, h: 740, z: 2 })}
    </div>`,
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
