"""Форматы фото для первого экрана: python tools/me/photo-formats.py <снимок> <имя>

Режет снимок в 4:5 и кладёт шесть файлов в public/me/<имя>/. Монохромные форматы это маски:
рисунок лежит в альфа-канале, цвет даёт тема. Потом добавить "/me/<имя>" в heroPhotos в
src/content/data/site.json, порядок в списке это порядок показа.

Откуда кадрировать, решает --focus x,y (доли от 0 до 1, по умолчанию центр).
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

W, H = 720, 900
INK = (245, 245, 242)
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16 + 1 / 32


def fit(path, focus):
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    return ImageOps.fit(im, (W, H), Image.LANCZOS, centering=focus)


def tone(im):
    """Яркость 0..1 с растянутым диапазоном, чтобы фигура читалась в одном бите"""
    g = np.asarray(ImageOps.autocontrast(im.convert('L'), cutoff=1), dtype=np.float32) / 255
    return g ** 0.9


def mask(a):
    out = np.zeros((H, W, 4), np.uint8)
    out[..., :3] = INK
    out[..., 3] = a
    return Image.fromarray(out)


def lines(g, step=6):
    """Гравюра: горизонтальные штрихи, чем светлее место, тем толще"""
    a = np.zeros((H, W), np.uint8)
    rows = np.arange(H)
    for y0 in range(0, H, step):
        band = g[y0:y0 + step].mean(axis=0)
        thick = np.round(band * step).astype(int)
        for k, y in enumerate(rows[y0:y0 + step]):
            a[y] = np.where(k < thick, 255, 0)
    return mask(a)


def dots(g, cell=4):
    """Упорядоченный дизеринг крупным зерном"""
    s = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((W // cell, H // cell), Image.BOX), dtype=np.float32) / 255
    t = np.tile(BAYER, (s.shape[0] // 4 + 1, s.shape[1] // 4 + 1))[: s.shape[0], : s.shape[1]]
    a = ((s > t) * 255).astype(np.uint8)
    return mask(np.kron(a, np.ones((cell, cell), np.uint8)))


def ascii_art(g, cell=(6, 10)):
    """Символы по яркости"""
    ramp = " .:-=+*#%@"
    font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 10)
    cw, ch = cell
    a = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(a)
    for y in range(0, H, ch):
        for x in range(0, W, cw):
            v = float(g[y:y + ch, x:x + cw].mean())
            d.text((x, y - 1), ramp[min(len(ramp) - 1, int(v ** 0.6 * len(ramp)))], fill=255, font=font)
    return mask(np.asarray(a))


def halftone(g, cell=10, scale=3):
    """Круглая растровая точка, рисуется крупнее и сжимается, отсюда мягкий край"""
    a = Image.new('L', (W * scale, H * scale), 0)
    d = ImageDraw.Draw(a)
    for y in range(0, H, cell):
        for x in range(0, W, cell):
            r = float(g[y:y + cell, x:x + cell].mean()) ** 0.5 * cell * 0.72 * scale
            cx, cy = (x + cell / 2) * scale, (y + cell / 2) * scale
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    return mask(np.asarray(a.resize((W, H), Image.LANCZOS)))


def pixels(im, cell=24):
    """Крупные пиксели с тонкой сеткой"""
    p = im.resize((W // cell, H // cell + 1), Image.BOX).resize((W, (H // cell + 1) * cell), Image.NEAREST).crop((0, 0, W, H))
    a = np.asarray(p).copy()
    a[::cell] = (a[::cell] * 0.72).astype(np.uint8)
    a[:, ::cell] = (a[:, ::cell] * 0.72).astype(np.uint8)
    return Image.fromarray(a)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('photo')
    ap.add_argument('name')
    ap.add_argument('--focus', default='0.5,0.5')
    ap.add_argument('--out', default='public/me')
    o = ap.parse_args()
    im = fit(o.photo, tuple(float(v) for v in o.focus.split(',')))
    g = tone(im)
    d = Path(o.out) / o.name
    d.mkdir(parents=True, exist_ok=True)
    im.save(d / 'photo.jpg', quality=84, optimize=True, progressive=True)
    lines(g).save(d / 'lines.png', optimize=True)
    dots(g).save(d / 'dots.png', optimize=True)
    ascii_art(g).save(d / 'ascii.png', optimize=True)
    halftone(g).save(d / 'halftone.png', optimize=True)
    pixels(im).save(d / 'pixels.jpg', quality=82, optimize=True)
    print(f'Готово: {d}. Добавь "/me/{o.name}" в heroPhotos в src/content/data/site.json')


if __name__ == '__main__':
    main()
