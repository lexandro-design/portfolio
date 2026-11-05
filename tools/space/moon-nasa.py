# Текстуры Луны для фона сайта из NASA CGI Moon Kit (NASA SVS 4720, общественное достояние):
# цвет LROC WAC и рельеф LOLA. Сырьё скачать отдельно, в репозитории его нет:
#   https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_8k.tif (48 МБ)
#   https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_16_uint.tif (32 МБ)
# python tools/space/moon-nasa.py <папка с tif> [папка вывода]
# Выход: moon-albedo (цвет), moon-nx / moon-ny (наклон поверхности на восток и на север, корень от |s|/SMAX),
# каждый в двух размерах: полный (цвет 6144 x 3072, рельеф 3072 x 1536) и -lo для слабых устройств (2048 / 1024).
# Полный цвет собран из 8k, -lo из него же. С 2026-11-05 полный комплект ≈ 2,5 МБ, до того цвет был 4096 x 2048. Шейдер раскодирует в shader.ts (SMAX там же)
import os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom

Image.MAX_IMAGE_PIXELS = None
SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else 'public/space'
SMAX = 0.5
R = 1737400.0
os.makedirs(OUT, exist_ok=True)

col = Image.open(os.path.join(SRC, 'lroc_color_poles_8k.tif')).convert('RGB')
dem = np.array(Image.open(os.path.join(SRC, 'ldem_16_uint.tif'))).astype(np.float32) * 0.5  # метры, ноль условный


def slopes(h):
    """Наклон на восток и на север по высотам в метрах на равнопромежуточной сетке"""
    H, W = h.shape
    lat = (.5 - (np.arange(H) + .5) / H) * np.pi
    dx = R * np.maximum(np.cos(lat), .06)[:, None] * (2 * np.pi / W)
    dy = R * np.pi / H
    e = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / (2 * dx)
    n = -(np.roll(h, -1, 0) - np.roll(h, 1, 0)) / (2 * dy)
    n[0] = n[1]
    n[-1] = n[-2]
    return e, n


def code(s):
    v = np.clip(np.abs(s) / SMAX, 0, 1) ** .5
    return np.clip(np.round((np.sign(s) * v * .5 + .5) * 255), 0, 255).astype(np.uint8)


def save(a, name, q):
    p = os.path.join(OUT, name + '.webp')
    Image.fromarray(a).save(p, 'WEBP', quality=q, method=6)
    print(name, a.shape[1], 'x', a.shape[0], os.path.getsize(p) // 1024, 'KB')


for tag, W, Wn, q, sg, qn in (('', 6144, 3072, 70, 1.0, 64), ('-lo', 2048, 1024, 74, 0.7, 72)):
    H, Hn = W // 2, Wn // 2
    c = col.resize((W, H), Image.LANCZOS)
    save(np.array(c), 'moon-albedo' + tag, q)
    h = np.array(Image.fromarray(dem).resize((Wn, Hn), Image.BICUBIC)) if Wn != dem.shape[1] else dem
    h = gaussian_filter(h, sg, mode='nearest')
    e, n = slopes(h)
    save(code(e), 'moon-nx' + tag, qn)
    save(code(n), 'moon-ny' + tag, qn)
