"""Готовит скриншоты кейсов из portfolio-shots в public/cases/<slug>/.

python tools/cards/shots.py [slug…]   — без аргументов пересобирает все кейсы
Исходники лежат рядом с репо, в ../portfolio-shots (экспорт из Figma в 2×),
в git они не идут: там сотни мегабайт PNG.

Каждый элемент манифеста:
  ('src', путь)                      — десктоп, ширина до 1600, высота до MAX_H (низ режется)
  ('crop', путь, y0, y1)             — вырез по высоте из исходника (в пикселях исходника)
  ('mob', [пути], высота_кадра)      — телефоны в ряд на нейтральном фоне
  ('pair', светлый, тёмный)          — два варианта темы: NN.jpg и NN-dark.jpg
Размеры готовых файлов печатаются в консоль — их переносим в shots кейса в src/content/data/cases.json (или через админку).
"""
import os, sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
SRC = 'C:/Users/alexs/dev/portfolio-shots'
OUT = 'C:/Users/alexs/dev/portfolio/public/cases'
W, MAX_H, Q = 1600, 5200, 82
BG = (233, 232, 228)

T, E, F = '01-titan-2', '02-entersales', '03-sites-freelance'
PF = f'{E}/parfumeria'

M = {
    'parfumeria': [
        ('src', f'{PF}/Desktop – Home (sections).png'),
        ('src', f'{PF}/Desktop – Catalog (perfumery, grid).png'),
        ('src', f'{PF}/Desktop – Product Page (sections).png'),
        ('mob', [f'{PF}/Mobile – Home (sections).png', f'{PF}/Mobile – Catalog L1.png',
                 f'{PF}/Mobile – Cart (all items selected).png'], 1560),
        ('src', f'{PF}/Desktop – Search (overlay, suggestions).png'),
        ('src', f'{PF}/Desktop – Cart (all items selected).png'),
        ('src', f'{PF}/Desktop – Gift Card (design).png'),
        ('src', f'{PF}/Desktop – Brand HERMES (large cards).png'),
        ('src', f'{PF}/Desktop – Checkout (courier).png'),
        ('src', f'{PF}/Desktop – Account (my orders).png'),
        ('src', f'{PF}/Tablet – Home (sections).png'),
        ('src', f'{PF}/Screenshot_2.png'),
    ],
    'meeting-rooms': [
        ('src', f'{T}/meeting-rooms/rooms · сотрудник · загружено.png'),
        ('src', f'{T}/meeting-rooms/rooms · сотрудник · бронирование · заполненная.png'),
        ('src', f'{T}/meeting-rooms/rooms/_id · сотрудник · загружено.png'),
        ('src', f'{T}/meeting-rooms/bookings · сотрудник · предстоящие.png'),
        ('src', f'{T}/meeting-rooms/admin · админ · загружено.png'),
        ('src', f'{T}/meeting-rooms/admin/rooms · админ · загружено.png'),
        ('src', f'{T}/meeting-rooms/rooms · сотрудник · бронирование · конфликт.png'),
        ('src', f'{T}/meeting-rooms/admin/equipment · админ · добавление оборудования.png'),
        ('src', f'{T}/meeting-rooms/rooms · сотрудник · пусто.png'),
        ('src', f'{T}/meeting-rooms/403 · сотрудник · нет доступа.png'),
        ('src', f'{T}/meeting-rooms/Screenshot_1.png'),
    ],
    'otrx': [
        ('src', f'{T}/otrx/Реестр документов.png'),
        ('src', f'{T}/otrx/Карточка ПСД — 4 Не пройдена.png'),
        ('src', f'{T}/otrx/Карточка ПСД — 3 Пройдена.png'),
        ('src', f'{T}/otrx/Аналитика работы модуля.png'),
        ('src', f'{T}/otrx/Админ-панель — Настройки модуля v2.png'),
        ('src', f'{T}/otrx/Модальное окно — добавление правила v2.png'),
        ('src', f'{T}/otrx/Модальное окно-3.png'),
        ('src', f'{T}/otrx/Карточка ПСД — 8 OTRX-файл не прикреплён.png'),
        ('src', f'{T}/otrx/Админ-панель — Нет доступа v2.png'),
        ('src', f'{T}/otrx/Screenshot_1.png'),
    ],
    'meg-site': [
        ('src', f'{T}/meg-site/Главная страница (1440 px).png'),
        ('src', f'{T}/meg-site/Услуги (1440 px)-2.png'),
        ('src', f'{T}/meg-site/О компании(1440 px).png'),
        ('mob', [f'{T}/meg-site/мобилка/Главная страница (393 px).png',
                 f'{T}/meg-site/мобилка/Услуги (393 px)-2.png',
                 f'{T}/meg-site/мобилка/menu.png'], 1700),
        ('src', f'{T}/meg-site/Поставщикам (1440 px).png'),
        ('src', f'{T}/meg-site/Документы (1440 px).png'),
        ('src', f'{T}/meg-site/Отзывы (1440 px).png'),
        ('src', f'{T}/meg-site/Жалобы (1440 px).png'),
        ('src', f'{T}/meg-site/планшет/Главная страница (834 px).png'),
        ('src', f'{T}/meg-site/Screenshot_2.png'),
    ],
    'ai-translator': [
        ('pair', f'{T}/ai-translator/Чат.png', f'{T}/ai-translator/Чат-1.png'),
        ('pair', f'{T}/ai-translator/Чат..png', f'{T}/ai-translator/Чат.-1.png'),
        ('src', f'{T}/ai-translator/Screenshot_14.png'),
    ],
    'pix-bi': [
        ('src', f'{T}/pix-bi/Обеспечения · обзор.png'),
        ('src', f'{T}/pix-bi/Обеспечения · подробный отчёт.png'),
        ('src', f'{T}/pix-bi/Обеспечения · аналитика.png'),
        ('src', f'{T}/pix-bi/Обеспечения · карточка договора.png'),
        ('src', f'{T}/pix-bi/Обеспечения · подробный отчёт · нет данных.png'),
        ('src', f'{T}/pix-bi/Screenshot_2.png'),
    ],
    'vacation-plan': [
        ('src', f'{T}/vacation-plan/Главная (Администратор).png'),
        ('src', f'{T}/vacation-plan/Настройки/Сотрудники (Администратор).png'),
        ('src', f'{T}/vacation-plan/Главная (Пользователь).png'),
        ('src', f'{T}/vacation-plan/Настройки/Должности (Администратор).png'),
        ('src', f'{T}/vacation-plan/Главная (Администратор)-3.png'),
        ('src', f'{T}/vacation-plan/Screenshot_1.png'),
    ],
    'prof-study': [
        ('crop', f'{T}/prof-stufy/десктоп/Main Frame.png', 0, 3100),
        ('crop', f'{T}/prof-stufy/десктоп/Main Frame.png', 3100, 6500),
        ('mob', [f'{T}/prof-stufy/мобилка/Main Frame.png'], 1700),
        ('crop', f'{T}/prof-stufy/десктоп/Main Frame.png', 8100, 11400),
        ('crop', f'{T}/prof-stufy/десктоп/Main Frame.png', 11400, 13440),
        ('crop', f'{T}/prof-stufy/десктоп/Main Frame.png', 13440, 16804),
    ],
    'osq': [
        ('src', f'{E}/osq-site/Сквозная живая лента новостей.png'),
        ('src', f'{E}/osq-site/Вариант без анимации.png'),
        ('src', f'{E}/osq-site/Раочий стол с виджетами Desktop.png'),
        ('src', f'{E}/osq-site/Каталог.png'),
        ('src', f'{E}/osq-site/Упаковка для HORECA.png'),
        ('src', f'{E}/osq-site/Маркетинг.png'),
        ('src', f'{E}/osq-site/Сотрудники Desktop.png'),
        ('mob', [f'{E}/osq-site/Сквозная живая лента новостей Mobile.png'], 1624),
        ('src', f'{E}/osq-site/Авторизация Decktop.png'),
    ],
    'tetrasis': [
        ('src', f'{E}/tetrasis/Страница комплекта десктоп.png'),
        ('src', f'{E}/tetrasis/Страница товара из комплекта десктоп.png'),
        ('mob', [f'{E}/tetrasis/Страница комплекта мобилка.png',
                 f'{E}/tetrasis/Страница товара из комплекта мобилка.png',
                 f'{E}/tetrasis/375w light.png'], 1624),
        ('src', f'{E}/tetrasis/1920w light.png'),
        ('src', f'{E}/tetrasis/Кнопки.png'),
    ],
    'ubiray-rf': [
        ('src', f'{E}/ubiray-rf/Лента 1440px.png'),
        ('src', f'{E}/ubiray-rf/Фото 1440px-1.png'),
        ('mob', [f'{E}/ubiray-rf/Лента (мобилка).png', f'{E}/ubiray-rf/Фото (мобилка).png',
                 f'{E}/ubiray-rf/Карьера (мобилка).png'], 1624),
        ('src', f'{E}/ubiray-rf/Видео 1440px-1.png'),
        ('src', f'{E}/ubiray-rf/Карьера 1440px.png'),
        ('src', f'{E}/ubiray-rf/Лента 1200px.png'),
    ],
    'lotus': [
        ('src', f'{F}/Imperator/main.png'),
        ('src', f'{F}/Imperator/1440px@2x.png'),
        ('src', f'{F}/Imperator/1440px@2x-3.png'),
        ('mob', [f'{F}/Imperator/375px@2x.png', f'{F}/Imperator/375px@2x-3.png',
                 f'{F}/Imperator/375px@2x-2.png'], 1624),
        ('src', f'{F}/Imperator/1440px@2x-1.png'),
        ('src', f'{F}/Imperator/1440px@2x-2.png'),
        ('src', f'{F}/Imperator/838px@2x.png'),
    ],
    'reckon': [
        ('src', f'{F}/reckon/Main container.png'),
        ('src', f'{F}/reckon/Детальная карточка товара.png'),
        ('mob', [f'{F}/reckon/Main container-4.png', f'{F}/reckon/Детальная карточка товара-4.png',
                 f'{F}/reckon/Check.png'], 1624),
        ('src', f'{F}/reckon/Детальная карточка товара-1.png'),
        ('src', f'{F}/reckon/кампейн на сайт 1.png'),
    ],
    'svarnoy52': [
        ('src', f'{F}/svarnoy52/desk-main.png'),
        ('src', f'{F}/svarnoy52/desk-catalog.png'),
        ('mob', [f'{F}/svarnoy52/mob-main.png', f'{F}/svarnoy52/mob-catalog.png',
                 f'{F}/svarnoy52/mob-product.png'], 1624),
        ('src', f'{F}/svarnoy52/desk-product.png'),
        ('src', f'{F}/svarnoy52/desk-about.png'),
    ],
    'svarprom-nn': [
        ('src', f'{F}/svarprom-nn/desk-main.png'),
        ('src', f'{F}/svarprom-nn/desk-catalog.png'),
        ('mob', [f'{F}/svarprom-nn/mob-main.png', f'{F}/svarprom-nn/mob-catalog.png',
                 f'{F}/svarprom-nn/mob-about.png'], 1624),
        ('src', f'{F}/svarprom-nn/desk-product.png'),
        ('src', f'{F}/svarprom-nn/desk-about.png'),
    ],
}


