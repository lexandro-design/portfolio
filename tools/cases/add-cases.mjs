// Новые кейсы из папки материалов: тексты (ru + en/zh/ja) и картинки/анимации
// раскладываются в src/content/data/cases.json, cases-i18n/*.json и public/cases/<slug>/.
// Кейс без файла текста не заводится: тексты пишет контент, здесь их не придумываем.
//
//   node tools/cases/add-cases.mjs [slug…]          все готовые тексты или выбранные
//   MEDIA=D:\папка node tools/cases/add-cases.mjs   другая папка материалов
//
// Папка материалов (по умолчанию C:\Users\alexs\dev\media\portfolio-2026-11):
//   texts/<slug>.json   текст кейса, форма — web/templates/<slug>.json там же
//   <путь из shots[].file>  PNG/JPG (режется в JPG шириной 1600) или GIF/MP4 (петля MP4 + первый кадр)
// Повторный запуск того же slug перезаписывает кейс на его месте в списке.
// После — node tools/cards/covers.mjs (обложки кейсов со скринами) и node tools/check-content.mjs.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const MEDIA = process.env.MEDIA ?? 'C:\\Users\\alexs\\dev\\media\\portfolio-2026-11'
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const DATA = join(ROOT, 'src/content/data')
const LOCALES = ['en', 'zh', 'ja']
const MAX_W = 1600

// Правила подачи портфолио: этих слов в публичных текстах быть не должно
const STOP = [/claude/i, /anthropic/i, /\bn8n\b/i, /codex/i, /chatgpt/i, /plugin api/i, /scripter/i, /промпт/i, /prompt/i]

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const writeJson = (p, d) => writeFileSync(p, JSON.stringify(d, null, 2) + '\n')
const ff = (...args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: 'inherit' })
const probe = (file) => {
  const out = execFileSync(FFMPEG.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1'), [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file,
  ]).toString()
  const [w, h] = out.trim().split('\n')[0].split(',').map(Number)
  return { w, h }
}

