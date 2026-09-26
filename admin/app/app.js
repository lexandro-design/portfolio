/**
 * Интерфейс админки. Без сборки и зависимостей: грузит JSON контента через
 * воркер, правит его в памяти и отправляет изменённые файлы одним коммитом.
 */

const P = {
  cases: 'src/content/data/cases.json',
  site: 'src/content/data/site.json',
  dict: (l) => `src/content/data/dict/${l}.json`,
  copy: (l) => `src/content/data/cases-i18n/${l}.json`,
}
const LOCALES = [
  ['ru', 'RU'],
  ['en', 'EN'],
  ['zh', '中文'],
  ['ja', '日本語'],
]
const TRANSLATED = ['en', 'zh', 'ja']
const TABS = [
  ['cases', 'Кейсы'],
  ['dict', 'Тексты сайта'],
  ['site', 'Контакты'],
]
const DIRECTIONS = [
  ['design', 'дизайн'],
  ['web', 'сайты'],
  ['ai', 'AI и автоматизация'],
]
const GROUPS = [
  ['titan', 'ТИТАН-2'],
  ['entersales', 'Интерсейлс'],
  ['freelance', 'фриланс'],
  ['own', 'свой продукт'],
]
const PREVIEW_TEMPLATES = {
  flow: { kind: 'flow', steps: ['', ''] },
  chat: {
    kind: 'chat',
    lines: [
      { from: 'user', text: '' },
      { from: 'bot', text: '' },
    ],
  },
  inbox: { kind: 'inbox', columns: [''], mails: [{ text: '', to: 0 }] },
  search: { kind: 'search', query: '', results: [''] },
}
/** Подписи разделов словаря — ключи те же, что в src/i18n/dict/types.ts */
const DICT_LABELS = {
  meta: 'SEO и заголовок вкладки',
  nav: 'Меню',
  hero: 'Первый экран',
  sections: 'Заголовки секций',
  services: 'Услуги',
  servicesMore: 'Ссылка под услугами',
  works: 'Кейсы на главной',
  system: 'Блок «Система»',
  process: 'Процесс',
  about: 'Обо мне',
  principles: 'Принципы',
  contact: 'Контакты',
  footer: 'Подвал',
  case: 'Страница кейса',
}
/** Человеческие подписи частых ключей; ключ остаётся рядом, чтобы найти его в коде */
const KEY_LABELS = {
  title: 'заголовок',
  text: 'текст',
  body: 'текст',
  lead: 'лид',
  label: 'метка',
  aside: 'пояснение справа',
  description: 'описание',
  tags: 'теги',
  price: 'цена',
  code: 'код',
  filter: 'фильтр кейсов: design, web или ai',
  steps: 'шаги',
  timeline: 'хронология',
  when: 'когда',
  metaLeft: 'строки над заголовком',
  accent: 'строки вторым цветом',
  primary: 'главная кнопка',
  secondary: 'вторая кнопка',
  ticker: 'подпись бегущей строки',
  tickerItems: 'бегущая строка',
  photoAlt: 'alt фото',
  photoCaption: 'подпись фото',
  caseTitle: 'заголовок вкладки кейса',
  status: 'статус',
  query: 'запрос',
  results: 'результаты',
  lines: 'реплики',
  columns: 'колонки',
  mails: 'письма',
  from: 'кто: user или bot',
  media: 'вложение: photo, products, booking, drawing',
  items: 'подписи вложения',
  to: 'номер колонки',
}
const nice = (k) => (k == null ? k : KEY_LABELS[k] ? `${KEY_LABELS[k]} · ${k}` : String(k))

/** Короткие списки, которые удобнее править метками: стек, теги, бегущая строка */
const CHIP_KEYS = new Set(['stack', 'tags', 'tickerItems'])

/** Поля, которые лучше редактировать многострочно */
const LONG = /^(lead|body|text|description|intro|aside|note|motionNote)$/

const state = {
  files: {}, // path → { sha, text } — как лежит в репозитории
  data: {}, // path → разобранный JSON, который правим
  uploads: {}, // 'public/cases/…' → { base64, url } — картинки, ждущие сохранения
  fresh: {}, // '/cases/…' → blob-url загруженной картинки, пока сайт не пересобрался
  site: '',
  tab: 'cases',
  locale: 'ru',
  caseIdx: 0,
  commit: null,
  saving: false,
}

/* ---------- утилиты ---------- */

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v)
    else if (k === 'class') el.className = v
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v)
    else if (k in el && typeof v !== 'string') el[k] = v
    else el.setAttribute(k, v === true ? '' : v)
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue
    el.append(c instanceof Node ? c : document.createTextNode(String(c)))
  }
  return el
}

const $ = (id) => document.getElementById(id)
const clone = (v) => structuredClone(v)
const serialize = (v) => JSON.stringify(v, null, 2) + '\n'
const isShot = (v) => v && typeof v === 'object' && 'src' in v && 'w' in v && 'h' in v

/** Ключи-переключатели: в пустой копии сохраняем значение, иначе ломается превью */
const KEEP = new Set(['kind', 'from', 'media', 'filter'])

/** Пустая копия по образцу: строки пустые, списки из одного пустого элемента */
function blank(v) {
  if (typeof v === 'string') return ''
  if (typeof v === 'number') return 0
  if (typeof v === 'boolean') return false
  if (Array.isArray(v)) return v.length ? [blank(v[0])] : []
  if (v && typeof v === 'object') {
    if (isShot(v)) return null
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, KEEP.has(k) ? x : blank(x)]))
  }
  return ''
}

function toast(text, error = false, ms = 4000) {
  const t = $('toast')
  t.textContent = text
  t.className = `toast${error ? ' error' : ''}`
  t.hidden = false
  clearTimeout(toast.timer)
  if (ms) toast.timer = setTimeout(() => (t.hidden = true), ms)
}