def load(rel):
    path = os.path.join(SRC, rel)
    if not os.path.exists(path):
        # имена из macOS/Figma бывают в NFD («й» двумя символами) — ищем по NFC
        import unicodedata
        d, n = os.path.split(path)
        want = unicodedata.normalize('NFC', n)
        path = next(os.path.join(d, f) for f in os.listdir(d) if unicodedata.normalize('NFC', f) == want)
    return Image.open(path).convert('RGB')


def fit(im):
    w, h = im.size
    if w > W:
        im = im.resize((W, round(h * W / w)), Image.LANCZOS)
    if im.size[1] > MAX_H:
        im = im.crop((0, 0, im.size[0], MAX_H))
    return im


def phones(paths, frame_h):
    # кадр телефона: верх экрана высотой frame_h при ширине 750
    shots = []
    for p in paths:
        im = load(p)
        im = im.resize((750, round(im.size[1] * 750 / im.size[0])), Image.LANCZOS)
        shots.append(im.crop((0, 0, 750, min(frame_h, im.size[1]))))
    gap, pad = 72, 120
    h = max(s.size[1] for s in shots)
    out = Image.new('RGB', (pad * 2 + 750 * len(shots) + gap * (len(shots) - 1), h + pad * 2), BG)
    for i, s in enumerate(shots):
        out.paste(s, (pad + i * (750 + gap), pad))
    return fit(out)


