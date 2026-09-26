// Набор для Behance по кейсу: обложка, первый экран, видео прокрутки и смены экранов.
// Кадры снимаются детерминированно (анимация ставится на паузу и перематывается),
// потом склеиваются ffmpeg в MP4 и GIF. Нужен полный ffmpeg: FFMPEG=/путь/к/ffmpeg.
//   node tools/behance/render.mjs parfumeria [ещё slug…]   → _shots/behance/<slug>/
import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const FFMPEG = process.env.FFMPEG || 'ffmpeg'
const read = async (p) => JSON.parse(await readFile(join(ROOT, 'src/content/data', p), 'utf8'))
const cases = await read('cases.json')

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

// Тон фона — как у обложек Figma: ТИТАН-2 в их синем, остальные на тёплом светлом
const W = 1400
const TONES = {
  titan: { bg: '#0a4a9a', fg: '#ffffff', sub: 'rgb(255 255 255 / .62)', bar: '#f4f6fa' },
  base: { bg: '#e9e6df', fg: '#14140f', sub: 'rgb(20 20 15 / .55)', bar: '#f6f5f1' },
}
const font = (family, file) =>
  ['cyrillic', 'latin']
    .map(
      (s) =>
        `@font-face{font-family:'${family}';src:url(/node_modules/@fontsource-variable/${file}/files/${file}-${s}-wght-normal.woff2) format('woff2');font-weight:100 900}`,
    )
    .join('')
const shell = (tone, w, h, body, css = '') => `<!doctype html><meta charset="utf-8"><style>
${font('Inter', 'inter')}${font('Mono', 'jetbrains-mono')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${tone.bg};color:${tone.fg};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.m{font-family:Mono,monospace;letter-spacing:.08em;text-transform:uppercase;color:${tone.sub}}
.win{position:absolute;background:${tone.bar};border-radius:14px 14px 0 0;overflow:hidden;box-shadow:0 40px 120px rgb(0 0 0 / .28),0 0 0 1px rgb(0 0 0 / .06)}
.bar{height:44px;display:flex;align-items:center;gap:9px;padding:0 20px}
.bar i{width:12px;height:12px;border-radius:50%;background:rgb(0 0 0 / .13)}
.bar span{margin:0 auto;width:34%;height:22px;border-radius:11px;background:rgb(0 0 0 / .06)}
.win img{display:block;width:100%;height:auto}
${css}</style>${body}`
const bar = '<div class="bar"><i></i><i></i><i></i><span></span></div>'
const desktop = (c) => c.shots.filter((s) => !/^(телефон|файл в figma|обложка)/i.test(s.caption))
const phone = (c) => c.shots.find((s) => /^телефон/i.test(s.caption))
const figmaFile = (c) => c.shots.find((s) => /^файл в figma/i.test(s.caption))

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
)
const shot = async (markup, w, h, out) => {
  html = markup
  const p = await browser.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:8797/card', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({
    path: out,
    type: out.endsWith('.jpg') ? 'jpeg' : 'png',
    quality: out.endsWith('.jpg') ? 92 : undefined,
  })
  await p.close()
}

/** Текстовый блок проекта картинкой: в редакторе Behance текст не оформить, а так
    он в той же типографике, что и сайт. Высота по содержимому */
