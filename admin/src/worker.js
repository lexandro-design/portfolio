/**
 * Админка сайта-портфолио. Cloudflare Worker: пускает по логину и паролю,
 * читает контент из репозитория и сохраняет правки коммитом в main —
 * дальше сайт пересобирает обычный деплой GitHub Actions.
 *
 * Токен GitHub живёт только здесь, в секретах воркера, до браузера он не доходит.
 * Секреты (wrangler secret put): ADMIN_USER, ADMIN_PASS_HASH, SESSION_SECRET, GITHUB_TOKEN.
 */

/** Файлы контента, которые админка читает и может перезаписать */
const CONTENT = [
  'src/content/data/cases.json',
  'src/content/data/cases-i18n/en.json',
  'src/content/data/cases-i18n/zh.json',
  'src/content/data/cases-i18n/ja.json',
  'src/content/data/dict/ru.json',
  'src/content/data/dict/en.json',
  'src/content/data/dict/zh.json',
  'src/content/data/dict/ja.json',
  'src/content/data/site.json',
]

/** Картинки можно класть только в папки кейсов */
const IMAGE_PATH = /^public\/cases\/[a-z0-9-]+\/[a-z0-9-]+\.(jpg|png|webp)$/
const MAX_IMAGE = 15 * 1024 * 1024
const SESSION_DAYS = 7
const COOKIE = 'admin_session'

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export default {
  async fetch(request, env) {
    try {
      const res = await route(request, env)
      return secure(res)
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500
      if (status === 500) console.error(e)
      return secure(json({ error: e.message || 'Ошибка' }, status))
    }
  },
}

async function route(request, env) {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method

  if (pathname === '/login') {
    if (method === 'POST') return login(request, env)
    return loginPage(url.searchParams.has('error'))
  }
  if (pathname === '/logout' && method === 'POST') {
    return new Response(null, {
      status: 303,
      headers: { Location: '/login', 'Set-Cookie': cookie('', 0) },
    })
  }

  const authed = await readSession(request, env)
  if (!authed) {
    if (pathname.startsWith('/api/')) throw new HttpError(401, 'Нужно войти заново')
    return Response.redirect(new URL('/login', url), 302)
  }

  if (pathname.startsWith('/api/')) {
    if (method !== 'GET') checkSameOrigin(request, url)
    if (pathname === '/api/content' && method === 'GET') return json(await loadContent(env))
    if (pathname === '/api/save' && method === 'POST')
      return json(await save(await request.json(), env))
    if (pathname === '/api/status' && method === 'GET') {
      return json(await deployStatus(env, url.searchParams.get('sha')))
    }
    throw new HttpError(404, 'Нет такого метода')
  }

  return env.ASSETS.fetch(request)
}

/* ---------- вход ---------- */

async function login(request, env) {
  const form = await request.formData()
  const user = String(form.get('user') || '')
  const pass = String(form.get('pass') || '')
  const ok =
    (await safeEqual(user, env.ADMIN_USER)) & (await verifyPassword(pass, env.ADMIN_PASS_HASH))
  if (!ok) {
    // Пауза на каждую неудачу: перебор пароля становится бессмысленно медленным
    await new Promise((r) => setTimeout(r, 1500))
    return new Response(null, { status: 303, headers: { Location: '/login?error' } })
  }
  const exp = Date.now() + SESSION_DAYS * 864e5
  const token = `${exp}.${await sign(`${user}.${exp}`, env)}`
  return new Response(null, {
    status: 303,
    headers: { Location: '/', 'Set-Cookie': cookie(token, SESSION_DAYS * 86400) },
  })
}

async function readSession(request, env) {
  const raw = (request.headers.get('Cookie') || '')
    .split(/;\s*/)
    .find((c) => c.startsWith(`${COOKIE}=`))
  if (!raw) return false
  const [exp, mac] = raw.slice(COOKIE.length + 1).split('.')
  if (!exp || !mac || Number(exp) < Date.now()) return false
  return safeEqual(mac, await sign(`${env.ADMIN_USER}.${exp}`, env))
}

const cookie = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`

/** Подпись сессии. В ключ входит хэш пароля: сменил пароль — все старые входы недействительны */
async function sign(message, env) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc(`${env.SESSION_SECRET}|${env.ADMIN_PASS_HASH}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return b64url(await crypto.subtle.sign('HMAC', key, enc(message)))
}