def save(im, slug, name):
    path = os.path.join(OUT, slug, name)
    im.save(path, quality=Q, optimize=True, progressive=True)
    return {'file': f'/cases/{slug}/{name}', 'w': im.size[0], 'h': im.size[1]}


only = sys.argv[1:]
sizes = {}
if os.path.exists('sizes.json'):
    sizes = json.load(open('sizes.json', encoding='utf-8'))
for slug, items in M.items():
    if only and slug not in only:
        continue
    os.makedirs(os.path.join(OUT, slug), exist_ok=True)
    res = []
    for i, it in enumerate(items, 1):
        name = f'{i:02d}.jpg'
        kind = it[0]
        if kind == 'src':
            res.append(save(fit(load(it[1])), slug, name))
        elif kind == 'crop':
            im = load(it[1])
            res.append(save(fit(im.crop((0, it[2], im.size[0], min(it[3], im.size[1])))), slug, name))
        elif kind == 'mob':
            res.append(save(phones(it[1], it[2]), slug, name))
        elif kind == 'pair':
            r = save(fit(load(it[1])), slug, name)
            r['dark'] = save(fit(load(it[2])), slug, f'{i:02d}-dark.jpg')['file']
            res.append(r)
    sizes[slug] = res
    print(slug, len(res))
json.dump(sizes, open('sizes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
