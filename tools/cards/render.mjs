// Картинки из HTML тем же шрифтом и токенами, что на сайте:
//   public/og/*.png            — превью ссылок (Telegram, соцсети), 1200×630
//   ../lexandro-design/assets  — блоки README профиля, тёмные и светлые
// node tools/cards/render.mjs [og|profile]
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { mkdir, readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cases, casesEn } from './cases.mjs'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const PROFILE = resolve(ROOT, '../lexandro-design/assets')
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
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    console.warn('нет файла:', path)
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(8798, r))

const THEMES = {
  dark: {
    bg: '#0a0a0a',
    el: '#121212',
    fg: '#f5f5f2',
    fg2: '#a8a8a3',
    fg3: '#6b6b68',
    hair: 'rgb(245 245 242 / .1)',
    hover: 'rgb(245 245 242 / .24)',
    live: '#4ade80',
  },
  light: {
    bg: '#f5f4ef',
    el: '#eceae1',
    fg: '#14140f',
    fg2: '#57564e',
    fg3: '#8b897f',
    hair: 'rgb(20 20 15 / .12)',
    hover: 'rgb(20 20 15 / .3)',
    live: '#1f8a4c',
  },
}

const font = (family, file) =>
  ['cyrillic', 'latin']
    .map(
      (s) =>
        `@font-face{font-family:'${family}';src:url(/node_modules/@fontsource-variable/${file}/files/${file}-${s}-wght-normal.woff2) format('woff2');font-weight:100 900}`,
    )
    .join('')

const page = (t, w, h, body, extra = '') => `<!doctype html><meta charset="utf-8"><style>
${font('Inter', 'inter')}${font('Mono', 'jetbrains-mono')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${t.bg};color:${t.fg};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;font-feature-settings:'cv11'}
.card{position:relative;width:${w}px;height:${h}px;overflow:hidden;border:1px solid ${t.hair}}
.m{font-family:Mono,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${t.fg3}}
.m2{color:${t.fg2}}
.row{display:flex;justify-content:space-between;gap:24px}
.h{font-weight:450;letter-spacing:-.045em;line-height:.96}
.p{color:${t.fg2};line-height:1.55}
.dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:${t.live};margin-right:8px;vertical-align:1px}
.num{font-weight:300;line-height:1;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1px ${t.hover}}
.corner{position:absolute;width:12px;height:12px;border:1px solid ${t.hover}}
.tl{top:12px;left:12px;border-right:0;border-bottom:0}.br{bottom:12px;right:12px;border-left:0;border-top:0}
.shot{display:block;width:100%;height:100%;object-fit:cover;object-position:top left}
${extra}</style><div class="card">${body}</div>`

const pad = (n) => String(n).padStart(2, '0')
const TOTAL = cases.length

// ---------- превью ссылок ----------

const OG_HOME = {
  ru: {
    meta: 'LEXANDRO · санкт-петербург',
    title: 'Дизайн, код<br>и AI-агенты —<br>под ключ<br><span>в одних руках.</span>',
    who: 'Алексей Свешников · дизайн, код и ai',
    status: 'открыт к проектам',
    size: 84,
  },
  en: {
    meta: 'LEXANDRO · saint petersburg',
    title: 'Design, code<br>and AI agents,<br>end to end,<br><span>in one pair of hands.</span>',
    who: 'Alexey Sveshnikov · design, code and ai',
    status: 'open to projects',
    size: 80,
  },
  zh: {
    meta: 'LEXANDRO · 圣彼得堡',
    title: '设计、代码<br>与 AI 智能体，<br><span>一人全包。</span>',
    who: 'Alexey Sveshnikov · ux/ui 与开发',
    status: '可接项目',
    size: 96,
    ls: 0,
  },
  ja: {
    meta: 'LEXANDRO · サンクトペテルブルク',
    title: 'デザイン、コード、<br>AI エージェントまで、<br><span>ひとりで一貫して。</span>',
    who: 'Alexey Sveshnikov · ux/ui と開発',
    status: '案件受付中',
    size: 92,
    ls: 0,
  },
}

