# portfolio

Сайт-портфолио: [lexandro-design.github.io/portfolio](https://lexandro-design.github.io/portfolio/)

Next.js (App Router) + TypeScript + CSS Modules, статическая выгрузка на GitHub Pages.
Три темы: тёмная, тёплая, светлая. Дизайн в Figma.

```
pnpm install
pnpm dev        # http://localhost:3000/portfolio
pnpm build      # статика в out/
```

Кейсы лежат в `src/content/cases.ts`, скриншоты в `public/cases/<slug>/`.
Кейс со скриншотами показывается на главной крупной строкой, без них — строкой списка.
Деплой при пуше в `main` через GitHub Actions.