/** Картинка → NN.jpg, анимация → NN.mp4 + NN.jpg (первый кадр). Возвращает поля Shot */
function media(slug, n, file) {
  const src = join(MEDIA, file)
  if (!existsSync(src)) throw new Error(`${slug}: нет файла ${src}`)
  const dir = join(ROOT, 'public/cases', slug)
  mkdirSync(dir, { recursive: true })
  const name = String(n).padStart(2, '0')
  const scale = `scale='min(${MAX_W},iw)':-2:flags=lanczos`
  const ext = extname(file).toLowerCase()
  if (ext === '.gif' || ext === '.mp4' || ext === '.webm' || ext === '.mov') {
    const mp4 = join(dir, `${name}.mp4`)
    ff('-i', src, '-an', '-vf', `${scale},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-movflags', '+faststart', mp4)
    ff('-i', mp4, '-vf', 'select=eq(n\\,0)', '-frames:v', '1', '-q:v', '3', join(dir, `${name}.jpg`))
    return { src: `/cases/${slug}/${name}.jpg`, video: `/cases/${slug}/${name}.mp4`, ...probe(mp4) }
  }
  const jpg = join(dir, `${name}.jpg`)
  ff('-i', src, '-vf', scale, '-q:v', '3', jpg)
  return { src: `/cases/${slug}/${name}.jpg`, ...probe(jpg) }
}

/** Проверяются только публичные поля: подсказки для автора (_facts и т. п.) на сайт не идут */
function lint(slug, t) {
  const text = JSON.stringify([t.ru, ...LOCALES.map((l) => t[l]), t.stack, (t.shots ?? []).map((s) => [s.caption, s.captions])])
  const hits = STOP.filter((r) => r.test(text)).map(String)
  if (hits.length) throw new Error(`${slug}: в тексте запрещённое по правилам подачи: ${hits.join(', ')}`)
}

const textsDir = join(MEDIA, 'texts')
const wanted = process.argv.slice(2)
const files = existsSync(textsDir) ? readdirSync(textsDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')) : []
const todo = files.map((f) => f.replace(/\.json$/, '')).filter((s) => !wanted.length || wanted.includes(s))
for (const s of wanted) if (!todo.includes(s)) console.log(`нет текста: texts/${s}.json — кейс не заводится`)
if (!todo.length) {
  console.log(`Готовых текстов нет в ${textsDir}. Форма текста — web/templates/*.json в папке материалов.`)
  process.exit(0)
}

const cases = readJson(join(DATA, 'cases.json'))
const i18n = Object.fromEntries(LOCALES.map((l) => [l, readJson(join(DATA, `cases-i18n/${l}.json`))]))

for (const slug of todo) {
  const t = readJson(join(textsDir, `${slug}.json`))
  if (t.slug !== slug) throw new Error(`${slug}: slug внутри файла — ${t.slug}`)
  lint(slug, t)
  for (const l of ['ru', ...LOCALES]) {
    const c = t[l]
    const empty = !c ? ['весь'] : ['tagline', 'lead', 'client'].filter((k) => !c[k]?.trim())
    if (l === 'ru' && c && !c.title?.trim()) empty.push('title')
    if (c?.sections?.some((s) => !s.title?.trim() || !s.body?.every((p) => p.trim()))) empty.push('sections')
    if (empty.length) throw new Error(`${slug}: текст ${l} не заполнен (${empty.join(', ')})`)
  }

  // keepShots — у кейса, который уже на сайте, меняется только текст (так дополняется Parfumeria)
  const old = cases.find((c) => c.slug === slug)
  if (t.keepShots && !old) throw new Error(`${slug}: keepShots, но такого кейса на сайте нет`)
  const shots = t.keepShots
    ? old.shots
    : (t.shots ?? []).map((s, i) => ({ ...media(slug, i + 1, s.file), caption: s.caption }))
  // Порядок ключей как у остальных кейсов в cases.json
  const item = {
    slug,
    title: t.ru.title,
    tagline: t.ru.tagline,
    lead: t.ru.lead,
    directions: t.directions,
    label: t.label,
    group: t.group,
    client: t.ru.client,
    year: t.year,
    stack: t.stack,
    sections: t.ru.sections,
    shots: shots.map(({ src, video, caption, w, h }) => ({ src, ...(video ? { video } : {}), caption, w, h })),
    ...(shots.length ? {
      thumb: old?.thumb ?? { src: `/cases/${slug}/thumb.jpg`, caption: '', w: 1216, h: 860 },
      cover: old?.cover ?? { src: `/cases/${slug}/cover.jpg`, caption: '', w: 2624, h: 1280 },
    } : {}),
    ...(t.ru.preview ? { preview: t.ru.preview } : {}),
    ...(t.minor ? { minor: true } : {}),
    ...(t.ru.note ? { note: t.ru.note } : {}),
    ...((t.link ?? old?.link) ? { link: t.link ?? old.link } : {}),
  }

  if (old?.credit) item.credit = old.credit
  const at = cases.findIndex((c) => c.slug === slug)
  if (at >= 0) cases[at] = item
  else {
    // Новый кейс: после указанного в after, иначе перед мелкими автоматизациями
    const after = t.after ? cases.findIndex((c) => c.slug === t.after) : -1
    const firstMinor = cases.findIndex((c) => c.minor)
    cases.splice(after >= 0 ? after + 1 : firstMinor >= 0 ? firstMinor : cases.length, 0, item)
  }
  for (const l of LOCALES) {
    const c = t[l]
    i18n[l][slug] = {
      ...(c.title ? { title: c.title } : {}),
      tagline: c.tagline,
      lead: c.lead,
      client: c.client,
      sections: c.sections,
      captions: t.keepShots
        ? i18n[l][slug]?.captions ?? shots.map((s) => s.caption)
        : (t.shots ?? []).map((s) => s.captions?.[l] ?? s.caption),
      ...(c.note ? { note: c.note } : {}),
      ...(c.preview ? { preview: c.preview } : {}),
    }
  }
  console.log(`${slug}: ${at >= 0 ? 'обновлён' : 'добавлен'}, скринов ${shots.length}${shots.some((s) => s.video) ? ' (есть анимация)' : ''}`)
}

writeJson(join(DATA, 'cases.json'), cases)
for (const l of LOCALES) writeJson(join(DATA, `cases-i18n/${l}.json`), i18n[l])
console.log('Дальше: node tools/cards/covers.mjs (если у новых кейсов есть скрины), node tools/check-content.mjs')