const ogHome = (t, l = OG_HOME.ru) =>
  page(
    t,
    1200,
    630,
    `
  <div style="position:absolute;inset:56px 64px;display:grid;grid-template-rows:auto 1fr auto">
    <div class="row m" style="font-size:15px"><span>${l.meta}</span><span>lexandro-design.github.io/portfolio</span></div>
    <div class="h" style="align-self:end;font-size:${l.size}px;font-family:Inter,'Microsoft YaHei','Yu Gothic UI',sans-serif;${l.ls === 0 ? 'letter-spacing:0;line-height:1.12' : ''}">${l.title.replace('<span>', `<span style="color:${t.fg3}">`)}</div>
    <div class="row m" style="font-size:15px;margin-top:40px"><span class="m2">${l.who}</span><span style="color:${t.fg}"><i class="dot"></i>${l.status}</span></div>
  </div>`,
  )

const ogCase = (t, c) => {
  const cover = c.shots[0]
  const media = cover
    ? `<div style="position:absolute;left:600px;top:120px;width:680px;height:560px;border:1px solid ${t.hair};background:${t.el}"><img class="shot" src="/public${cover.src}"></div>`
    : `<span class="num" style="position:absolute;right:-20px;bottom:-90px;font-size:520px">${pad(c.index)}</span>`
  return page(
    t,
    1200,
    630,
    `
  ${media}
  <div style="position:absolute;inset:56px 64px;display:grid;grid-template-rows:auto 1fr auto;width:${cover ? 500 : 900}px">
    <div class="m" style="font-size:15px">case ${pad(c.index)} / ${pad(TOTAL)} · ${c.label}</div>
    <div style="align-self:end">
      <div class="h" style="font-size:${cover ? 68 : 88}px">${c.title}</div>
      <div class="h" style="font-size:${cover ? 40 : 52}px;color:${t.fg2};margin-top:12px;letter-spacing:-.035em;line-height:1.05">${c.tagline}</div>
    </div>
    <div class="m" style="font-size:15px;margin-top:44px">LEXANDRO · ${c.year}</div>
  </div>`,
  )
}

// ---------- README профиля: колонка 830px, рендер в 2× ----------

const W = 830

const hero = (t) =>
  page(
    t,
    W,
    480,
    `
  <div style="position:absolute;inset:36px 40px;display:grid;grid-template-rows:auto 1fr auto">
    <div class="row m"><span>LEXANDRO · saint petersburg</span><span style="color:${t.fg}"><i class="dot"></i>open to projects</span></div>
    <div class="h" style="align-self:end;font-size:62px">Design, code<br>and AI agents, end to end,<br><span style="color:${t.fg2}">in one pair of hands.</span></div>
    <div class="row" style="margin-top:30px;align-items:end">
      <p class="p" style="font-size:15px;max-width:480px">Alexey Sveshnikov, designer and developer. I design the product and its design system, build the front end, write the back end, set up the database and server and wire in AI agents. From idea to launch.</p>
      <div class="m" style="text-align:right;line-height:1.9">now<br><span style="color:${t.fg}">TITAN-2 holding</span></div>
    </div>
  </div>`,
  )

const label = (t, left, right = '') =>
  page(
    t,
    W,
    64,
    `<div class="row m" style="position:absolute;inset:auto 0 16px;padding:0 2px"><span>${left}</span><span>${right}</span></div>`,
    `body{background:transparent}.card{border:0;border-bottom:1px solid ${t.hair}}`,
  )

const featured = (t, c) =>
  page(
    t,
    W,
    598,
    `
  <div style="position:absolute;inset:24px;display:grid;grid-template-rows:380px auto">
    <div style="border:1px solid ${t.hair};background:${t.el};overflow:hidden"><img class="shot" style="object-position:center" src="/public${(c.cover ?? c.thumb ?? c.shots[0]).src}"></div>
    <div style="padding-top:22px">
      <div class="row m"><span>${pad(c.index)} / ${pad(TOTAL)} · ${c.label}</span><span>${c.year}</span></div>
      <div class="h" style="font-size:38px;margin-top:14px;letter-spacing:-.035em;line-height:1.06">${c.title} <span style="color:${t.fg2}">· ${c.tagline}</span></div>
      <p class="p" style="font-size:14px;margin-top:10px;max-width:640px">${c.lead}</p>
    </div>
  </div>`,
  )

