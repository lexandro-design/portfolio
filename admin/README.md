# Админка портфолио

Правка контента сайта из браузера: кейсы, скриншоты, переводы, тексты главной, контакты.
Живёт отдельно от сайта — Cloudflare Worker на `admin.discode.group`, вход по логину и паролю.

## Как устроено

- Контент сайта лежит в `src/content/data/*.json`. Сайт читает его при сборке.
- Админка грузит эти файлы через GitHub API, правки сохраняет **одним коммитом в `main`**.
  Дальше обычный деплой GitHub Actions пересобирает сайт (пара минут). Статус сборки виден
  в шапке админки.
- Перед сборкой `tools/check-content.mjs` проверяет JSON. Сломанная правка валит деплой,
  на сайте остаётся прошлая версия.
- Токен GitHub хранится только в секретах воркера, в браузер не попадает. Без входа воркер
  не отдаёт ни страницу, ни данные. Публичного адреса `*.workers.dev` нет.
- Если файл успели поменять в репозитории после открытия админки (пуш с компа), сохранение
  откажет, а не затрёт чужую правку. Обновить страницу и повторить.
- Скриншоты ужимаются в браузере до 1600 px по ширине и сохраняются JPEG в
  `public/cases/<slug>/`. Удалённый из кейса скрин остаётся файлом в репо.

## Первый деплой

Нужен Node 22 и доступ к аккаунту Cloudflare, где висит зона `discode.group`.

1. **Токен GitHub** — https://github.com/settings/personal-access-tokens/new, fine-grained:
   - Repository access: _Only select repositories_ → `lexandro-design/portfolio`
   - Permissions: **Contents — Read and write**, **Actions — Read-only** (Metadata добавится сам)
   - Срок — максимальный; когда истечёт, повторить `secret put GITHUB_TOKEN`.
2. В папке `admin/`:
   ```
   npm install
   npx wrangler login
   node scripts/hash-password.mjs          # ввести пароль → получить строку pbkdf2_sha256$…
   npx wrangler secret put ADMIN_USER       # логин
   npx wrangler secret put ADMIN_PASS_HASH  # строка из hash-password
   npx wrangler secret put SESSION_SECRET   # любая длинная случайная строка
   npx wrangler secret put GITHUB_TOKEN     # токен из шага 1
   npx wrangler deploy
   ```
   Первый `secret put` до деплоя спросит, создать ли воркер, — ответить «да».
   Случайная строка для `SESSION_SECRET`: `node -e "console.log(crypto.randomBytes(32).toString('base64'))"`.
3. Открыть https://admin.discode.group.

Сменить пароль — снова `hash-password` и `secret put ADMIN_PASS_HASH`: все открытые сессии
разлогинятся. Правки в самой админке (`src/`, `public/`) — `npx wrangler deploy`.

## Локально

`admin/.dev.vars` (в git не попадает) с теми же переменными, что секреты, затем `npm run dev`
→ http://localhost:8787. Для проверки без настоящего GitHub можно задать `GITHUB_API` —
адрес заглушки с тем же API.

## Ещё строже

Логин и пароль — единственный замок. Можно поставить перед воркером Cloudflare Access
(Zero Trust → Access → Applications → `admin.discode.group`, политика «email =
свой»): тогда до страницы входа пустит только после кода на почту.