/** Формат хэша: pbkdf2_sha256$<итерации>$<соль base64>$<хэш base64> — см. scripts/hash-password.mjs */
async function verifyPassword(pass, stored) {
  const [algo, iter, salt, hash] = String(stored || '').split('$')
  if (algo !== 'pbkdf2_sha256' || !hash) return false
  const key = await crypto.subtle.importKey('raw', enc(pass), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(salt), iterations: Number(iter) },
    key,
    256,
  )
  return safeEqual(b64(bits), hash)
}

async function safeEqual(a, b) {
  const [x, y] = await Promise.all(
    [a, String(b ?? '')].map((s) => crypto.subtle.digest('SHA-256', enc(s))),
  )
  return crypto.subtle.timingSafeEqual(x, y)
}

/** Запросы, которые что-то меняют, принимаются только со страницы самой админки */
function checkSameOrigin(request, url) {
  const origin = request.headers.get('Origin')
  if (origin !== url.origin || request.headers.get('X-Admin') !== '1') {
    throw new HttpError(403, 'Запрос не со страницы админки')
  }
}

/* ---------- GitHub ---------- */

async function gh(env, path, init = {}) {
  const api = env.GITHUB_API || 'https://api.github.com'
  const res = await fetch(`${api}/repos/${env.GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'lexandro-portfolio-admin',
      ...(init.body && { 'Content-Type': 'application/json' }),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new HttpError(
      res.status === 409 || res.status === 422 ? 409 : 502,
      `GitHub ${res.status}: ${text.slice(0, 300)}`,
    )
  }
  return res.status === 204 ? null : res.json()
}

const branch = (env) => env.GITHUB_BRANCH || 'main'

async function head(env) {
  const ref = await gh(env, `/git/ref/heads/${branch(env)}`)
  const commit = await gh(env, `/git/commits/${ref.object.sha}`)
  return { sha: ref.object.sha, tree: commit.tree.sha }
}

/** Пути и sha всех файлов из CONTENT на указанном дереве */
async function contentShas(env, tree) {
  const dirs = [...new Set(CONTENT.map((p) => p.slice(0, p.lastIndexOf('/'))))]
  const shas = {}
  const all = await gh(env, `/git/trees/${tree}?recursive=1`)
  for (const item of all.tree) {
    if (item.type === 'blob' && CONTENT.includes(item.path)) shas[item.path] = item.sha
  }
  // Огромное дерево GitHub отдаёт обрезанным — тогда дочитываем только папки контента
  if (all.truncated) {
    for (const dir of dirs) {
      const part = await gh(env, `/contents/${dir}?ref=${tree}`)
      for (const f of part) if (CONTENT.includes(f.path)) shas[f.path] = f.sha
    }
  }
  return shas
}

async function loadContent(env) {
  const { sha } = await head(env)
  const entries = await Promise.all(
    CONTENT.map(async (path) => {
      const file = await gh(env, `/contents/${path}?ref=${sha}`)
      return [path, { sha: file.sha, text: new TextDecoder().decode(fromB64(file.content)) }]
    }),
  )
  return {
    head: sha,
    site: env.SITE_URL,
    repo: env.GITHUB_REPO,
    files: Object.fromEntries(entries),
  }
}

/**
 * Сохранение одним коммитом. base — sha файлов, с которых начиналась правка:
 * если кто-то успел поменять тот же файл (например, пуш с компа), коммит не делаем,
 * чтобы не затереть чужую правку молча
 */
async function save(body, env) {
  const files = Array.isArray(body?.files) ? body.files : []
  if (!files.length) throw new HttpError(400, 'Нечего сохранять')
  const message = String(body.message || 'content: правка из админки').slice(0, 200)

  for (const f of files) {
    if (CONTENT.includes(f.path)) {
      if (typeof f.text !== 'string') throw new HttpError(400, `${f.path}: нет текста`)
      try {
        JSON.parse(f.text)
      } catch {
        throw new HttpError(400, `${f.path}: сломанный JSON`)
      }
    } else if (IMAGE_PATH.test(f.path)) {
      if (typeof f.base64 !== 'string' || f.base64.length * 0.75 > MAX_IMAGE) {
        throw new HttpError(400, `${f.path}: нет картинки или она больше 15 МБ`)
      }
    } else {
      throw new HttpError(400, `${f.path}: сюда админке писать нельзя`)
    }
  }

  for (let attempt = 0; ; attempt++) {
    const base = await head(env)
    const current = await contentShas(env, base.tree)
    const conflicts = files.filter(
      (f) => CONTENT.includes(f.path) && body.base?.[f.path] !== current[f.path],
    )
    if (conflicts.length) {
      throw new HttpError(
        409,
        `Файлы изменились в репозитории после загрузки: ${conflicts.map((f) => f.path.split('/').slice(-2).join('/')).join(', ')}. Обнови страницу, правки придётся повторить.`,
      )
    }

    const tree = await Promise.all(
      files.map(async (f) => {
        const blob = await gh(env, '/git/blobs', {
          method: 'POST',
          body: JSON.stringify(
            f.base64
              ? { content: f.base64, encoding: 'base64' }
              : { content: f.text, encoding: 'utf-8' },
          ),
        })
        return { path: f.path, mode: '100644', type: 'blob', sha: blob.sha }
      }),
    )
    const newTree = await gh(env, '/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: base.tree, tree }),
    })
    const commit = await gh(env, '/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [base.sha] }),
    })
    try {
      await gh(env, `/git/refs/heads/${branch(env)}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
      })
    } catch (e) {
      // main сдвинулся между чтением и записью — пробуем ещё раз поверх нового
      if (e.status === 409 && attempt < 2) continue
      throw e
    }
    const shas = Object.fromEntries(
      tree.filter((t) => CONTENT.includes(t.path)).map((t) => [t.path, t.sha]),
    )
    return { commit: commit.sha, shas }
  }
}

