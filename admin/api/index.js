/**
 * Функция Vercel. vercel.json переписывает сюда все адреса, исходный путь
 * приходит в параметре __p — возвращаем его на место и отдаём в lib/admin.js
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { handle } from '../lib/admin.js'

const TYPES = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
}

/** Файлы интерфейса лежат в app/ (не в public/, иначе Vercel раздал бы их без входа) */
export async function asset(name) {
  const body = await readFile(join(process.cwd(), 'app', name))
  return new Response(body, { headers: { 'Content-Type': TYPES[name.split('.').pop()] } })
}

async function run(request) {
  const url = new URL(request.url)
  const original = url.searchParams.get('__p')
  if (original !== null) {
    url.pathname = original
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
