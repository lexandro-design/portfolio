// Раскладывает готовые наборы Behance по папкам для загрузки: в каждой картинки, видео
// и behance.txt с названием, тегами, категориями, описанием и настройками проекта.
// Папки пронумерованы в порядке публикации: Behance ставит новый проект первым,
// поэтому публиковать с 01 по порядку, самый сильный проект идёт последним и встанет наверх.
//   node tools/behance/pack.mjs   → _shots/behance/_upload/
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const SRC = join(ROOT, '_shots/behance')
const OUT = join(SRC, '_upload')
const FFMPEG = process.env.FFMPEG || 'ffmpeg'
const meta = JSON.parse(await readFile(join(ROOT, 'tools/behance/publish.json'), 'utf8'))

// Порядок публикации: слабее первыми, сильнее последними (окажутся вверху профиля)
const ORDER = [
  'tetrasis',
  'svarprom-nn',
  'svarnoy52',
  'prof-study',
  'vacation-plan',
  'ubiray-rf',
  'reckon',
  'portfolio-site',
  'meg-site',
  'pix-bi',
  'otrx',
  'ai-translator',
  'lotus',
  'osq',
  'meeting-rooms',
  'parfumeria',
]

/** Цвет фона проекта: пиксель в углу текстового блока */
const bgOf = (file) => {
  const buf = execFileSync(FFMPEG, [
    ...['-loglevel', 'error', '-i', file, '-vf', 'crop=2:2:4:4', '-f', 'rawvideo'],
    ...['-pix_fmt', 'rgb24', '-'],
  ])
  const rgb = [...buf.subarray(0, 3)]
  // JPEG сдвигает цвет на единицу-две: цвета тем из render.mjs подставляем точно
  const exact = ['#e9e6df', '#111113', '#edf1f7'].find((hex) =>
    [1, 3, 5].every((k, i) => Math.abs(parseInt(hex.slice(k, k + 2), 16) - rgb[i]) <= 3),
  )
  return exact ?? `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })
const summary = []
for (const [i, slug] of ORDER.entries()) {
  const files = (await readdir(join(SRC, slug)).catch(() => [])).sort()
  if (!files.length) continue
  const m = meta[slug]
  const dir = join(OUT, `${String(i + 1).padStart(2, '0')}-${slug}`)
  await mkdir(dir)
  for (const f of files) await copyFile(join(SRC, slug, f), join(dir, f))
  const text = files.find((f) => f.endsWith('-text.jpg'))
  const bg = bgOf(join(SRC, slug, text ?? files.find((f) => f.endsWith('-thanks.jpg'))))
  // В проект: всё, кроме обложки; из видео — GIF (MP4 запасной, если Behance примет видео)
  const blocks = files.filter((f) => !f.includes('cover') && !f.endsWith('.mp4'))
  const txt = [
    `НАЗВАНИЕ\n${m.title}`,
    `ОПИСАНИЕ\n${m.description}`,
    `ТЕГИ (по одному, Enter после каждого)\n${m.tags.join(', ')}`,
    `КАТЕГОРИИ\n${m.fields.join(', ')}`,
    `ИНСТРУМЕНТЫ\n${m.tools.join(', ')}`,
    `ОБЛОЖКА\n01-cover.jpg — только в окне публикации, в сам проект не ставить`,
    `СТИЛИ ПРОЕКТА\nЦвет фона: ${bg}\nИнтервал между блоками: 0`,
    `БЛОКИ ПО ПОРЯДКУ (Изображение → выбрать все разом)\n${blocks.join('\n')}`,
    `ВИДЕО\nGIF ставятся как картинки. Если в «Видео и аудио» Behance примет MP4 — можно вместо GIF, так чётче.`,
  ].join('\n\n')
  await writeFile(join(dir, 'behance.txt'), `${txt}\n`)
  const size = (await Promise.all(files.map((f) => stat(join(SRC, slug, f))))).reduce(
    (s, x) => s + x.size,
    0,
  )
  summary.push({ n: i + 1, slug, bg, size: Math.round(size / 1e6), ...m, blocks })
}
await writeFile(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2))
console.log(summary.map((s) => `${s.n} ${s.slug} ${s.bg} ${s.size}MB`).join('\n'))
