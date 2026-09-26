// Проверка src/content/data перед сборкой. JSON правится руками и из админки,
// а TypeScript его формы не проверяет (данные приводятся через `as`), поэтому
// сломанная правка должна валить деплой здесь, пока на сайте остаётся старая версия.
// Запуск: node tools/check-content.mjs
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (p) => JSON.parse(readFileSync(new URL(`src/content/data/${p}`, root), 'utf8'))
const errors = []
const fail = (where, msg) => errors.push(`${where}: ${msg}`)

const LOCALES = ['en', 'zh', 'ja']
const DIRECTIONS = ['design', 'web', 'ai']
const GROUPS = ['titan', 'entersales', 'freelance', 'own']
const PREVIEWS = ['flow', 'chat', 'inbox', 'search']

const type = (v) => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v)
const str = (v) => typeof v === 'string'
const strs = (v) => Array.isArray(v) && v.every(str)

/** Словари других языков должны повторять форму русского: те же ключи и типы */
function sameShape(ref, val, where) {
  if (type(ref) !== type(val)) return fail(where, `ожидался ${type(ref)}, а тут ${type(val)}`)
  if (Array.isArray(ref)) {
    if (!ref.length) return
    val.forEach((item, i) => sameShape(ref[0], item, `${where}[${i}]`))
  } else if (type(ref) === 'object') {
    for (const k of Object.keys(ref)) {
      if (!(k in val)) fail(where, `нет ключа «${k}»`)
      else sameShape(ref[k], val[k], `${where}.${k}`)
    }
    for (const k of Object.keys(val)) if (!(k in ref)) fail(where, `лишний ключ «${k}»`)
  }
}

function checkShot(s, where) {
  if (!s || !str(s.src) || typeof s.w !== 'number' || typeof s.h !== 'number') {
    return fail(where, 'у скриншота нужны src, w и h')
  }
  for (const src of [s.src, s.dark].filter(Boolean)) {
    if (!existsSync(new URL(`public${src}`, root))) fail(where, `нет файла public${src}`)
  }
}

function checkSections(sections, where) {
  if (!Array.isArray(sections)) return fail(where, 'sections должен быть списком')
  sections.forEach((s, i) => {
    if (!str(s?.title) || !strs(s?.body)) fail(`${where}[${i}]`, 'у раздела нужны title и body')
  })
}

function checkPreview(p, where) {
  if (p === undefined) return
  if (!PREVIEWS.includes(p?.kind)) return fail(where, `kind должен быть одним из ${PREVIEWS}`)
  if (p.kind === 'flow' && !strs(p.steps)) fail(where, 'steps — список строк')
  if (
    p.kind === 'chat' &&
    !p.lines?.every((l) => ['user', 'bot'].includes(l.from) && str(l.text))
  ) {
    fail(where, 'в lines у каждой реплики нужны from (user/bot) и text')
  }
  if (p.kind === 'inbox' && (!strs(p.columns) || !Array.isArray(p.mails))) {
    fail(where, 'нужны columns и mails')
  }
  if (p.kind === 'search' && (!str(p.query) || !strs(p.results)))
    fail(where, 'нужны query и results')
}

// Словари
const ru = read('dict/ru.json')
for (const l of LOCALES) sameShape(ru, read(`dict/${l}.json`), `dict/${l}`)

// Кейсы
const cases = read('cases.json')
const slugs = new Set()
cases.forEach((c, i) => {
  const at = `cases[${i}]${c?.slug ? ` (${c.slug})` : ''}`
  for (const k of ['slug', 'title', 'tagline', 'lead', 'label', 'client', 'year']) {
    if (!str(c[k]) || !c[k].trim()) fail(at, `пустое поле ${k}`)
  }
  if (str(c.slug) && !/^[a-z0-9-]+$/.test(c.slug)) fail(at, 'slug — только a-z, 0-9 и дефис')
  if (slugs.has(c.slug)) fail(at, `slug «${c.slug}» повторяется`)
  slugs.add(c.slug)
  if (
    !Array.isArray(c.directions) ||
    !c.directions.length ||
    !c.directions.every((d) => DIRECTIONS.includes(d))
  ) {
    fail(at, `directions — непустой список из ${DIRECTIONS}`)
  }
  if (!GROUPS.includes(c.group)) fail(at, `group должен быть одним из ${GROUPS}`)
  if (!strs(c.stack)) fail(at, 'stack — список строк')
  checkSections(c.sections, `${at}.sections`)
  if (!Array.isArray(c.shots)) fail(at, 'shots должен быть списком')
  else c.shots.forEach((s, j) => checkShot(s, `${at}.shots[${j}]`))
  if (c.thumb) checkShot(c.thumb, `${at}.thumb`)
  if (c.cover) checkShot(c.cover, `${at}.cover`)
  checkPreview(c.preview, `${at}.preview`)
  if (c.link && (!str(c.link.href) || !str(c.link.label))) fail(at, 'у link нужны href и label')
  if (c.credit && (!str(c.credit.href) || !str(c.credit.handle)))
    fail(at, 'у credit нужны href и handle')
})

// Переводы кейсов
for (const l of LOCALES) {
  for (const [slug, t] of Object.entries(read(`cases-i18n/${l}.json`))) {
    const at = `cases-i18n/${l}.${slug}`
    if (!slugs.has(slug)) fail(at, 'такого кейса нет в cases.json')
    for (const k of ['tagline', 'lead', 'client']) if (!str(t[k])) fail(at, `нет поля ${k}`)
    checkSections(t.sections, `${at}.sections`)
    if (!strs(t.captions)) fail(at, 'captions — список строк')
    checkPreview(t.preview, `${at}.preview`)
  }
}

// Контакты
const site = read('site.json')
for (const k of ['email', 'telegram', 'telegramHandle', 'github']) {
  if (!str(site.contacts?.[k])) fail('site.contacts', `нет поля ${k}`)
}
if (!str(site.coords)) fail('site', 'нет поля coords')

if (errors.length) {
  console.error(`Контент не прошёл проверку (${errors.length}):\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`Контент в порядке: ${cases.length} кейсов, ${LOCALES.length + 1} языка`)
