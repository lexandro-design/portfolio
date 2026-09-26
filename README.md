# portfolio

Сайт-портфолио: [lexandro-design.github.io/portfolio](https://lexandro-design.github.io/portfolio/)

Next.js (App Router) + TypeScript + CSS Modules, статическая выгрузка на GitHub Pages.
Три темы: тёмная, тёплая, светлая. Дизайн в Figma.

```
pnpm install
pnpm dev        # http://localhost:3000/portfolio
pnpm build      # статика в out/
```

Контент — JSON в `src/content/data/`: кейсы (`cases.json`), их переводы (`cases-i18n/`), тексты сайта (`dict/`),
контакты (`site.json`). Правится руками или из админки ([admin/](admin/README.md)), типы — в `src/content/cases.ts`
и `src/i18n/dict/types.ts`. Перед сборкой `pnpm check:content` проверяет форму JSON.
Скриншоты нарезает `python tools/cards/shots.py` из `../portfolio-shots` в `public/cases/<slug>/`,
обложки собирает `node tools/cards/covers.mjs`, превью ссылок и профиль GitHub — `node tools/cards/render.mjs`.
У кейса без скриншотов (автоматизации) вместо картинки живое превью: цепочка шагов или переписка с ботом.
Деплой при пуше в `main` через GitHub Actions.
