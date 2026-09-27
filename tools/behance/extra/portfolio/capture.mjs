// Скриншоты самого сайта-портфолио для проекта на Behance.
// Сначала собрать сайт (pnpm build) и раздать out/ по адресу http://localhost:8811/portfolio/,
// потом: node tools/behance/extra/portfolio/capture.mjs
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('.', import.meta.url))
const BASE = process.env.SITE || 'http://localhost:8811/portfolio'
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
)

const snap = async (
  name,
  path,
  {
    theme = 'dark',
    width = 1440,
    height = 900,
    full = true,
    max = 5200,
    scrollTo,
    offset = -90,
  } = {},
) => {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: width < 600 ? 2 : 1,
  })
  await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme)
  const p = await ctx.newPage()
  // Behance английский, снимаем английскую версию
  await p.goto(BASE + '/en' + path, { waitUntil: 'networkidle' })
  // Появление при прокрутке показываем сразу, анимации замираем на месте
  // Цены на Behance не показываем, как и в профиле GitHub
  await p.addStyleTag({
    content: '*{transition:none!important}[class*="price"]{visibility:hidden}',
  })
  await p.evaluate(async () => {
    document.querySelectorAll('[class*="reveal"]').forEach((e) => (e.dataset.visible = ''))
    document.documentElement.style.scrollBehavior = 'auto'
    // Превью кейсов запускаются, когда попадают в экран: проходим страницу целиком
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    scrollTo(0, 0)
    const imgs = [...document.querySelectorAll('img')]
    imgs.forEach((i) => (i.loading = 'eager'))
    await Promise.all(
      imgs.map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))),
    )
  })
  if (scrollTo)
    await p.evaluate(
      ([s, o]) => {
        const el = document.querySelector(s)
        if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY + o, behavior: 'instant' })
      },
      [scrollTo, offset],
    )
  await p.waitForTimeout(1500)
  const h = Math.min(await p.evaluate(() => document.documentElement.scrollHeight), max)
  await p.screenshot({
    path: `${dir}${name}.jpg`,
    type: 'jpeg',
    quality: 90,
    ...(full ? { fullPage: true, clip: { x: 0, y: 0, width, height: h } } : {}),
  })
  await ctx.close()
}

await snap('01', '/', { theme: 'dark' })
await snap('02', '/', { theme: 'neon', full: false })
await snap('03', '/', { theme: 'light', full: false })
await snap('04', '/cases/parfumeria/', { theme: 'dark' })
await snap('05', '/', { theme: 'neon', full: false, scrollTo: '#system', offset: 880 })
await snap('06', '/', { theme: 'dark', full: false, scrollTo: '#brief', offset: -40 })
await snap('07', '/', { theme: 'dark', width: 390, height: 844, full: false })
await snap('08', '/', { theme: 'light', width: 390, height: 844, full: false, scrollTo: '#works' })
await snap('09', '/', { theme: 'neon', width: 390, height: 844, full: false, scrollTo: '#system' })
await browser.close()
