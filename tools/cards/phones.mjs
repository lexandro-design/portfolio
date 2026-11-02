// Доска для галереи из экранов телефона: экраны рядом, в размер окна
// устройства, на том же фоне, что обложки (covers.mjs). Кадр галереи 16:11
// режет длинные телефонные скрины по верху — на доске видно экран целиком.
//   node tools/cards/phones.mjs out.png screen1.png screen2.png [screen3.png]
// Экран обрезается до пропорции окна телефона 393×852 (лишнее снизу —
// прокрутка), размер доски 1600×1100.
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [out, ...screens] = process.argv.slice(2)
if (!out || screens.length < 1 || screens.length > 3) {
  console.log('node tools/cards/phones.mjs out.png screen1.png screen2.png [screen3.png]')
  process.exit(1)
}

const W = 1600
const H = 1100
const BG = '#e6e3db'
const phoneH = 900
const phoneW = Math.round((phoneH * 393) / 852)
const url = (p) => `data:image/png;base64,${readFileSync(resolve(p)).toString('base64')}`

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{display:flex;align-items:center;justify-content:center;gap:88px;background:${BG};
  background-image:radial-gradient(120% 90% at 30% 0%,#efede7 0%,${BG} 60%,#dcd8cf 100%)}
.phone{width:${phoneW}px;height:${phoneH}px;border-radius:52px;overflow:hidden;background:#fff;
  box-shadow:0 0 0 1px rgb(20 20 15 / .08),0 30px 70px -14px rgb(20 20 15 / .3),0 10px 22px -10px rgb(20 20 15 / .2)}
.phone img{display:block;width:100%}
</style>${screens.map((s) => `<div class="phone"><img src="${url(s)}"></div>`).join('')}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H } })
await page.setContent(html, { waitUntil: 'load' })
await page.screenshot({ path: resolve(out) })
await browser.close()
console.log(out)
