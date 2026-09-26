// Картинки из HTML тем же шрифтом и токенами, что на сайте:
//   public/og/*.png            — превью ссылок (Telegram, соцсети), 1200×630
//   ../lexandro-design/assets  — блоки README профиля, тёмные и светлые
// node tools/cards/render.mjs [og|profile]
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
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
    ? `<div style="position:absolute;left:18px;top:18px;right:18px;height:261px;border:1px solid ${t.hair};background:${t.el};overflow:hidden"><img class="shot" style="object-position:${c.thumb ? 'center' : 'top left'}" src="/public${cover.src}"></div>`
    : `<div style="position:absolute;left:18px;top:18px;right:18px;height:261px;border:1px solid ${t.hair};background:${t.el};overflow:hidden">
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
    391,
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
const SERVICES = [
  [
    'design',
    'UX/UI and design systems',
    'Tokens, components with every state and grid rules. New screens are assembled from ready parts.',
    ['ux/ui', 'design systems', 'figma'],
  ],
  [
    'web',
    'Websites and back end',
    'Sites and web apps on my own design: React and Next.js or Tilda, back end, database, server.',
    ['react', 'next.js', 'postgresql'],
  ],
  [
    'automation',
    'Automation and AI',
    'Telegram bots and AI assistants, CRM and payment integrations, RAG search over documents.',
    ['javascript', 'rag', 'ai agents'],
  ],
]
const services = (t) =>
  page(
    t,
    W,
    268,
    `
  <div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr)">
    ${SERVICES.map(
      (
        [k, title, text, tags],
        i,
      ) => `<div style="padding:28px 24px;display:grid;grid-template-rows:auto auto 1fr auto;gap:14px;${i ? `border-left:1px solid ${t.hair}` : ''}">
      <div class="m">0${i + 1} / ${k}</div>
      <div style="font-size:22px;letter-spacing:-.02em;line-height:1.15">${title}</div>
      <p class="p" style="font-size:14px">${text}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${tags.map((x) => `<span class="m" style="font-size:10px;padding:4px 8px;border:1px solid ${t.hair};text-transform:lowercase;letter-spacing:.02em">${x}</span>`).join('')}</div>
    </div>`,
    ).join('')}
  </div>`,
  )

// Две карточки-приглашения на сайт: песочница дизайн-системы и конструктор заявки
const LIME = '#c6ff3d'
const tryCard = (t, kind) => {
  // Живой скриншот мини-сайта из песочницы (снимается с собранного сайта в _shots/profile)
  const sandbox = `
    <div style="position:absolute;left:18px;top:18px;right:18px;height:261px;border:1px solid ${t.hair};background:${t.el};overflow:hidden">
      <img class="shot" style="object-position:top center" src="/_shots/profile/sandbox-${t.bg === THEMES.dark.bg ? 'dark' : 'light'}.png">
    </div>`
  const brief = `
    <div style="position:absolute;left:18px;top:18px;right:18px;height:261px;border:1px solid ${t.hair};background:${t.el};overflow:hidden;padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
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
      ? ['Design-system sandbox', 'a whole site rebuilds from a few tokens']
      : ['Brief in a minute', 'pick services, get a ready message']
  return page(
    t,
    405,
    391,
    `${kind === 'sandbox' ? sandbox : brief}
  <div style="position:absolute;left:18px;right:18px;bottom:22px">
    <div class="row m" style="font-size:10px"><span>try it · ${kind === 'sandbox' ? 'system' : 'contact'}</span><span>↗</span></div>
    <div class="h" style="font-size:26px;margin-top:12px;letter-spacing:-.03em;line-height:1.08">${title}</div>
    <div style="font-size:14px;color:${t.fg2};margin-top:4px">${sub}</div>
  </div>`,
  )
}
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

// ---------- анимированная переписка для карточек автоматизаций (SVG, играет прямо в README) ----------

const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const STEP = 1.1 // секунда на сообщение
const TYPING = 0.9 // бот «печатает» перед ответом
const HOLD = 3 // вся переписка висит перед новым кругом

