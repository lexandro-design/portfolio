/**
 * Функция Vercel. vercel.json переписывает сюда все адреса, исходный путь
 * приходит в параметре __p — возвращаем его на место и отдаём в lib/admin.js
 */
import { readFile } from 'node:fs/promises'
import { handle } from '../lib/admin.js'

const TYPES = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
}

/**
 * Файлы интерфейса лежат в app/ (не в public/, иначе Vercel раздал бы их без входа).
 * Пути — литералами от этого файла: так сборщик Vercel видит их и кладёт рядом с функцией,
 * а на сервере они находятся независимо от рабочей папки (у Vercel это корень репо, не admin/)
 */
const FILES = {
  'index.html': new URL('../app/index.html', import.meta.url),
  'app.js': new URL('../app/app.js', import.meta.url),
  'app.css': new URL('../app/app.css', import.meta.url),
}

export async function asset(name) {
  const body = await readFile(FILES[name])
  return new Response(body, { headers: { 'Content-Type': TYPES[name.split('.').pop()] } })
}

async function run(request) {
  const url = new URL(request.url)
  const original = url.searchParams.get('__p')
  // Без __p: либо Vercel сохранил исходный адрес сам, либо это прямой заход на /api — тогда это главная
  if (original === null && url.pathname === '/api') url.searchParams.set('__p', '/')
  if (url.searchParams.has('__p')) {
    url.pathname = url.searchParams.get('__p')
    url.searchParams.delete('__p')
    request = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
    })
  }
  return handle(request, process.env, asset)
}

export const GET = run
export const POST = run