const half = (t, c) => {
  // Превью строки с сайта (окна браузера на фоне), а не голый скрин
  const cover = c.thumb ?? c.shots[0]
  const media = cover
    ? `<div style="position:absolute;left:18px;top:18px;right:18px;height:210px;border:1px solid ${t.hair};background:${t.el};overflow:hidden"><img class="shot" style="object-position:${c.thumb ? 'center' : 'top left'}" src="/public${cover.src}"></div>`
    : `<div style="position:absolute;left:18px;top:18px;right:18px;height:210px;border:1px solid ${t.hair};background:${t.el};overflow:hidden">
         <i class="corner tl"></i><i class="corner br"></i>
         <div class="row m" style="position:absolute;top:14px;left:34px;right:34px;font-size:10px"><span>case ${pad(c.index)}</span><span>${c.year}</span></div>
         <div class="m" style="position:absolute;left:34px;bottom:24px;display:grid;gap:3px;text-transform:lowercase;letter-spacing:.02em;font-size:10px">${c.stack
           .slice(0, 4)
           .map((s) => `<span>· ${s}</span>`)
           .join('')}</div>
         <span class="num" style="position:absolute;right:-8px;bottom:-40px;font-size:190px">${pad(c.index)}</span>
       </div>`
  return page(
    t,
    405,
    340,
    `${media}
  <div style="position:absolute;left:18px;right:18px;bottom:22px">
    <div class="row m" style="font-size:10px"><span>${pad(c.index)} / ${pad(TOTAL)} · ${c.label}</span><span>${c.year}</span></div>
    <div class="h" style="font-size:26px;margin-top:12px;letter-spacing:-.03em;line-height:1.08">${c.title}</div>
    <div style="font-size:14px;color:${t.fg2};margin-top:4px">${c.tagline}</div>
  </div>`,
  )
}

// Те же три направления и теги, что в блоке «Услуги» на сайте
const STACK = [
  ['design', ['UX/UI', 'Design systems', 'Design tokens', 'Figma, Auto Layout']],
  ['web', ['React, Next.js', 'Node.js', 'Tilda', 'Responsive']],
  ['data', ['PostgreSQL', 'Supabase', 'REST APIs', 'SQL functions']],
  ['ai', ['Telegram bots', 'AI agents', 'RAG', 'CRM integrations']],
]
const APPROACH = [
  [
    'design',
    'UX/UI and design systems: tokens, components with every state, screens built from ready parts.',
  ],
  ['web', 'Websites and back end on my own design, checked against it at every width.'],
  ['automation', 'Telegram bots and AI assistants, CRM and payment integrations, RAG search.'],
]