const chatSvg = (t, c, photo) => {
  const lines = c.preview.lines
  // Когда появляется каждое сообщение и когда перед ним начинает «печатать» бот
  let time = 0.6
  const at = lines.map((l) => {
    const typing = l.from === 'bot' ? time : null
    if (l.from === 'bot') time += TYPING
    const show = time
    time += STEP
    return { typing, show }
  })
  const total = time + HOLD
  const pct = (sec) => ((sec / total) * 100).toFixed(2)
  const keys = at
    .map(
      ({ typing, show }, i) => `
@keyframes m${i}{0%,${pct(show)}%{opacity:0;transform:translateY(8px)}${pct(show + 0.35)}%,94%{opacity:1;transform:none}100%{opacity:0}}
${typing !== null ? `@keyframes d${i}{0%,${pct(typing)}%{opacity:0}${pct(typing + 0.15)}%,${pct(show)}%{opacity:1}${pct(show + 0.05)}%,100%{opacity:0}}` : ''}`,
    )
    .join('')
  const media = (l) => {
    if (l.media === 'photo')
      return `<img src="${photo}" style="display:block;width:50px;height:62px;object-fit:cover;border-radius:6px;margin-bottom:5px"/>`
    if (l.media === 'products')
      return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:6px">${(
        l.items || []
      )
        .slice(0, 3)
        .map(
          (x) =>
            `<div style="border:1px solid ${t.hair};background:${t.bg};padding:4px;font-size:8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"><div style="height:22px;margin-bottom:3px;background:repeating-linear-gradient(135deg,${t.el} 0 3px,${t.hair} 3px 6px)"></div>${esc(x)}<div style="color:${t.live};font-size:7px;letter-spacing:.06em">IN STOCK</div></div>`,
        )
        .join('')}</div>`
    return ''
  }
  const bubbles = lines
    .map((l, i) => {
      const user = l.from === 'user'
      const wide = l.media === 'products'
      const bubble = `<div style="align-self:${user ? 'flex-end' : 'flex-start'};max-width:78%;${wide ? 'width:78%;' : ''}padding:6px 10px;border-radius:${user ? '12px 12px 3px 12px' : '12px 12px 12px 3px'};background:${user ? t.fg : t.bg};color:${user ? t.bg : t.fg};border:1px solid ${user ? 'transparent' : t.hair};font-size:11px;line-height:1.3;animation:m${i} ${total}s infinite both">${media(l)}${esc(l.text)}</div>`
      const dots =
        at[i].typing !== null
          ? `<div style="position:absolute;left:0;top:0;display:flex;gap:3px;padding:9px 10px;border-radius:12px 12px 12px 3px;background:${t.bg};border:1px solid ${t.hair};animation:d${i} ${total}s infinite both">${[
              0, 1, 2,
            ]
              .map(
                (k) =>
                  `<i style="width:4px;height:4px;border-radius:50%;background:${t.fg3};animation:dot .9s ${k * 0.15}s infinite"></i>`,
              )
              .join('')}</div>`
          : ''
      return `<div style="position:relative;display:flex;flex-direction:column">${dots}${bubble}</div>`
    })
    .join('')
  const bot = c.preview.bot || 'bot'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="405" height="391" viewBox="0 0 405 391">
<foreignObject x="0" y="0" width="405" height="391"><div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:405px;height:391px;box-sizing:border-box;background:${t.bg};border:1px solid ${t.hair};color:${t.fg};font-family:Inter,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased">
<style>${keys}
@keyframes dot{50%{transform:translateY(-2px);background:${t.fg}}}
.m{font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${t.fg3}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important}}</style>
<div style="position:absolute;left:18px;top:18px;right:18px;height:261px;box-sizing:border-box;border:1px solid ${t.hair};background:${t.el};display:flex;flex-direction:column">
  <div class="m" style="display:flex;align-items:center;gap:6px;padding:9px 12px;border-bottom:1px solid ${t.hair};text-transform:none;letter-spacing:.02em"><i style="width:12px;height:12px;border-radius:50%;border:1px solid ${t.hover}"></i>${esc(bot)}<i style="width:5px;height:5px;border-radius:50%;background:${t.live};margin-left:4px"></i>online</div>
  <div style="flex:1;display:flex;flex-direction:column;gap:5px;padding:9px 12px;overflow:hidden">${bubbles}</div>
</div>
<div style="position:absolute;left:18px;right:18px;bottom:22px">
  <div class="m" style="display:flex;justify-content:space-between"><span>${pad(c.index)} / ${pad(TOTAL)} · ${esc(c.label)}</span><span>${esc(c.year)}</span></div>
  <div style="font-size:26px;font-weight:450;letter-spacing:-.03em;line-height:1.08;margin-top:12px">${esc(c.title)}</div>
  <div style="font-size:14px;color:${t.fg2};margin-top:4px">${esc(c.tagline)}</div>
</div>
</div></foreignObject></svg>`
}

// ---------- обложки файлов Figma: две лучшие страницы в окнах на ровном тоне ----------

