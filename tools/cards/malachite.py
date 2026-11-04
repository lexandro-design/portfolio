# Плита малахита для сайта: концентрические полосы вокруг нескольких «глазков», края полос рваные.
# python tools/cards/malachite.py <выход.webp> [зерно] [ширина] [высота]
import sys
import numpy as np
from PIL import Image, ImageFilter

out = sys.argv[1]
seed = int(sys.argv[2]) if len(sys.argv) > 2 else 7
W = int(sys.argv[3]) if len(sys.argv) > 3 else 2400
H = int(sys.argv[4]) if len(sys.argv) > 4 else 1400
rng = np.random.default_rng(seed)


def noise(scale):
    """Плавный шум: случайное поле, растянутое до размера плиты"""
    h, w = max(2, H // scale + 2), max(2, W // scale + 2)
    a = (rng.random((h, w)) * 255).astype(np.uint8)
    im = Image.fromarray(a).resize((W, H), Image.BICUBIC)
    return np.asarray(im, dtype=np.float32) / 255 - 0.5


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# Сдвиг координат шумом разного масштаба: полосы идут волной, а не кругами
wx = noise(520) * 380 + noise(170) * 90 + noise(50) * 14
wy = noise(520) * 380 + noise(170) * 90 + noise(50) * 14
x, y = xx + wx, yy + wy

# Глазки: у каждого своя система колец, стык двух систем даёт шов как в настоящем камне
eyes = [(rng.uniform(-0.1, 1.1) * W, rng.uniform(-0.1, 1.1) * H, rng.uniform(0.75, 1.3)) for _ in range(7)]
field = np.full((H, W), 1e9, dtype=np.float32)
for ex, ey, k in eyes:
    field = np.minimum(field, np.hypot(x - ex, (y - ey) * 1.15) * k)

# Полосы неравной ширины: фаза плывёт вместе с крупным шумом
phase = field / 15 + noise(300) * 7 + noise(90) * 1.6
bands = 0.5 + 0.5 * np.sin(phase)
fine = 0.5 + 0.5 * np.sin(phase * 3.7 + noise(120) * 3)
v = 0.62 * bands**1.6 + 0.38 * fine**2.2

ramp = np.array([
    [2, 16, 12], [4, 30, 23], [8, 48, 37], [13, 70, 54], [24, 96, 74], [50, 128, 100],
], dtype=np.float32)
t = np.clip(v, 0, 1) * (len(ramp) - 1)
i = np.clip(t.astype(int), 0, len(ramp) - 2)
f = (t - i)[..., None]
rgb = ramp[i] * (1 - f) + ramp[i + 1] * f

# Полировка: широкий мягкий блик сверху и затемнение к низу
gloss = np.exp(-(((xx / W - 0.32) / 0.5) ** 2 + ((yy / H - 0.05) / 0.5) ** 2))[..., None]
shade = (1 - 0.42 * (yy / H) ** 1.4)[..., None]
rgb = rgb * shade * (0.82 + 0.34 * gloss)
rgb += rng.normal(0, 1.1, rgb.shape)
im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
im.save(out, quality=74, method=6)
print(out, im.size)