// Две карточки-приглашения на сайт: песочница дизайн-системы и конструктор заявки
const LIME = '#c6ff3d'
const tryCard = (t, kind) => {
  const sandbox = `
    <div style="position:absolute;left:18px;top:18px;right:18px;height:210px;border:1px solid ${t.hair};background:${t.el};overflow:hidden;display:grid;grid-template-columns:118px 1fr">
      <div style="padding:16px 14px;border-right:1px solid ${t.hair};display:grid;gap:12px;align-content:start">
        ${['radius', 'density', 'accent', 'font']
          .map(
            (k, i) => `<div><div class="m" style="font-size:8px">${k}</div>
          ${
            i === 2
              ? `<div style="display:flex;gap:4px;margin-top:6px">${[LIME, '#9d8cff', '#ff6b4a', '#38bdf8'].map((c, j) => `<i style="width:14px;height:14px;background:${c};${j ? '' : `outline:1px solid ${t.fg};outline-offset:2px`}"></i>`).join('')}</div>`
              : `<div style="height:3px;margin-top:9px;background:${t.hair};position:relative"><i style="position:absolute;left:0;top:0;height:3px;width:${[70, 50, 0, 35][i]}%;background:${t.fg}"></i></div>`
          }</div>`,
          )
          .join('')}
      </div>
      <div style="display:grid;place-items:center">
        <div style="width:190px;padding:14px;border:1px solid ${t.hair};border-radius:14px;background:${t.bg};display:grid;gap:9px">
          <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:13px;font-weight:550">Meeting room 3</b><span style="font-size:9px;padding:2px 7px;border-radius:9px;background:rgb(198 255 61 / .14);border:1px solid rgb(198 255 61 / .5)">free</span></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">${['09:00', '10:00', '11:00'].map((x, i) => `<span style="font-size:9px;text-align:center;padding:5px 0;border-radius:8px;border:1px solid ${i === 2 ? LIME : t.hair};${i === 2 ? `background:${LIME};color:#0a0a0a` : ''}${i === 1 ? `;color:${t.fg3};text-decoration:line-through` : ''}">${x}</span>`).join('')}</div>
          <span style="font-size:10px;font-weight:550;text-align:center;padding:7px;border-radius:10px;background:${LIME};color:#0a0a0a">Book · 11:00</span>
        </div>
      </div>
    </div>`
  const brief = `
    <div style="position:absolute;left:18px;top:18px;right:18px;height:210px;border:1px solid ${t.hair};background:${t.el};overflow:hidden;padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="display:grid;gap:6px;align-content:start">
        <div class="m" style="font-size:8px;margin-bottom:4px">what you need</div>
        ${[
          ['Design systems', true],
          ['Websites', false],
          ['Automation', true],
        ]
          .map(
            ([x, on]) =>
              `<div style="display:flex;gap:7px;align-items:center;font-size:10px;padding:7px 8px;border:1px solid ${on ? t.fg : t.hair}"><i style="width:9px;height:9px;border:1px solid ${t.hover};${on ? `background:${LIME};border-color:${LIME}` : ''}"></i>${x}</div>`,
          )
          .join('')}
      </div>
      <div style="display:grid;gap:7px;align-content:start">
        <div class="m" style="font-size:8px;margin-bottom:4px">how the work goes</div>
        ${['Analysis', 'Design', 'Automation', 'Handover'].map((x, i) => `<div style="display:flex;gap:8px;font-size:10px;padding-bottom:5px;border-bottom:1px solid ${t.hair}"><span class="m" style="font-size:8px;color:${t.live}">0${i + 1}</span>${x}</div>`).join('')}
        <span style="margin-top:4px;font-family:Mono,monospace;font-size:8px;letter-spacing:.06em;text-transform:uppercase;text-align:center;padding:7px;background:${LIME};color:#0a0a0a">send via telegram</span>
      </div>
    </div>`
  const [title, sub] =
    kind === 'sandbox'
      ? ['Design-system sandbox', 'tune the tokens live on the site']
      : ['Brief in a minute', 'pick services, get a ready message']
  return page(
    t,
    405,
    340,
    `${kind === 'sandbox' ? sandbox : brief}
  <div style="position:absolute;left:18px;right:18px;bottom:22px">
    <div class="row m" style="font-size:10px"><span>try it · ${kind === 'sandbox' ? 'system' : 'contact'}</span><span>↗</span></div>
    <div class="h" style="font-size:26px;margin-top:12px;letter-spacing:-.03em;line-height:1.08">${title}</div>
    <div style="font-size:14px;color:${t.fg2};margin-top:4px">${sub}</div>
  </div>`,
  )
}
const approach = (t) =>
  page(
    t,
    W,
    210,
    `
  <div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr)">
    ${APPROACH.map(
      ([k, v], i) => `<div style="padding:28px 24px;${i ? `border-left:1px solid ${t.hair}` : ''}">
      <div class="m">0${i + 1} / ${k}</div>
      <p style="margin-top:20px;font-size:17px;line-height:1.4;letter-spacing:-.01em">${v}</p>
    </div>`,
    ).join('')}
  </div>`,
  )
const stack = (t) =>
  page(
    t,
    W,
    200,
    `
  <div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr)">
    ${STACK.map(
      ([k, v], i) => `<div style="padding:28px 24px;${i ? `border-left:1px solid ${t.hair}` : ''}">
      <div class="m">0${i + 1} / ${k}</div>
      <div style="margin-top:20px;display:grid;gap:7px;font-size:15px">${v.map((x) => `<span>${x}</span>`).join('')}</div>
    </div>`,
    ).join('')}
  </div>`,
  )

const contact = (t) =>
  page(
    t,
    W,
    300,
    `
  <div style="position:absolute;inset:36px 40px;display:grid;grid-template-rows:auto 1fr auto">
    <div class="m">contact</div>
    <div class="h" style="align-self:center;font-size:60px">Have a project<br>in mind?</div>
    <div class="m m2" style="position:absolute;top:0;right:0">brief in a minute on the site ↗</div>
    <div class="row" style="align-items:end">
      <span style="font-size:22px;letter-spacing:-.02em;padding-bottom:6px;border-bottom:1px solid ${t.hover}">alexssveshnikov@gmail.com</span>
      <span class="m m2" style="text-align:right;line-height:1.9">telegram<br><span style="color:${t.fg}">@lexandr0</span></span>
    </div>
  </div>`,
  )

// ---------- обложки файлов Figma: строка кейса как на главной сайта, 1920×1080 ----------

