[← Все кейсы](README.md)

# Как добавить кейс

1. Скопировать шаблон в папку с коротким именем проекта (латиница, строчные, через дефис):

   ```sh
   cp -r _template cases/<slug>
   ```

2. Заполнить `cases/<slug>/README.md`: таблицу «Задача / Роль / Стек / Результат» и разделы ниже. Нет данных — оставить «уточняется».

3. Обложка. В шаблоне лежит `images/cover.svg`: заменить в нём название, подпись, номер и стек (текстовые поля в конце файла) или положить скриншот `images/cover.jpg` 1600×900 и поменять ссылку на обложку в README кейса.

4. Галерея: положить `01.jpg`, `02.jpg`, … в `cases/<slug>/images/`. Размер — 1600×900, JPG, до 500 КБ. Под каждой картинкой подписать, что на ней. Лишние строки галереи удалить.

5. Навигация: в нижней строке нового кейса указать следующий кейс, а в предыдущем кейсе — ссылку на новый.

6. Добавить кейс в три места:
   - корневой [README.md](README.md) — карточку в таблицу «Кейсы» и строку в сводную таблицу;
   - [index.html](index.html) — копию блока `<article class="case">`;
   - при необходимости — карточку в README профиля (`lexandro-design/lexandro-design`).

7. Закоммитить:

   ```sh
   git add cases/<slug> README.md index.html
   git commit -m "docs(cases): add <slug> case"
   ```

## Замена обложки скриншотом

Если вместо `cover.svg` появился `cover.jpg`, ссылку нужно поменять в README кейса, в корневом README, в `index.html` и в README профиля.

## Сайт на GitHub Pages

Страница `index.html` в корне репозитория публикуется через GitHub Pages:
Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, папка **/ (root)** → Save.
Адрес: https://lexandro-design.github.io/portfolio/
