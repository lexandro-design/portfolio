# Админка портфолио

Правка контента сайта из браузера: кейсы, скриншоты, переводы, тексты главной, контакты.
Живёт отдельно от сайта: проект на Vercel, адрес `admin.discode.group`, вход по логину и паролю.

**Почему Vercel, а не Cloudflare:** сначала админка была Cloudflare Worker, но российские провайдеры
рвут соединения с прокси Cloudflare (`ERR_CONNECTION_RESET`, 2026-09-26). У Worker'а на своём
домене прокси не выключить, поэтому переехали на Vercel, как и демо Parfumeria. В Cloudflare
остаётся только DNS-запись с серым облаком.

## Как устроено

- Контент сайта лежит в `src/content/data/*.json`. Сайт читает его при сборке.
- Админка грузит эти файлы через GitHub API, правки сохраняет **одним коммитом в `main`**.
  Дальше обычный деплой GitHub Actions пересобирает сайт (пара минут). Статус сборки виден
  в шапке админки.
- Перед сборкой `tools/check-content.mjs` проверяет JSON. Сломанная правка валит деплой,
  на сайте остаётся прошлая версия.
- Токен GitHub хранится только в переменных окружения Vercel, в браузер не попадает. Без входа
  функция не отдаёт ни страницу, ни данные: интерфейс лежит в `app/`, а статикой Vercel
  раздаёт только `public/`, где один `robots.txt`.
- Если файл успели поменять в репозитории после открытия админки (пуш с компа), сохранение
  откажет, а не затрёт чужую правку. Обновить страницу и повторить.
- Скриншоты ужимаются в браузере до 1600 px по ширине, JPEG до 3 МБ, лежат в
  `public/cases/<slug>/`. Каждая картинка уходит отдельным запросом: у функций Vercel потолок
  4,5 МБ на запрос. Удалённый из кейса скрин остаётся файлом в репо.

Код: `lib/admin.js` (вся логика), `api/index.js` (функция Vercel), `app/` (интерфейс),
`scripts/dev.mjs` (локальный запуск).

## Первый деплой

1. **Токен GitHub** — https://github.com/settings/personal-access-tokens/new, fine-grained:
   - Repository access: _Only select repositories_ → `lexandro-design/portfolio`
   - Permissions: **Contents — Read and write**, **Actions — Read-only** (Metadata добавится сам)
   - Срок — максимальный; когда истечёт, обновить переменную `GITHUB_TOKEN` в Vercel и сделать Redeploy.
2. **Пароль**: `node scripts/hash-password.mjs` → строка `pbkdf2_sha256$…`.
   Случайная строка для сессий: `node -e "console.log(crypto.randomBytes(32).toString('base64'))"`.
3. **Vercel** → Add New → Project → Import `lexandro-design/portfolio`:
   - Root Directory: **`admin`**, Framework Preset: **Other**, Build Command пустой.
   - Environment Variables: `ADMIN_USER`, `ADMIN_PASS_HASH`, `SESSION_SECRET`, `GITHUB_TOKEN`.
   - Deploy. Проверить на адресе `*.vercel.app`, что открывается вход.
   - Settings → Git → **Ignored Build Step**: `git diff --quiet HEAD^ HEAD -- .` —
     админка не будет пересобираться на каждую правку контента, только когда меняется `admin/`.
4. **Домен**: Vercel → проект → Settings → Domains → Add `admin.discode.group`. Vercel покажет CNAME.
   В Cloudflare → `discode.group` → DNS: запись `admin`, CNAME на этот адрес, **серое облако (DNS only)**.
   Если домен ещё занят старым Worker'ом — сначала удалить Worker `portfolio-admin`
   (Workers & Pages → portfolio-admin → Settings → Delete), с ним уйдёт и его запись.

Сменить пароль — снова `hash-password`, новое значение `ADMIN_PASS_HASH` в Vercel и Redeploy:
все открытые сессии разлогинятся.

## Локально

`admin/.env.local` (в git не попадает) с теми же переменными, затем `npm run dev` →
http://localhost:8787. Без настоящего GitHub можно задать `GITHUB_API` — адрес заглушки
с тем же API. Переменные, уже заданные в системе, `.env.local` не перекрывает.

## Ещё строже

Логин и пароль — единственный замок. Можно включить Vercel Authentication (Settings →
Deployment Protection) для превью-адресов, а основной домен оставить под паролем админки.
