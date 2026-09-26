# portfolio

Сайт-портфолио: [lexandro-design.github.io/portfolio](https://lexandro-design.github.io/portfolio/)

Next.js (App Router) + TypeScript + CSS Modules, статическая выгрузка на GitHub Pages.
Три темы: тёмная, тёплая, светлая. Дизайн в Figma.

```
pnpm install
pnpm dev        # http://localhost:3000/portfolio
pnpm build      # статика в out/
```

Кейсы лежат в `src/content/cases.ts`, переводы — в `src/content/cases-i18n/`.
Скриншоты нарезает `python tools/cards/shots.py` из `../portfolio-shots` в `public/cases/<slug>/`,
обложки собирает `node tools/cards/covers.mjs`, превью ссылок и профиль GitHub — `node tools/cards/render.mjs`.
У кейса без скриншотов (автоматизации) вместо картинки живое превью: цепочка шагов или переписка с ботом.
Деплой при пуше в `main` через GitHub Actions.