const textShot = async (tone, label, title, body, out, foot = '') => {
  html = shell(
    tone,
    W,
    2400,
    `<div class="t" style="display:grid;grid-template-columns:5fr 7fr;gap:64px;padding:120px 80px">
      <div class="m" style="font-size:14px;padding-top:14px">${label}</div>
      <div>
        <div style="font-size:48px;font-weight:450;letter-spacing:-.035em;line-height:1.08">${title}</div>
        ${body.map((b) => `<p style="margin-top:28px;font-size:22px;line-height:1.6;color:${tone.sub}">${b}</p>`).join('')}
        ${foot ? `<div class="m" style="margin-top:48px;font-size:13px;line-height:1.8">${foot}</div>` : ''}
      </div></div>`,
  )
  const p = await browser.newPage({ viewport: { width: W, height: 2400 } })
  await p.goto('http://localhost:8797/card', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  const h = await p.$eval('.t', (e) => Math.ceil(e.getBoundingClientRect().height))
  await p.screenshot({
    path: out,
    type: 'jpeg',
    quality: 92,
    clip: { x: 0, y: 0, width: W, height: h },
  })
  await p.close()
}

/** Видео: страница с CSS-анимацией, кадр за кадром по времени, потом MP4 + лёгкий GIF */
const video = async (markup, w, h, seconds, out, fps = 30) => {
  html = markup
  const dir = `${out}-frames`
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  const p = await browser.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:8797/card', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
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
  execFileSync(FFMPEG, [
    '-y',
    '-loglevel',
    'error',
    '-framerate',
    String(fps),
    '-i',
    join(dir, '%04d.png'),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    '-preset',
    'slow',
    '-movflags',
    '+faststart',
    `${out}.mp4`,
  ])
  execFileSync(FFMPEG, [
    '-y',
    '-loglevel',
    'error',
    '-i',
    `${out}.mp4`,
    '-vf',
    `fps=${process.env.GIF_FPS || 12},scale=${w}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
    `${out}.gif`,
  ])
  await rm(dir, { recursive: true, force: true })
}

for (const slug of process.argv.slice(2)) {
  const c = cases.find((x) => x.slug === slug)
  if (!c) throw new Error(`нет кейса ${slug}`)
  const tone = c.group === 'titan' ? TONES.titan : TONES.base
  const out = join(ROOT, '_shots/behance', slug)
  await mkdir(out, { recursive: true })
  const [a, b = a, ...more] = desktop(c)

  // 1. Обложка проекта 808×632: название и подпись сверху, окно сайта и телефон ровно,
  // без перспективы (в перекосе выглядело ненатурально). Низ слева Behance сам
  // затемняет под название проекта, там ничего важного
  const ph0 = phone(c)
  const k = 250 / 455
  const phoneScreen = ph0
    ? `<div class="phone"><div class="scr"><img src="/public${ph0.src}" style="position:absolute;width:${(1600 * k).toFixed(1)}px;left:${(-73 * k).toFixed(1)}px;top:${(44 - 73 * k).toFixed(1)}px"><b class="status">9:41</b></div><i class="island"></i></div>`
    : ''
  const kind = { design: 'UX/UI · Design system', web: 'Website', ai: 'Automation' }[
    c.directions[0]
  ]
  const tag = (await read('cases-i18n/en.json'))[slug]?.tagline ?? c.tagline
  const enLead = tag.charAt(0).toUpperCase() + tag.slice(1)
  await shot(
    shell(
      tone,
      808,
      632,
      `<div class="m" style="position:absolute;left:48px;top:48px;font-size:12px">${kind} · ${c.year}</div>
      <div style="position:absolute;left:48px;top:74px;font-size:46px;font-weight:500;letter-spacing:-.04em;line-height:1">${c.title}</div>
      <div style="position:absolute;left:48px;top:132px;width:420px;font-size:16px;line-height:1.45;color:${tone.sub}">${enLead}</div>
      <div class="win" style="left:48px;top:228px;width:620px;height:520px">${bar}<img src="/public${a.src}"></div>
      ${phoneScreen}`,
      `.win{border-radius:12px}
       .phone{position:absolute;left:512px;top:150px;width:266px;height:560px;border-radius:46px;background:#1b1b1d;padding:8px;box-shadow:0 30px 70px rgb(0 0 0 / .28),inset 0 0 0 1.5px #3a3a3e}
       .scr{position:relative;width:250px;height:544px;border-radius:38px;overflow:hidden;background:#fff}
       .status{position:absolute;inset:0 0 auto;height:44px;background:#fff;font:600 14px Inter;padding:15px 0 0 30px}
       .island{position:absolute;left:50%;top:18px;width:78px;height:22px;margin-left:-39px;border-radius:12px;background:#000}`,
    ),
    808,
    632,
    join(out, '01-cover.jpg'),
  )
  if (process.env.COVER_ONLY) continue

  // 2. Первый экран проекта: название и две страницы
  await shot(
    shell(
      tone,
      W,
      900,
      `
      <div class="win" style="left:600px;top:150px;width:720px;height:${Math.round((720 * b.h) / b.w) + 44}px">${bar}<img src="/public${b.src}"></div>
      <div class="win" style="left:80px;top:300px;width:800px;height:${Math.round((800 * a.h) / a.w) + 44}px">${bar}<img src="/public${a.src}"></div>
      <div style="position:absolute;left:80px;top:72px;font-size:56px;font-weight:450;letter-spacing:-.035em;line-height:1">${c.title}</div>
      <div class="m" style="position:absolute;right:80px;top:92px;font-size:14px">${c.year}</div>`,
    ),
    W,
    900,
    join(out, '02-hero.jpg'),
  )

  // Тексты блоков — английские с сайта: разделы кейса по одному между картинками
  const en = (await read('cases-i18n/en.json'))[slug]
  const secs = en?.sections ?? c.sections
  const label = (i) => `${String(i + 1).padStart(2, '0')} / ${c.title}`
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
  const stack = `Stack: ${c.stack.map((x) => STACK_EN[x] ?? x).join(', ')}`
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)
  const last = Math.min(secs.length, 3) - 1
  const block = (i, file, title = cap(secs[i].title)) =>
    textShot(
      tone,
      label(i),
      title,
      i === last
        ? secs.slice(i).flatMap((x, j) => (j ? [cap(x.title), ...x.body] : x.body))
        : secs[i].body,
      join(out, file),
      i === last ? stack : '',
    )
  if (secs[0]) await block(0, '03-text.jpg', en?.lead ?? c.lead)

  // 3. Видео: прокрутка главной в окне браузера — вниз, пауза, обратно
  const winW = 1100
  const imgH = Math.round((winW * a.h) / a.w)
  const viewH = 900 - 80 - 44
  const dist = Math.max(0, imgH - viewH)
  await video(
    shell(
      tone,
      W,
      900,
      `<div class="win" style="left:${(W - winW) / 2}px;top:80px;width:${winW}px;height:900px">${bar}<div style="position:relative;z-index:0;height:calc(100% - 44px);overflow:hidden"><img class="scroll" src="/public${a.src}"></div></div>`,
      `@keyframes scroll{0%,8%{transform:translateY(0)}46%,56%{transform:translateY(-${dist}px)}94%,100%{transform:translateY(0)}}
       .scroll{animation:scroll 12s cubic-bezier(.65,0,.35,1) infinite}`,
    ),
    W,
    900,
    12,
    join(out, '04-scroll'),
  )

  // 4. Видео: ключевые экраны сменяют друг друга с лёгким наездом
  const screens = [a, b, ...more].slice(0, 5)
  const per = 2.4
  const total = per * screens.length
  const pct = (s) => ((s / total) * 100).toFixed(2)
  await video(
    shell(
      tone,
      W,
      900,
      screens
        .map(
          (s, i) =>
            `<div class="win card" style="left:150px;top:90px;width:1100px;height:900px;animation-name:f${i}">${bar}<img src="/public${s.src}"></div>`,
        )
        .join(''),
      screens
        .map((_, i) => {
          const start = i * per
          return `@keyframes f${i}{0%{opacity:${i ? 0 : 1};transform:translateY(${i ? 24 : 0}px)}${i ? `${pct(start - 0.01)}%{opacity:0;transform:translateY(24px)}${pct(start + 0.5)}%{opacity:1;transform:none}` : ''}${pct(start + per)}%{opacity:1;transform:none}${pct(start + per + 0.5)}%{opacity:${i === screens.length - 1 ? 1 : 0};transform:none}100%{opacity:${i === screens.length - 1 ? 0 : 0}}}`
        })
        .join('\n') +
        `\n.card{animation-duration:${total}s;animation-iteration-count:infinite;animation-timing-function:cubic-bezier(.25,1,.5,1);animation-fill-mode:both}`,
    ),
    W,
    900,
    total,
    join(out, '06-screens'),
  )

  if (secs[1]) await block(1, '05-text.jpg')
  if (secs[2]) await block(2, '07-text.jpg')

  // 5. Телефон и файл Figma — статикой на всю ширину
  const ph = phone(c)
  if (ph)
    await shot(
      shell(
        tone,
        W,
        Math.round((W * ph.h) / ph.w),
        `<img src="/public${ph.src}" style="display:block;width:100%">`,
      ),
      W,
      Math.round((W * ph.h) / ph.w),
      join(out, '08-phone.jpg'),
    )
  const ff = figmaFile(c)
  if (ff)
    await shot(
      shell(
        tone,
        W,
        Math.round((W * ff.h) / ff.w),
        `<img src="/public${ff.src}" style="display:block;width:100%">`,
      ),
      W,
      Math.round((W * ff.h) / ff.w),
      join(out, '09-figma.jpg'),
    )

  // 6. Текст проекта для блоков Behance — с сайта, RU и EN
  const text = (t) =>
    [
      t.title ?? c.title,
      t.lead,
      '',
      ...t.sections.flatMap((s) => [s.title.toUpperCase(), ...s.body, '']),
      `Stack: ${c.stack.join(', ')}`,
    ].join('\n')
  await writeFile(join(out, 'text-ru.txt'), text(c))
  if (en) await writeFile(join(out, 'text-en.txt'), text({ ...en, title: en.title ?? c.title }))
  console.log('готово:', slug)
}
await browser.close()
server.close()
