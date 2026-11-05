// Next 16 при output: export кладёт данные для подгрузки страниц в папки
// (cases/osq/__next.cases/$d$slug/__PAGE__.txt), а браузер просит их одним именем
// (cases/osq/__next.cases.$d$slug.__PAGE__.txt). На Pages это 404 в консоли на каждой
// странице и переход без заранее подгруженных данных. Кладём копии под плоским именем
import { copyFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

let made = 0

async function flatten(dir, prefix, target) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const name = `${prefix}.${e.name}`
    if (e.isDirectory()) await flatten(join(dir, e.name), name, target)
    else {
      await copyFile(join(dir, e.name), join(target, name))
      made += 1
    }
  }
}

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === '_next') continue
    const path = join(dir, e.name)
    if (e.name.startsWith('__next.')) await flatten(path, e.name, dir)
    else await walk(path)
  }
}

await walk('out')
console.log(`Данные страниц: ${made} файлов под плоским именем`)