const figmaCover = (t, c) =>
  page(
    t,
    1920,
    1080,
    `
  <div style="position:absolute;inset:96px;display:grid;grid-template-columns:1040px 1fr;gap:88px;align-items:center">
    <div style="height:736px;border:1px solid ${t.hair};background:${t.el};overflow:hidden"><img class="shot" style="object-position:center" src="/public${(c.thumb ?? c.shots[0]).src}"></div>
    <div style="display:grid;gap:36px;align-content:center">
      <div class="row m" style="font-size:18px"><span>${pad(c.index)} / ${pad(TOTAL)} · ${c.label}</span><span>${c.year}</span></div>
      <div class="h" style="font-size:78px;letter-spacing:-.04em;line-height:1.02">${c.title} <span style="color:${t.fg2}">· ${c.tagline}</span></div>
      <p class="p" style="font-size:24px">${c.lead}</p>
      <div class="m" style="font-size:16px;display:flex;flex-wrap:wrap;gap:10px 28px;text-transform:lowercase;letter-spacing:.02em">${c.stack.map((s) => `<span>· ${s}</span>`).join('')}</div>
    </div>
  </div>
  <div class="row m" style="position:absolute;left:96px;right:96px;top:40px;font-size:16px"><span>LEXANDRO</span><span>${c.client}</span></div>`,
  )

// ---------- съёмка ----------

// CHROME_PATH — если браузер Playwright лежит не там, где он его ищет (например, в облачной среде)
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
)
const shot = async (markup, w, h, out, scale = 1) => {
  const clear = markup.includes('body{background:transparent}')
  html = markup
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale })
  await p.goto('http://localhost:8798/card', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({ path: out, omitBackground: clear })
  await p.close()
}

export const PROFILE_CASES = [
  'parfumeria',
  'meeting-rooms',
  'mimimibot',
  'otrx',
  'food-assistants',
  'meg-site',
  'osq',
  'svarnoy52',
  'ai-translator',
]

const mode = process.argv[2]
if (!mode || mode === 'og') {
  await mkdir(join(ROOT, 'public/og'), { recursive: true })
  for (const [l, copy] of Object.entries(OG_HOME))
    await shot(
      ogHome(THEMES.dark, copy),
      1200,
      630,
      join(ROOT, `public/og/home${l === 'ru' ? '' : '-' + l}.png`),
    )
  for (const c of cases)
    await shot(ogCase(THEMES.dark, c), 1200, 630, join(ROOT, `public/og/${c.slug}.png`))
}
if (!mode || mode === 'profile') {
  await mkdir(PROFILE, { recursive: true })
  // В профиле не все кейсы, а витрина: главный крупно и пары карточек под ним.
  // Список и порядок — те же, что в README репозитория lexandro-design
  const [first, ...rest] = PROFILE_CASES.map((slug) => casesEn.find((c) => c.slug === slug))
  for (const [name, t] of Object.entries(THEMES)) {
    await shot(hero(t), W, 480, join(PROFILE, `hero-${name}.png`), 2)
    await shot(
      label(t, 'what I do', 'end to end · one person'),
      W,
      64,
      join(PROFILE, `label-approach-${name}.png`),
      2,
    )
    await shot(approach(t), W, 210, join(PROFILE, `approach-${name}.png`), 2)
    await shot(
      label(t, 'selected work', `${TOTAL} projects`),
      W,
      64,
      join(PROFILE, `label-works-${name}.png`),
      2,
    )
    await shot(label(t, 'stack'), W, 64, join(PROFILE, `label-stack-${name}.png`), 2)
    await shot(
      label(t, 'try it', 'live on the site'),
      W,
      64,
      join(PROFILE, `label-try-${name}.png`),
      2,
    )
    await shot(tryCard(t, 'sandbox'), 405, 340, join(PROFILE, `try-sandbox-${name}.png`), 2)
    await shot(tryCard(t, 'brief'), 405, 340, join(PROFILE, `try-brief-${name}.png`), 2)
    await shot(stack(t), W, 200, join(PROFILE, `stack-${name}.png`), 2)
    await shot(contact(t), W, 300, join(PROFILE, `contact-${name}.png`), 2)
    await shot(featured(t, first), W, 598, join(PROFILE, `case-${first.slug}-${name}.png`), 2)
    for (const c of rest)
      await shot(half(t, c), 405, 340, join(PROFILE, `case-${c.slug}-${name}.png`), 2)
  }
}
if (mode === 'figma') {
  const out = join(ROOT, '_shots/figma-covers')
  await mkdir(out, { recursive: true })
  for (const c of cases.filter((c) => c.thumb || c.shots.length))
    await shot(figmaCover(THEMES.dark, c), 1920, 1080, join(out, `${c.slug}.png`))
}
await browser.close()
server.close()
console.log('ok')