// Короткое имя в углу обложки. Нет в списке — название кейса
const SHORT = {
  'meeting-rooms': 'Бронирование',
  'meg-site': 'MEG',
  'prof-study': 'Профориентация',
}
// Тон фона: проекты ТИТАН-2 — их фирменный синий (снят с их же макетов), остальные — тёплый светлый
const TONES = {
  titan: { bg: '#0a4a9a', fg: '#ffffff', sub: 'rgb(255 255 255 / .6)', bar: '#f4f6fa' },
  base: { bg: '#e9e6df', fg: '#14140f', sub: 'rgb(20 20 15 / .5)', bar: '#f6f5f1' },
}
// Для окон берём экраны сайта целиком: без телефонных коллажей, обложек и «файла в Figma»
const pickShots = (c) =>
  c.shots.filter((s) => !/^(телефон|файл в figma|обложка)/i.test(s.caption)).slice(0, 2)

const figmaCover = (c) => {
  const tone = c.group === 'titan' ? TONES.titan : TONES.base
  const [front, back = front] = pickShots(c)
  // Высота окна — по пропорциям скрина: по ширине он влезает целиком, лишнее уходит за нижний край
  const win = (shot, x, y, w) => `
    <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${Math.round((w * shot.h) / shot.w) + 46}px;background:${tone.bar};border-radius:14px 14px 0 0;overflow:hidden;box-shadow:0 40px 120px rgb(0 0 0 / .28),0 0 0 1px rgb(0 0 0 / .06)">
      <div style="height:46px;display:flex;align-items:center;gap:9px;padding:0 20px">
        <i style="width:12px;height:12px;border-radius:50%;background:rgb(0 0 0 / .13)"></i><i style="width:12px;height:12px;border-radius:50%;background:rgb(0 0 0 / .13)"></i><i style="width:12px;height:12px;border-radius:50%;background:rgb(0 0 0 / .13)"></i>
        <span style="margin:0 auto;width:34%;height:22px;border-radius:11px;background:rgb(0 0 0 / .06)"></span>
      </div>
      <img src="/public${shot.src}" style="display:block;width:100%;height:auto">
    </div>`
  return page(
    { ...THEMES.light, bg: tone.bg, hair: 'transparent' },
    1920,
    1080,
    `
  ${win(back, 820, 170, 1000)}
  ${win(front, 190, 300, 1080)}
  <div style="position:absolute;left:96px;top:78px;right:96px;display:flex;justify-content:space-between;align-items:baseline">
    <span class="h" style="font-size:54px;letter-spacing:-.03em;line-height:1;color:${tone.fg}">${SHORT[c.slug] ?? c.title}</span>
  </div>`,
  )
}

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

// Уменьшенное фото для вложения «photo» в переписке — прямо внутри SVG
let photoData = null
const photo = async () => {
  if (photoData) return photoData
  const p = await browser.newPage()
  await p.goto('http://localhost:8798/public/me/photo.jpg')
  photoData = await p.evaluate(() => {
    const i = document.querySelector('img')
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 160 })
    c.getContext('2d').drawImage(i, 0, 0, 128, 160)
    return c.toDataURL('image/jpeg', 0.8)
  })
  await p.close()
  return photoData
}

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
    await shot(services(t), W, 268, join(PROFILE, `approach-${name}.png`), 2)
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
    await shot(tryCard(t, 'sandbox'), 405, 391, join(PROFILE, `try-sandbox-${name}.png`), 2)
    await shot(tryCard(t, 'brief'), 405, 391, join(PROFILE, `try-brief-${name}.png`), 2)
    await shot(stack(t), W, 200, join(PROFILE, `stack-${name}.png`), 2)
    await shot(contact(t), W, 300, join(PROFILE, `contact-${name}.png`), 2)
    await shot(featured(t, first), W, 598, join(PROFILE, `case-${first.slug}-${name}.png`), 2)
    for (const c of rest) {
      // Кейсы с перепиской — живой чат в SVG, остальные — картинка
      if (c.preview?.kind === 'chat')
        await writeFile(join(PROFILE, `case-${c.slug}-${name}.svg`), chatSvg(t, c, await photo()))
      else await shot(half(t, c), 405, 391, join(PROFILE, `case-${c.slug}-${name}.png`), 2)
    }
  }
}
if (mode === 'figma') {
  const out = join(ROOT, '_shots/figma-covers')
  await mkdir(out, { recursive: true })
  for (const c of cases.filter((c) => pickShots(c).length))
    await shot(figmaCover(c), 1920, 1080, join(out, `${c.slug}.png`))
}
await browser.close()
server.close()
console.log('ok')