async function api(path, init = {}) {
  const request = () =>
    fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'X-Admin': '1', ...init.headers },
    })
  // Чтение безопасно повторить: связь у провайдера иногда моргает
  const res = await request().catch((e) => {
    if (init.method && init.method !== 'GET') throw e
    return new Promise((r) => setTimeout(r, 1200)).then(request)
  })
  if (res.status === 401) {
    location.href = '/login'
    throw new Error('Нужно войти заново')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`)
  return data
}

const imgUrl = (src) => (src ? state.fresh[src] || state.site + src : '')

/* ---------- изменения и сохранение ---------- */

function dirtyPaths() {
  return Object.keys(state.data).filter((p) => serialize(state.data[p]) !== state.files[p].text)
}

function refreshDirty() {
  const n = dirtyPaths().length + Object.keys(state.uploads).length
  const btn = $('save')
  btn.disabled = !n || state.saving
  btn.textContent = state.saving ? 'Сохраняю…' : n ? `Сохранить · ${n}` : 'Сохранить'
  $('discard').hidden = !n || state.saving
  if (n && !state.saving && !state.watching) setStatus('dirty', 'есть несохранённые правки')
  else if (!n && !state.watching && $('status').dataset.state === 'dirty') setStatus('', '')
  renderSideFlags()
}

function setStatus(stateName, text, url) {
  const s = $('status')
  s.dataset.state = stateName
  s.textContent = text
  if (url) s.href = url
  else s.removeAttribute('href')
}

/** Проверка перед сохранением — повторяет главное из tools/check-content.mjs */
function validate() {
  const errors = []
  const warnings = []
  const cases = state.data[P.cases]
  const slugs = new Set()
  cases.forEach((c, i) => {
    const name = c.title || `кейс №${i + 1}`
    for (const [k, label] of [
      ['slug', 'адрес'],
      ['title', 'название'],
      ['tagline', 'подзаголовок'],
      ['lead', 'лид'],
      ['label', 'метка'],
      ['client', 'клиент'],
      ['year', 'год'],
    ]) {
      if (!String(c[k] ?? '').trim()) errors.push(`${name}: пустое поле «${label}»`)
    }
    if (c.slug && !/^[a-z0-9-]+$/.test(c.slug))
      errors.push(`${name}: адрес — только a-z, 0-9 и дефис`)
    if (slugs.has(c.slug)) errors.push(`${name}: адрес «${c.slug}» уже занят`)
    slugs.add(c.slug)
    if (!c.directions?.length) errors.push(`${name}: не выбрано направление`)
    c.shots.forEach((s, j) => {
      if (!s.src) errors.push(`${name}: у скриншота №${j + 1} нет картинки`)
    })
    c.sections.forEach((s, j) => {
      if (!s.title.trim() && s.body.every((b) => !b.trim())) {
        warnings.push(`${name}: пустой раздел №${j + 1}`)
      }
    })
  })
  for (const l of TRANSLATED) {
    for (const [slug, t] of Object.entries(state.data[P.copy(l)])) {
      for (const k of ['tagline', 'lead', 'client']) {
        if (!t[k]?.trim()) warnings.push(`${l.toUpperCase()} · ${slug}: пустое поле ${k}`)
      }
    }
  }
  cases.forEach((c) => previewProblems(c.preview, c.title || c.slug, errors))
  for (const l of TRANSLATED) {
    for (const [slug, t] of Object.entries(state.data[P.copy(l)])) {
      previewProblems(t.preview, `${l.toUpperCase()} · ${slug}`, errors)
    }
    shapeProblems(
      state.data[P.dict('ru')],
      state.data[P.dict(l)],
      `тексты ${l.toUpperCase()}`,
      errors,
    )
  }
  return { errors, warnings }
}

/** Превью — то же, что проверяет сборка: иначе сохранится, но сайт не соберётся */
function previewProblems(p, name, errors) {
  if (!p) return
  if (!PREVIEW_TEMPLATES[p.kind]) return errors.push(`${name}: неизвестный вид превью`)
  if (p.kind === 'chat') {
    if (!p.lines?.length) errors.push(`${name}: в переписке нет сообщений`)
    p.lines?.forEach((l, i) => {
      if (!['user', 'bot'].includes(l.from)) {
        errors.push(`${name}: сообщение №${i + 1} — выбери, кто пишет (пользователь или бот)`)
      }
      if (!l.text?.trim() && !l.media) errors.push(`${name}: сообщение №${i + 1} пустое`)
      if (l.media === 'products' && !l.items?.some((x) => x.trim())) {
        errors.push(`${name}: сообщение №${i + 1} — добавь товары в карточки`)
      }
    })
  }
  if (p.kind === 'flow' && !p.steps?.some((x) => x.trim()))
    errors.push(`${name}: в цепочке нет шагов`)
}

/** Словари других языков должны повторять форму русского — как в tools/check-content.mjs */
function shapeProblems(ref, val, where, errors) {
  const type = (v) => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v)
  if (type(ref) !== type(val)) return errors.push(`${where}: не тот тип значения`)
  if (Array.isArray(ref)) {
    if (ref.length) val.forEach((x, i) => shapeProblems(ref[0], x, `${where}[${i + 1}]`, errors))
  } else if (type(ref) === 'object') {
    for (const k of Object.keys(ref)) {
      if (!(k in val)) errors.push(`${where}: нет поля ${k}`)
      else shapeProblems(ref[k], val[k], `${where}.${k}`, errors)
    }
  }
}

function commitMessage(paths) {
  const parts = []
  for (const p of paths) {
    if (p === P.cases) {
      const before = JSON.parse(state.files[p].text)
      const byslug = Object.fromEntries(before.map((c) => [c.slug, JSON.stringify(c)]))
      const changed = state.data[p]
        .filter((c) => byslug[c.slug] !== JSON.stringify(c))
        .map((c) => c.slug)
      const removed = before
        .filter((c) => !state.data[p].some((x) => x.slug === c.slug))
        .map((c) => `−${c.slug}`)
      const list = [...changed, ...removed]
      parts.push(
        list.length
          ? `кейсы (${list.slice(0, 4).join(', ')}${list.length > 4 ? '…' : ''})`
          : 'порядок кейсов',
      )
    } else if (p === P.site) parts.push('контакты')
    else {
      const [, kind, l] = p.match(/(cases-i18n|dict)\/(\w+)\.json$/)
      parts.push(`${kind === 'dict' ? 'тексты' : 'переводы кейсов'} ${l}`)
    }
  }
  if (Object.keys(state.uploads).length)
    parts.push(`картинки: ${Object.keys(state.uploads).length}`)
  return `content: ${parts.join(', ')}`
}

async function save() {
  if (state.saving) return
  const paths = dirtyPaths()
  if (!paths.length && !Object.keys(state.uploads).length) return
  const { errors, warnings } = validate()
  if (errors.length)
    return toast(`Не сохранил, поправь:\n• ${errors.slice(0, 8).join('\n• ')}`, true, 9000)
  if (
    warnings.length &&
    !confirm(`Есть пустые места:\n• ${warnings.slice(0, 10).join('\n• ')}\n\nСохранить всё равно?`)
  ) {
    return
  }

  state.saving = true
  refreshDirty()
  try {
    // Картинки — по одной отдельными запросами (у функции потолок 4,5 МБ на запрос), в коммит идут их sha
    const images = []
    for (const [path, u] of Object.entries(state.uploads)) {
      u.blob ??= (
        await api('/api/blob', { method: 'POST', body: JSON.stringify({ base64: u.base64 }) })
      ).sha
      images.push({ path, blob: u.blob })
    }
    const files = [...paths.map((path) => ({ path, text: serialize(state.data[path]) })), ...images]
    const base = Object.fromEntries(paths.map((p) => [p, state.files[p].sha]))
    const res = await api('/api/save', {
      method: 'POST',
      body: JSON.stringify({ files, base, message: commitMessage(paths) }),
    })
    for (const p of paths) state.files[p] = { sha: res.shas[p], text: serialize(state.data[p]) }
    state.uploads = {}
    toast('Сохранено. Сайт пересобирается — обычно пара минут.')
    watchDeploy(res.commit)
  } catch (e) {
    // Связь оборвалась: коммит мог дойти, а ответ — потеряться. Смотрим, что теперь в репозитории
    if (e instanceof TypeError) await reconcile(paths)
    else toast(e.message, true, 12000)
  } finally {
    state.saving = false
    refreshDirty()
  }
}

async function reconcile(paths) {
  toast('Связь оборвалась — проверяю, дошло ли сохранение…', false, 0)
  try {
    const res = await api('/api/content')
    const saved = paths.every((p) => res.files[p]?.text === serialize(state.data[p]))
    if (!saved) {
      return toast('Связь оборвалась, не сохранилось. Нажми «Сохранить» ещё раз.', true, 12000)
    }
    for (const p of paths) state.files[p] = res.files[p]
    state.uploads = {}
    toast('Сохранено (связь моргнула, но коммит дошёл). Сайт пересобирается.')
    watchDeploy(res.head)
  } catch {
    toast('Нет связи с админкой. Проверь интернет и нажми «Сохранить» ещё раз.', true, 12000)
  }
}

function discard() {
  if (!confirm('Сбросить все несохранённые правки? Вернётся то, что сейчас в репозитории.')) return
  for (const p of Object.keys(state.data)) state.data[p] = JSON.parse(state.files[p].text)
  state.uploads = {}
  rerender()
}

async function watchDeploy(sha) {
  state.watching = sha
  setStatus('waiting', 'ждём сборку…')
  for (let i = 0; i < 90 && state.watching === sha; i++) {
    await new Promise((r) => setTimeout(r, i ? 8000 : 4000))
    try {
      const s = await api(`/api/status?sha=${sha}`)
      if (s.state === 'building') setStatus('building', 'сайт собирается…', s.url)
      if (s.state === 'done') {
        state.watching = null
        return setStatus('done', 'выложено на сайт', state.site + '/')
      }
      if (s.state === 'failed') {
        state.watching = null
        toast(
          'Сборка упала — открой лог по ссылке сверху. На сайте осталась прошлая версия.',
          true,
          0,
        )
        return setStatus('failed', 'сборка упала', s.url)
      }
    } catch {
      /* временная ошибка сети — пробуем дальше */
    }
  }
  if (state.watching === sha) {
    state.watching = null
    setStatus('', 'статус сборки не дождался')
  }
}

/* ---------- картинки ---------- */

/**
 * Файл → JPEG не шире maxW (как режет tools/cards/shots.py). Возвращает base64
 * для коммита и размеры для w/h. Прозрачность заливается фоном
 */
async function processImage(file, maxW) {
  const url = URL.createObjectURL(file)
  const img = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('Не получилось открыть картинку'))
    i.src = url
  })
  const scale = Math.min(1, maxW / img.naturalWidth)
  const w = Math.round(img.naturalWidth * scale)
  const hgt = Math.round(img.naturalHeight * scale)
  const canvas = Object.assign(document.createElement('canvas'), { width: w, height: hgt })
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, w, hgt)
  ctx.drawImage(img, 0, 0, w, hgt)
  URL.revokeObjectURL(url)
  // Одна картинка — не больше 3 МБ: иначе не пролезет в запрос. Длинные страницы жмём сильнее
  let blob
  for (const q of [0.86, 0.78, 0.68, 0.58, 0.48]) {
    blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', q))
    if (blob.size < 2.9 * 1024 * 1024) break
  }
  if (blob.size >= 2.9 * 1024 * 1024)
    throw new Error('Картинка слишком большая даже после сжатия — разрежь её на части')
  const base64 = await new Promise((r) => {
    const fr = new FileReader()
    fr.onload = () => r(String(fr.result).split(',')[1])
    fr.readAsDataURL(blob)
  })
  return { base64, w, h: hgt, url: URL.createObjectURL(blob) }
}

function pickFile() {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp' })
    input.onchange = () => resolve(input.files[0] || null)
    input.click()
  })
}

/** Кладёт картинку в очередь на сохранение под путём src ('/cases/slug/01.jpg') */
async function stageImage(src, maxW) {
  const file = await pickFile()
  if (!file) return null
  try {
    const img = await processImage(file, maxW)
    state.uploads[`public${src}`] = { base64: img.base64 }
    state.fresh[src] = img.url
    return img
  } catch (e) {
    toast(e.message, true)
    return null
  }
}

/** Следующий свободный номер скрина в папке кейса: 01.jpg, 02.jpg… */
function nextShotSrc(c) {
  const nums = [c.thumb, c.cover, ...c.shots]
    .filter(Boolean)
    .map((s) => Number(s.src.match(/\/(\d+)(?:-dark)?\.\w+$/)?.[1] || 0))
  const n = String(Math.max(0, ...nums) + 1).padStart(2, '0')
  return `/cases/${c.slug}/${n}.jpg`
}

const withSuffix = (src, suffix) => src.replace(/(-dark)?\.\w+$/, `${suffix}.jpg`)

/* ---------- поля ---------- */

function textField(obj, key, { label, ref, long, placeholder, onInput } = {}) {
  const value = obj[key] ?? ''
  const isLong =
    long ?? (LONG.test(key) || String(value).length > 70 || String(ref ?? '').length > 70)
  const input = h(isLong ? 'textarea' : 'input', {
    type: isLong ? null : 'text',
    rows: isLong ? 2 : null,
    placeholder: placeholder || '',
    oninput: (e) => {
      obj[key] = e.target.value
      onInput?.(e.target.value)
      refreshDirty()
    },
  })
  input.value = value
  return h(
    'label',
    { class: 'field' },
    label != null && h('span', { class: 'label' }, label),
    input,
    ref != null && ref !== '' && ref !== value && h('span', { class: 'ref' }, ref),
  )
}

function numberField(obj, key, label) {
  const input = h('input', {
    type: 'number',
    value: obj[key],
    oninput: (e) => {
      obj[key] = Number(e.target.value)
      refreshDirty()
    },
  })
  return h('label', { class: 'field' }, h('span', { class: 'label' }, label), input)
}

function checkField(obj, key, label, onChange) {
  return h(
    'label',
    {},
    h('input', {
      type: 'checkbox',
      checked: !!obj[key],
      onchange: (e) => {
        if (e.target.checked) obj[key] = true
        else delete obj[key]
        onChange?.()
        refreshDirty()
      },
    }),
    label,
  )
}

function selectField(obj, key, label, options) {
  const sel = h(
    'select',
    {
      onchange: (e) => {
        obj[key] = e.target.value
        refreshDirty()
      },
    },
    options.map(([v, t]) => h('option', { value: v, selected: obj[key] === v }, t)),
  )
  return h('label', { class: 'field' }, h('span', { class: 'label' }, label), sel)
}

/**
 * Список с кнопками ↑ ↓ ✕ и «добавить». renderItem(arr, i) рисует элемент,
 * make() — новый элемент. После структурных правок перерисовывается панель
 */
function listEditor(
  arr,
  renderItem,
  make,
  { card = false, addLabel = '+ добавить', min = 0 } = {},
) {
  const move = (i, d) => {
    const [x] = arr.splice(i, 1)
    arr.splice(i + d, 0, x)
    rerender()
  }
  return h(
    'div',
    { class: 'list' },
    arr.map((_, i) =>
      h(
        'div',
        { class: `list-item${card ? ' card' : ''}` },
        h('div', { class: 'item-body' }, renderItem(arr, i)),
        h(
          'div',
          { class: 'ctrl' },
          h(
            'button',
            { class: 'icon', title: 'Выше', disabled: i === 0, onclick: () => move(i, -1) },
            '↑',
          ),
          h(
            'button',
            {
              class: 'icon',
              title: 'Ниже',
              disabled: i === arr.length - 1,
              onclick: () => move(i, 1),
            },
            '↓',
          ),
          h(
            'button',
            {
              class: 'icon',
              title: 'Удалить',
              disabled: arr.length <= min,
              onclick: () => {
                arr.splice(i, 1)
                rerender()
              },
            },
            '✕',
          ),
        ),
      ),
    ),
    make &&
      h(
        'button',
        {
          class: 'btn small',
          onclick: () => {
            arr.push(make())
            rerender()
          },
        },
        addLabel,
      ),
  )
}

/**
 * Универсальный редактор любого значения из JSON. ref — то же место в русской
 * версии: показывается подсказкой под полем, чтобы было видно, что переводишь
 */
function valueEditor(parent, key, ref, label) {
  const v = parent[key]
  if (typeof v === 'string')
    return textField(parent, key, {
      label: nice(label),
      ref: typeof ref === 'string' ? ref : undefined,
    })
  if (typeof v === 'number') return numberField(parent, key, nice(label))
  if (typeof v === 'boolean')
    return h('div', { class: 'checks field' }, checkField(parent, key, nice(label)))
  if (Array.isArray(v) && CHIP_KEYS.has(key) && v.every((x) => typeof x === 'string')) {
    return chipEditor(v, nice(label), Array.isArray(ref) ? ref : null)
  }
  if (Array.isArray(v)) {
    const refArr = Array.isArray(ref) ? ref : []
    const sample = v[0] ?? refArr[0] ?? ''
    const card = sample && typeof sample === 'object'
    return h(
      'div',
      { class: 'field' },
      label != null &&
        h(
          'span',
          { class: 'label' },
          nice(label),
          refArr.length > 0 &&
            refArr.length !== v.length &&
            h('em', {}, `в русской версии ${refArr.length}`),
        ),
      listEditor(
        v,
        (arr, i) => (card ? objectEditor(arr[i], refArr[i]) : valueEditor(arr, i, refArr[i], null)),
        () => blank(refArr[v.length] ?? sample),
        { card },
      ),
    )
  }
  if (v && typeof v === 'object') {
    return h(
      'div',
      { class: 'field' },
      label != null && h('span', { class: 'label' }, nice(label)),
      h('div', { class: 'sub' }, objectEditor(v, ref)),
    )
  }
  return null
}

/**
 * Список коротких строк метками: Enter или запятая добавляет, × убирает,
 * перетаскивание меняет порядок, двойной клик — правка
 */
function chipEditor(arr, label, refArr, onChange) {
  const wrap = h('div', { class: 'chips' })
  const changed = () => {
    draw()
    onChange?.()
    refreshDirty()
  }
  const add = () => {
    const v = input.value.trim().replace(/,$/, '')
    if (!v) return
    arr.push(v)
    input.value = ''
    changed()
    input.focus()
  }
  const input = h('input', {
    type: 'text',
    class: 'chip-input',
    placeholder: '+ добавить',
    onkeydown: (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        add()
      }
    },
    onblur: add,
  })
  function draw() {
    wrap.replaceChildren(
      ...arr.map((t, i) => {
        const chip = h(
          'span',
          {
            class: 'chip',
            draggable: 'true',
            title: 'Перетащи, чтобы поменять порядок. Двойной клик — изменить',
            ondragstart: (e) => {
              e.dataTransfer.setData('text/plain', String(i))
              chip.classList.add('dragging')
            },
            ondragend: () => chip.classList.remove('dragging'),
            ondragover: (e) => e.preventDefault(),
            ondrop: (e) => {
              e.preventDefault()
              const from = Number(e.dataTransfer.getData('text/plain'))
              if (Number.isNaN(from) || from === i) return
              const [x] = arr.splice(from, 1)
              arr.splice(i, 0, x)
              changed()
            },
            ondblclick: () => {
              const v = prompt('Изменить', t)
              if (v?.trim()) {
                arr[i] = v.trim()
                changed()
              }
            },
          },
          t,
          h(
            'button',
            {
              class: 'chip-x',
              title: 'Убрать',
              onclick: () => {
                arr.splice(i, 1)
                changed()
              },
            },
            '×',
          ),
        )
        return chip
      }),
      input,
    )
  }
  draw()
  return h(
    'div',
    { class: 'field' },
    label != null && h('span', { class: 'label' }, label),
    wrap,
    refArr?.length > 0 && h('span', { class: 'ref' }, refArr.join(' · ')),
  )
}

function objectEditor(obj, ref) {
  return Object.keys(obj).map((k) => valueEditor(obj, k, ref?.[k], k))
}

/* ---------- скриншоты ---------- */

function shotCard(c, arr, i) {
  const s = arr[i]
  const replace = async (dark) => {
    const src = dark
      ? withSuffix(s.src || nextShotSrc(c), '-dark')
      : s.src?.endsWith('.jpg')
        ? s.src
        : nextShotSrc(c)
    const img = await stageImage(src, 1600)
    if (!img) return
    if (dark) s.dark = src
    else Object.assign(s, { src, w: img.w, h: img.h })
    rerender()
  }
  return h(
    'div',
    { class: 'shot' },
    h(
      'div',
      { class: 'img', style: { backgroundImage: s.src ? `url("${imgUrl(s.src)}")` : 'none' } },
      h('span', { class: 'size' }, `${String(i + 1).padStart(2, '0')} · ${s.w}×${s.h}`),
      h(
        'div',
        { class: 'img-ctrl' },
        h(
          'button',
          { class: 'icon', title: 'Раньше', disabled: i === 0, onclick: () => moveShot(c, i, -1) },
          '←',
        ),
        h(
          'button',
          {
            class: 'icon',
            title: 'Позже',
            disabled: i === arr.length - 1,
            onclick: () => moveShot(c, i, 1),
          },
          '→',
        ),
        h(
          'button',
          { class: 'icon', title: 'Убрать скриншот', onclick: () => removeShot(c, i) },
          '✕',
        ),
      ),
      s.dark &&
        h('div', {
          class: 'dark',
          title: 'Тёмная версия',
          style: { backgroundImage: `url("${imgUrl(s.dark)}")` },
        }),
    ),
    h(
      'div',
      { class: 'body' },
      textField(s, 'caption', { placeholder: 'Подпись', long: true }),
      h(
        'div',
        { class: 'row' },
        h('button', { class: 'btn small', onclick: () => replace(false) }, 'Заменить'),
        h(
          'button',
          {
            class: 'btn small',
            title: 'Тот же экран в тёмной теме — на сайте появится переключатель',
            onclick: () => replace(true),
          },
          s.dark ? 'Тёмная ↻' : '+ тёмная',
        ),
        s.dark &&
          h(
            'button',
            {
              class: 'icon',
              title: 'Убрать тёмную версию',
              onclick: () => {
                delete s.dark
                rerender()
              },
            },
            '◐✕',
          ),
      ),
    ),
  )
}

/** Подписи в переводах идут по порядку скринов — двигаем их вместе */
function moveShot(c, i, d) {
  const mv = (arr) => {
    if (!arr || i + d < 0 || i + d >= Math.max(arr.length, i + 1)) return
    while (arr.length <= Math.max(i, i + d)) arr.push('')
    const [x] = arr.splice(i, 1)
    arr.splice(i + d, 0, x)
  }
  mv(c.shots)
  for (const l of TRANSLATED) mv(state.data[P.copy(l)][c.slug]?.captions)
  rerender()
}

function removeShot(c, i) {
  if (!confirm('Убрать скриншот из кейса? Файл в репозитории останется.')) return
  c.shots.splice(i, 1)
  for (const l of TRANSLATED) state.data[P.copy(l)][c.slug]?.captions?.splice(i, 1)
  rerender()
}

async function addShot(c) {
  const src = nextShotSrc(c)
  const img = await stageImage(src, 1600)
  if (!img) return
  c.shots.push({ src, caption: '', w: img.w, h: img.h })
  rerender()
}

/** Обложка (thumb / cover): одна картинка с фиксированным путём */
function coverField(c, key, label, maxW, hint) {
  const s = c[key]
  const upload = async () => {
    const src = s?.src || `/cases/${c.slug}/${key}.jpg`
    const img = await stageImage(src, maxW)
    if (!img) return
    c[key] = { src, caption: '', w: img.w, h: img.h }
    rerender()
  }
  return h(
    'div',
    { class: 'single-image' },
    h('div', { class: 'img', style: { backgroundImage: s ? `url("${imgUrl(s.src)}")` : 'none' } }),
    h(
      'div',
      {},
      h(
        'div',
        { class: 'label' },
        h('strong', {}, label),
        s && h('span', { class: 'hint' }, ` · ${s.w}×${s.h}`),
      ),
      h('p', { class: 'hint' }, hint),
      h(
        'div',
        { class: 'optional' },
        h('button', { class: 'btn small', onclick: upload }, s ? 'Заменить' : 'Загрузить'),
        s &&
          h(
            'button',
            {
              class: 'btn small ghost',
              onclick: () => {
                delete c[key]
                rerender()
              },
            },
            'Убрать',
          ),
      ),
    ),
  )
}

/* ---------- вкладка «Кейсы» ---------- */

function newCase() {
  const cases = state.data[P.cases]
  let slug = 'new-case'
  for (let n = 2; cases.some((c) => c.slug === slug); n++) slug = `new-case-${n}`
  return {
    slug,
    title: '',
    tagline: '',
    lead: '',
    directions: ['design'],
    label: 'design',
    group: 'freelance',
    client: '',
    year: String(new Date().getFullYear()),
    stack: [],
    sections: [{ title: 'задача', body: [''] }],
    shots: [],
    minor: true,
  }
}

function renderSide() {
  const cases = state.data[P.cases]
  const pick = (i) => {
    state.caseIdx = i
    rerender(true)
  }
  return h(
    'aside',
    { class: 'side', id: 'side' },
    h(
      'select',
      { class: 'case-select', onchange: (e) => pick(Number(e.target.value)) },
      cases.map((c, i) =>
        h(
          'option',
          { value: i, selected: i === state.caseIdx },
          `${String(i + 1).padStart(2, '0')} · ${c.title || c.slug}`,
        ),
      ),
    ),
    h('input', {
      type: 'search',
      class: 'case-search',
      placeholder: 'Найти кейс',
      value: state.filter || '',
      oninput: (e) => {
        state.filter = e.target.value
        filterSide()
      },
    }),
    state.locale === 'ru' &&
      h(
        'button',
        {
          class: 'btn add',
          onclick: () => {
            cases.push(newCase())
            state.caseIdx = cases.length - 1
            rerender()
          },
        },
        '+ новый кейс',
      ),
    cases.map((c, i) =>
      h(
        'div',
        {
          class: `case-item${i === state.caseIdx ? ' on' : ''}`,
          'data-find': `${c.title} ${c.slug} ${c.client}`.toLowerCase(),
          onclick: () => pick(i),
        },
        h('span', { class: 'n' }, String(i + 1).padStart(2, '0')),
        h('span', { class: 't' }, c.title || c.slug),
        h('span', { class: 'flags', 'data-slug': c.slug }),
      ),
    ),
  )
}

function filterSide() {
  const q = (state.filter || '').trim().toLowerCase()
  for (const el of document.querySelectorAll('.case-item')) {
    el.hidden = !!q && !el.dataset.find.includes(q)
  }
}

/** Как лежит в репозитории — по slug, для точки «есть правки» в списке */
function savedBySlug(path) {
  const cache = (savedBySlug.cache ??= {})
  const text = state.files[path].text
  if (cache[path]?.text !== text) {
    const data = JSON.parse(text)
    const entries = Array.isArray(data) ? data.map((c) => [c.slug, c]) : Object.entries(data)
    cache[path] = {
      text,
      map: Object.fromEntries(entries.map(([k, v]) => [k, JSON.stringify(v)])),
    }
  }
  return cache[path].map
}

function caseDirty(slug) {
  const c = state.data[P.cases].find((x) => x.slug === slug)
  if (JSON.stringify(c) !== savedBySlug(P.cases)[slug]) return true
  return TRANSLATED.some((l) => {
    const t = state.data[P.copy(l)][slug]
    return (t ? JSON.stringify(t) : undefined) !== savedBySlug(P.copy(l))[slug]
  })
}

/** Метки справа в списке: несохранённые правки, маленький кейс и языки без перевода */
function renderSideFlags() {
  for (const el of document.querySelectorAll('.flags[data-slug]')) {
    const slug = el.dataset.slug
    const c = state.data[P.cases].find((x) => x.slug === slug)
    const flags = []
    if (caseDirty(slug)) flags.push(h('span', { class: 'dot', title: 'Есть несохранённые правки' }))
    if (c?.minor) flags.push(h('span', { class: 'flag', title: 'Небольшой проект' }, 'мал'))
    for (const l of TRANSLATED) {
      if (!state.data[P.copy(l)][slug])
        flags.push(h('span', { class: 'flag miss', title: `Нет перевода ${l}` }, l))
    }
    el.replaceChildren(...flags)
  }
}

function moveCase(d) {
  const cases = state.data[P.cases]
  const i = state.caseIdx
  const [x] = cases.splice(i, 1)
  cases.splice(i + d, 0, x)
  state.caseIdx = i + d
  rerender()
}

function deleteCase() {
  const cases = state.data[P.cases]
  const c = cases[state.caseIdx]
  if (
    !confirm(
      `Удалить кейс «${c.title || c.slug}» со всеми переводами? Скриншоты в репозитории останутся.`,
    )
  )
    return
  cases.splice(state.caseIdx, 1)
  for (const l of TRANSLATED) delete state.data[P.copy(l)][c.slug]
  state.caseIdx = Math.max(0, state.caseIdx - 1)
  rerender()
}

/** Смена адреса кейса — переводы привязаны к нему, переносим их следом */
function renameSlug(c, next) {
  const prev = c.slug
  c.slug = next
  for (const l of TRANSLATED) {
    const copy = state.data[P.copy(l)]
    if (copy[prev] && !copy[next]) {
      copy[next] = copy[prev]
      delete copy[prev]
    }
  }
  const flags = document.querySelector(`.flags[data-slug="${CSS.escape(prev)}"]`)
  if (flags) flags.dataset.slug = next
}

function slugField(c) {
  const input = h('input', {
    type: 'text',
    value: c.slug,
    oninput: (e) => {
      renameSlug(c, e.target.value.trim())
      input.classList.toggle('invalid', !/^[a-z0-9-]+$/.test(c.slug))
      refreshDirty()
    },
  })
  return h(
    'label',
    { class: 'field' },
    h('span', { class: 'label' }, 'Адрес: /cases/…/ — a-z, 0-9, дефис'),
    input,
  )
}

function caseEditorRu(c) {
  const cases = state.data[P.cases]
  const optional = [
    ['note', 'пометка к галерее', () => ''],
    ['link', 'ссылка на сайт', () => ({ href: 'https://', label: '' })],
    ['credit', 'соавтор', () => ({ href: 'https://github.com/', handle: '' })],
    ['preview', 'превью без скринов', () => clone(PREVIEW_TEMPLATES.flow)],
  ].filter(([k]) => c[k] === undefined)

  return [
    h(
      'div',
      { class: 'panel-head' },
      h('h1', {}, c.title || 'Новый кейс'),
      h(
        'button',
        {
          class: 'icon',
          title: 'Выше в списке',
          disabled: state.caseIdx === 0,
          onclick: () => moveCase(-1),
        },
        '↑',
      ),
      h(
        'button',
        {
          class: 'icon',
          title: 'Ниже в списке',
          disabled: state.caseIdx === cases.length - 1,
          onclick: () => moveCase(1),
        },
        '↓',
      ),
      h(
        'a',
        {
          class: 'btn small ghost',
          href: `${state.site}/cases/${c.slug}/`,
          target: '_blank',
          rel: 'noreferrer',
        },
        'на сайте ↗',
      ),
      h('button', { class: 'btn small danger', onclick: deleteCase }, 'Удалить'),
    ),
    h(
      'section',
      { class: 'group' },
      h('h2', {}, 'Основное'),
      h(
        'div',
        { class: 'grid2' },
        textField(c, 'title', {
          label: 'Название',
          onInput: () => {
            document.querySelector('.case-item.on .t').textContent = c.title || c.slug
            document.querySelector('.panel-head h1').textContent = c.title || 'Новый кейс'
          },
        }),
        textField(c, 'tagline', { label: 'Подзаголовок в списке' }),
      ),
      textField(c, 'lead', { label: 'Лид — коротко для карточки и шапки', long: true }),
      h(
        'div',
        { class: 'grid2' },
        textField(c, 'client', { label: 'Клиент' }),
        textField(c, 'year', { label: 'Год' }),
        slugField(c),
        textField(c, 'label', { label: 'Метка направлений: «design · web»' }),
      ),
      h(
        'div',
        { class: 'field' },
        h('span', { class: 'label' }, 'Направления — по ним фильтр на главной'),
        h(
          'div',
          { class: 'checks' },
          DIRECTIONS.map(([v, t]) =>
            h(
              'label',
              {},
              h('input', {
                type: 'checkbox',
                checked: c.directions.includes(v),
                onchange: (e) => {
                  c.directions = DIRECTIONS.map(([d]) => d).filter((d) =>
                    d === v ? e.target.checked : c.directions.includes(d),
                  )
                  refreshDirty()
                },
              }),
              t,
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'grid2' },
        selectField(c, 'group', 'Где сделан', GROUPS),
        h(
          'div',
          { class: 'field checks', style: { alignSelf: 'end', paddingBottom: '10px' } },
          checkField(c, 'minor', 'Небольшой проект — строкой в списке'),
        ),
      ),
      valueEditor(c, 'stack', null, 'Стек'),
    ),
    h(
      'section',
      { class: 'group' },
      h('h2', {}, 'Разделы кейса'),
      listEditor(
        c.sections,
        (arr, i) => [
          textField(arr[i], 'title', { label: 'Заголовок раздела' }),
          valueEditor(arr[i], 'body', null, 'Абзацы'),
        ],
        () => ({ title: '', body: [''] }),
        { card: true, addLabel: '+ раздел' },
      ),
    ),
    h(
      'section',
      { class: 'group' },
      h('h2', {}, `Скриншоты · ${c.shots.length}`),
      h(
        'p',
        { class: 'hint' },
        'Картинка ужимается до 1600 px по ширине и сохраняется в JPEG. Высота любая — длинные страницы можно целиком.',
      ),
      h(
        'div',
        { class: 'shots' },
        c.shots.map((_, i) => shotCard(c, c.shots, i)),
      ),
      h('button', { class: 'btn small', onclick: () => addShot(c) }, '+ скриншот'),
    ),
    h(
      'section',
      { class: 'group' },
      h('h2', {}, 'Обложки'),
      h(
        'p',
        { class: 'hint' },
        'Обычно их собирает node tools/cards/covers.mjs из скриншотов. Нет обложек и скринов — на главной рисуется превью.',
      ),
      coverField(c, 'thumb', 'Строка на главной', 1216, 'thumb.jpg, 1216×860'),
      coverField(c, 'cover', 'Шапка кейса', 2624, 'cover.jpg, 2624×1280'),
    ),
    c.preview && previewEditor(c),
    (c.note !== undefined || c.link || c.credit) &&
      h(
        'section',
        { class: 'group' },
        h('h2', {}, 'Дополнительно'),
        c.note !== undefined &&
          optionalWrap(c, 'note', textField(c, 'note', { label: 'Пометка к галерее' })),
        c.link &&
          optionalWrap(
            c,
            'link',
            h(
              'div',
              { class: 'grid2' },
              textField(c.link, 'href', { label: 'Ссылка на сайт' }),
              textField(c.link, 'label', { label: 'Текст ссылки' }),
            ),
          ),
        c.credit &&
          optionalWrap(
            c,
            'credit',
            h(
              'div',
              { class: 'grid2' },
              textField(c.credit, 'href', { label: 'GitHub соавтора' }),
              textField(c.credit, 'handle', { label: 'Ник' }),
            ),
          ),
      ),
    optional.length &&
      h(
        'div',
        { class: 'optional' },
        optional.map(([k, t, make]) =>
          h(
            'button',
            {
              class: 'btn small ghost',
              onclick: () => {
                c[k] = make()
                rerender()
              },
            },
            `+ ${t}`,
          ),
        ),
      ),
  ]
}

function optionalWrap(obj, key, content) {
  return h(
    'div',
    { class: 'list-item' },
    h('div', {}, content),
    h(
      'button',
      {
        class: 'icon',
        title: 'Убрать поле',
        onclick: () => {
          delete obj[key]
          rerender()
        },
      },
      '✕',
    ),
  )
}

/* ---------- переписка с ботом ---------- */

const CHAT_MEDIA = [
  ['', 'без вложения'],
  ['photo', 'фото'],
  ['products', 'карточки товаров'],
  ['booking', 'календарь брони'],
  ['drawing', 'рисунок с пометками'],
]
const WEEK = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']

/**
 * Сценарий переписки: кто пишет, текст, вложение. Сообщений сколько угодно —
 * на сайте переписка идёт по одному сообщению, старые уезжают вверх.
 * Справа — как это будет выглядеть (без анимации)
 */
function chatEditor(p, ref) {
  const preview = h('div', { class: 'chat-preview' })
  const drawPreview = () => preview.replaceChildren(chatPreview(p, ref))
  const touched = () => {
    drawPreview()
    refreshDirty()
  }
  const add = (line) => {
    p.lines.push(line)
    rerender()
  }
  const line = (l, i) => {
    const r = ref?.lines?.[i]
    const text = h('input', {
      type: 'text',
      value: l.text,
      placeholder: l.from === 'user' ? 'Что пишет пользователь' : 'Что отвечает бот',
      oninput: (e) => {
        l.text = e.target.value
        touched()
      },
    })
    const who = h(
      'div',
      { class: 'seg', role: 'group', title: 'Кто пишет' },
      [
        ['user', 'Пользователь'],
        ['bot', 'Бот'],
      ].map(([v, t]) =>
        h(
          'button',
          {
            class: l.from === v ? 'on' : '',
            onclick: () => {
              l.from = v
              rerender()
            },
          },
          t,
        ),
      ),
    )
    const media = h(
      'select',
      {
        class: 'media-select',
        title: 'Вложение в сообщении',
        onchange: (e) => {
          const m = e.target.value
          if (!m) {
            delete l.media
            delete l.items
          } else {
            l.media = m
            if (m === 'products' && !l.items?.length) l.items = []
            else if (m === 'booking' && !l.items?.length) l.items = ['cabin · free']
            else if (m === 'photo' || m === 'drawing') delete l.items
          }
          rerender()
        },
      },
      CHAT_MEDIA.map(([v, t]) => h('option', { value: v, selected: (l.media || '') === v }, t)),
    )
    const move = (d) => {
      const [x] = p.lines.splice(i, 1)
      p.lines.splice(i + d, 0, x)
      rerender()
    }
    return h(
      'div',
      { class: `chat-line from-${l.from}` },
      h(
        'div',
        { class: 'chat-line-top' },
        h('span', { class: 'chat-n' }, String(i + 1).padStart(2, '0')),
        who,
        media,
        h('span', { class: 'fill' }),
        h(
          'button',
          { class: 'icon', title: 'Выше', disabled: i === 0, onclick: () => move(-1) },
          '↑',
        ),
        h(
          'button',
          {
            class: 'icon',
            title: 'Ниже',
            disabled: i === p.lines.length - 1,
            onclick: () => move(1),
          },
          '↓',
        ),
        h(
          'button',
          {
            class: 'icon',
            title: 'Дублировать',
            onclick: () => {
              p.lines.splice(i + 1, 0, clone(l))
              rerender()
            },
          },
          '⧉',
        ),
        h(
          'button',
          {
            class: 'icon',
            title: 'Удалить сообщение',
            disabled: p.lines.length <= 1,
            onclick: () => {
              p.lines.splice(i, 1)
              rerender()
            },
          },
          '✕',
        ),
      ),
      text,
      r?.text && r.text !== l.text && h('span', { class: 'ref' }, r.text),
      l.media === 'products' &&
        chipEditor(
          l.items ?? (l.items = []),
          'Товары в карточках — на сайте видно первые три',
          r?.items,
          drawPreview,
        ),
      l.media === 'booking' &&
        textField(l.items ?? (l.items = ['']), 0, {
          label: 'Подпись под календарём',
          ref: r?.items?.[0],
          onInput: drawPreview,
        }),
    )
  }
  drawPreview()
  return h(
    'div',
    { class: 'chat-editor' },
    h(
      'div',
      { class: 'chat-lines' },
      !ref &&
        textField(p, 'bot', {
          label: 'Имя бота в шапке переписки — как в Telegram. Пусто — «bot»',
          placeholder: 'bot',
          onInput: (v) => {
            if (!v.trim()) delete p.bot
            drawPreview()
          },
        }),
      p.lines.map(line),
      h(
        'div',
        { class: 'optional' },
        h(
          'button',
          { class: 'btn small', onclick: () => add({ from: 'user', text: '' }) },
          '+ пишет пользователь',
        ),
        h(
          'button',
          { class: 'btn small', onclick: () => add({ from: 'bot', text: '' }) },
          '+ отвечает бот',
        ),
        h(
          'button',
          { class: 'btn small', onclick: () => add({ from: 'bot', text: '', media: 'photo' }) },
          '+ бот присылает фото',
        ),
      ),
    ),
    preview,
  )
}

/** Как переписка будет выглядеть на сайте — те же пузыри и вложения, без анимации */
function chatPreview(p, ref) {
  const photo = `${state.site}/me/photo.jpg`
  const media = (l) => {
    if (l.media === 'photo') return h('img', { class: 'cp-photo', src: photo, alt: '' })
    if (l.media === 'products') {
      return h(
        'div',
        { class: 'cp-products' },
        (l.items || [])
          .slice(0, 3)
          .map((t) =>
            h(
              'div',
              { class: 'cp-product' },
              h('div', { class: 'cp-thumb' }),
              h('div', {}, t || '…'),
              h('small', {}, 'in stock'),
            ),
          ),
      )
    }
    if (l.media === 'booking') {
      return h(
        'div',
        { class: 'cp-booking' },
        h(
          'div',
          { class: 'cp-days' },
          WEEK.map((d, i) => h('span', { class: i > 4 ? 'on' : '' }, d)),
        ),
        h('small', {}, `● ${l.items?.[0] || ''}`),
      )
    }
    if (l.media === 'drawing') return h('div', { class: 'cp-drawing' }, '✎ рисунок с пометками')
    return null
  }
  return h(
    'div',
    { class: 'cp' },
    h(
      'div',
      { class: 'cp-head' },
      h('span', { class: 'cp-avatar' }),
      p.bot || ref?.bot || 'bot',
      h('span', { class: 'cp-live' }),
      'online',
    ),
    h(
      'div',
      { class: 'cp-thread' },
      p.lines.map((l) =>
        h(
          'div',
          {
            class: `cp-bubble ${l.from === 'user' ? 'user' : 'bot'}${l.media === 'products' || l.media === 'booking' ? ' wide' : ''}`,
          },
          media(l),
          l.text && h('span', {}, l.text),
        ),
      ),
    ),
  )
}

function previewEditor(c, ref) {
  const p = c.preview
  const kinds = [
    ['flow', 'цепочка шагов'],
    ['chat', 'переписка с ботом'],
    ['inbox', 'разбор почты'],
    ['search', 'поиск'],
  ]
  return h(
    'section',
    { class: 'group' },
    h('h2', {}, 'Превью без скриншотов'),
    h(
      'p',
      { class: 'hint' },
      ref
        ? 'Перевод текстов превью. Структура — как в русской версии.'
        : 'Показывается вместо картинки, пока у кейса нет обложки.',
    ),
    !ref &&
      h(
        'div',
        { class: 'grid2' },
        h(
          'label',
          { class: 'field' },
          h('span', { class: 'label' }, 'Вид'),
          h(
            'select',
            {
              onchange: (e) => {
                if (!confirm('Сменить вид превью? Текущее содержимое превью сотрётся.')) {
                  e.target.value = p.kind
                  return
                }
                c.preview = clone(PREVIEW_TEMPLATES[e.target.value])
                rerender()
              },
            },
            kinds.map(([v, t]) => h('option', { value: v, selected: p.kind === v }, t)),
          ),
        ),
      ),
    p.kind === 'chat'
      ? chatEditor(p, ref)
      : Object.keys(p)
          .filter((k) => k !== 'kind')
          .map((k) => valueEditor(p, k, ref?.[k], k)),
    h(
      'button',
      {
        class: 'btn small ghost danger',
        onclick: () => {
          delete c.preview
          rerender()
        },
      },
      ref ? 'Убрать перевод превью' : 'Убрать превью',
    ),
  )
}

/** Подпись по номеру скрина. Подписей бывает меньше, чем скринов, — добиваем пустыми только при вводе */
function captionField(captions, i, ref) {
  const input = h('input', {
    type: 'text',
    value: captions[i] ?? '',
    oninput: (e) => {
      while (captions.length < i) captions.push('')
      captions[i] = e.target.value
      refreshDirty()
    },
  })
  return h('label', { class: 'field' }, input, ref && h('span', { class: 'ref' }, ref))
}

function caseEditorTranslation(c, l) {
  const copy = state.data[P.copy(l)]
  const t = copy[c.slug]
  const head = h(
    'div',
    { class: 'panel-head' },
    h('h1', {}, t?.title || c.title),
    h(
      'a',
      {
        class: 'btn small ghost',
        href: `${state.site}/${l}/cases/${c.slug}/`,
        target: '_blank',
        rel: 'noreferrer',
      },
      'на сайте ↗',
    ),
    t &&
      h(
        'button',
        {
          class: 'btn small danger',
          onclick: () => {
            if (!confirm('Удалить перевод? На этом языке кейс покажется по-русски.')) return
            delete copy[c.slug]
            rerender()
          },
        },
        'Удалить перевод',
      ),
  )
  if (!t) {
    return [
      head,
      h(
        'section',
        { class: 'group' },
        h('p', {}, 'Перевода нет — на этом языке кейс показывается по-русски.'),
        h(
          'button',
          {
            class: 'btn primary',
            onclick: () => {
              copy[c.slug] = {
                tagline: '',
                lead: '',
                client: '',
                sections: c.sections.map((s) => ({ title: '', body: s.body.map(() => '') })),
                captions: c.shots.map(() => ''),
                ...(c.note !== undefined && { note: '' }),
              }
              rerender()
            },
          },
          'Добавить перевод',
        ),
      ),
    ]
  }

  return [
    head,
    h(
      'p',
      { class: 'hint' },
      'Серым под полем — русский текст. Скриншоты, стек и год общие для всех языков, правятся в RU.',
    ),
    h(
      'section',
      { class: 'group' },
      h('h2', {}, 'Основное'),
      (() => {
        const f = textField(t, 'title', {
          label: 'Название — только если переводится',
          ref: c.title,
          placeholder: c.title,
        })
        f.querySelector('input').addEventListener('input', (e) => {
          if (!e.target.value) delete t.title
        })
        return f
      })(),
      textField(t, 'tagline', { label: 'Подзаголовок', ref: c.tagline }),
      textField(t, 'lead', { label: 'Лид', ref: c.lead, long: true }),
      textField(t, 'client', { label: 'Клиент', ref: c.client }),
      c.note !== undefined && textField(t, 'note', { label: 'Пометка к галерее', ref: c.note }),
    ),
    h(
      'section',
      { class: 'group' },
      h('h2', {}, 'Разделы'),
      c.sections.length !== t.sections.length &&
        h(
          'p',
          { class: 'hint' },
          `В русской версии разделов: ${c.sections.length}, тут: ${t.sections.length}.`,
        ),
      listEditor(
        t.sections,
        (arr, i) => [
          textField(arr[i], 'title', { label: 'Заголовок', ref: c.sections[i]?.title }),
          valueEditor(arr[i], 'body', c.sections[i]?.body, 'Абзацы'),
        ],
        () => {
          const ref = c.sections[t.sections.length]
          return { title: '', body: ref ? ref.body.map(() => '') : [''] }
        },
        { card: true, addLabel: '+ раздел' },
      ),
    ),
    c.shots.length > 0 &&
      h(
        'section',
        { class: 'group' },
        h('h2', {}, 'Подписи к скриншотам'),
        c.shots.map((s, i) =>
          h(
            'div',
            { class: 'caption-row' },
            h('div', { class: 'thumb', style: { backgroundImage: `url("${imgUrl(s.src)}")` } }),
            captionField(t.captions, i, s.caption),
          ),
        ),
      ),
    c.preview &&
      (t.preview
        ? previewEditor(t, c.preview)
        : h(
            'section',
            { class: 'group' },
            h('h2', {}, 'Превью без скриншотов'),
            h('p', { class: 'hint' }, 'Тексты превью сейчас берутся из русской версии.'),
            h(
              'button',
              {
                class: 'btn small',
                onclick: () => {
                  t.preview = clone(c.preview)
                  // имя бота одно на все языки — берётся из русской версии
                  delete t.preview.bot
                  rerender()
                },
              },
              'Перевести превью',
            ),
          )),
  ]
}

/**
 * На широком экране кейс в две колонки: слева тексты, справа картинки и остальное.
 * split — сколько первых блоков (включая шапку) идёт до правой колонки
 */
function columns(blocks, split) {
  const list = blocks.filter(Boolean)
  if (list.length <= split) return list
  return [
    list[0],
    h(
      'div',
      { class: 'cols' },
      h('div', { class: 'col' }, list.slice(1, split)),
      h('div', { class: 'col' }, list.slice(split)),
    ),
  ]
}

function renderCases() {
  const cases = state.data[P.cases]
  state.caseIdx = Math.min(state.caseIdx, cases.length - 1)
  const c = cases[state.caseIdx]
  return h(
    'div',
    { class: 'layout' },
    renderSide(),
    h(
      'div',
      { class: 'panel wide' },
      c
        ? state.locale === 'ru'
          ? columns(caseEditorRu(c), 3)
          : columns(caseEditorTranslation(c, state.locale), 4)
        : h('p', {}, 'Кейсов нет'),
    ),
  )
}

/* ---------- вкладка «Тексты сайта» ---------- */

function renderDict() {
  const l = state.locale
  const d = state.data[P.dict(l)]
  const ref = l === 'ru' ? null : state.data[P.dict('ru')]
  return h(
    'div',
    { class: 'panel wide' },
    h(
      'div',
      { class: 'panel-head' },
      h('h1', {}, `Тексты сайта · ${LOCALES.find(([k]) => k === l)[1]}`),
    ),
    ref && h('p', { class: 'hint' }, 'Серым под полем — русский текст.'),
    h(
      'div',
      { class: 'masonry' },
      Object.keys(d).map((k) =>
        h(
          'details',
          {
            class: 'group',
            open: state.openDict?.has(k),
            ontoggle: (e) => toggleDict(k, e.target.open),
          },
          h('summary', {}, DICT_LABELS[k] || k),
          valueEditor(d, k, ref?.[k], null),
        ),
      ),
    ),
  )
}

function toggleDict(k, open) {
  state.openDict ??= new Set()
  if (open) state.openDict.add(k)
  else state.openDict.delete(k)
}

/* ---------- вкладка «Контакты» ---------- */

function renderSite() {
  const s = state.data[P.site]
  return h(
    'div',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h1', {}, 'Контакты')),
    h('p', { class: 'hint' }, 'Одни на все языки.'),
    h(
      'section',
      { class: 'group' },
      textField(s.contacts, 'email', { label: 'Email' }),
      h(
        'div',
        { class: 'grid2' },
        textField(s.contacts, 'telegram', { label: 'Telegram — ссылка' }),
        textField(s.contacts, 'telegramHandle', { label: 'Telegram — ник' }),
      ),
      textField(s.contacts, 'github', { label: 'GitHub' }),
      textField(s, 'coords', { label: 'Координаты на первом экране' }),
    ),
  )
}

/* ---------- каркас ---------- */

function renderTop() {
  $('tabs').replaceChildren(
    ...TABS.map(([k, t]) =>
      h(
        'button',
        {
          class: state.tab === k ? 'on' : '',
          onclick: () => {
            state.tab = k
            rerender(true)
          },
        },
        t,
      ),
    ),
  )
  const loc = $('locales')
  loc.hidden = state.tab === 'site'
  loc.replaceChildren(
    ...LOCALES.map(([k, t]) =>
      h(
        'button',
        {
          class: state.locale === k ? 'on' : '',
          onclick: () => {
            state.locale = k
            rerender(true)
          },
        },
        t,
      ),
    ),
  )
}

/** Перерисовка. top — со сбросом прокрутки (переход на другой экран) */
function rerender(top = false) {
  const scroll = window.scrollY
  const sideScroll = $('side')?.scrollTop
  renderTop()
  const view = { cases: renderCases, dict: renderDict, site: renderSite }[state.tab]()
  $('main').replaceChildren(view)
  if ($('side') && sideScroll != null) $('side').scrollTop = sideScroll
  filterSide()
  window.scrollTo(0, top ? 0 : scroll)
  refreshDirty()
  try {
    localStorage.setItem(
      'admin-view',
      JSON.stringify({ tab: state.tab, locale: state.locale, caseIdx: state.caseIdx }),
    )
  } catch {
    /* без localStorage просто не помним вкладку */
  }
}

async function init() {
  try {
    Object.assign(state, JSON.parse(localStorage.getItem('admin-view') || '{}'))
  } catch {
    /* нет сохранённого вида — начинаем с кейсов */
  }
  $('save').addEventListener('click', save)
  $('discard').addEventListener('click', discard)
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      save()
    }
  })
  addEventListener('beforeunload', (e) => {
    if (dirtyPaths().length || Object.keys(state.uploads).length) e.preventDefault()
  })
  try {
    const res = await api('/api/content')
    state.site = res.site
    state.files = res.files
    for (const [p, f] of Object.entries(res.files)) state.data[p] = JSON.parse(f.text)
    rerender()
    api('/api/status')
      .then((s) => {
        if (state.watching || dirtyPaths().length) return
        const text = {
          done: 'сайт актуален',
          building: 'сайт собирается…',
          failed: 'последняя сборка упала',
          waiting: '',
        }[s.state]
        setStatus(s.state, text, s.url)
        if (s.state === 'building') watchDeploy(s.sha)
      })
      .catch(() => {})
  } catch (e) {
    $('main').replaceChildren(h('p', { class: 'loading' }, `Не загрузилось: ${e.message}`))
  }
}

init()