/** Статус деплоя для коммита: собирается, выложен или упал */
async function deployStatus(env, sha) {
  const q = new URLSearchParams({ branch: branch(env), per_page: '10' })
  const { workflow_runs: runs } = await gh(env, `/actions/workflows/deploy.yml/runs?${q}`)
  const run = sha ? runs.find((r) => r.head_sha === sha) : runs[0]
  if (!run) return { state: 'waiting' }
  return {
    state:
      run.status === 'completed' ? (run.conclusion === 'success' ? 'done' : 'failed') : 'building',
    url: run.html_url,
    sha: run.head_sha,
    at: run.updated_at,
  }
}

/* ---------- ответы ---------- */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

function secure(res) {
  const r = new Response(res.body, res)
  r.headers.set('X-Robots-Tag', 'noindex, nofollow')
  r.headers.set('X-Frame-Options', 'DENY')
  r.headers.set('X-Content-Type-Options', 'nosniff')
  r.headers.set('Referrer-Policy', 'no-referrer')
  r.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' blob: data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'",
  )
  if (!r.headers.has('Cache-Control')) r.headers.set('Cache-Control', 'no-store')
  return r
}

function loginPage(error) {
  return new Response(
    `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Вход · админка</title><style>
:root{color-scheme:dark;--bg:#0a0a0a;--card:#121212;--line:rgb(245 245 242 / .08);--text:#f5f5f2;--muted:#a8a8a3;--accent:#dddec7}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--text);font:15px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px}
form{width:100%;max-width:340px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:32px;display:grid;gap:16px}
h1{margin:0 0 8px;font-size:20px;letter-spacing:.02em}label{display:grid;gap:6px;color:var(--muted);font-size:13px}
input{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px;color:var(--text);font:inherit}input:focus{outline:none;border-color:var(--accent)}
button{margin-top:8px;background:var(--text);color:#0a0a0a;border:0;border-radius:10px;padding:12px;font:600 15px system-ui,sans-serif;cursor:pointer}
.err{color:#ff7a7a;font-size:13px;margin:0}</style></head><body>
<form method="post" action="/login"><h1>LEXANDRO · админка</h1>
${error ? '<p class="err">Неверный логин или пароль</p>' : ''}
<label>Логин<input name="user" autocomplete="username" required autofocus></label>
<label>Пароль<input name="pass" type="password" autocomplete="current-password" required></label>
<button>Войти</button></form></body></html>`,
    { status: error ? 401 : 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

/* ---------- кодировки ---------- */

const enc = (s) => new TextEncoder().encode(s)
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const b64url = (buf) => b64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64 = (s) => Uint8Array.from(atob(s.replace(/\s/g, '')), (c) => c.charCodeAt(0))
