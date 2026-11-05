# Теперь нужен только ради sky.webp: карты Луны берутся из NASA, см. moon-nasa.py (этот скрипт пишет и свои, процедурные,
# складывать их в public/space не надо). Карта Луны и неба для фона сайта. Всё считается здесь, чужих текстур нет: моря и молодые
# кратеры стоят на своих настоящих местах, остальное случайно с постоянным сидом.
# python tools/space/bake.py [папка] [ширина]
import math, os, sys
import numpy as np
from numba import njit
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/space'
W = int(sys.argv[2]) if len(sys.argv) > 2 else 4096
H = W // 2
rng = np.random.default_rng(1969)
os.makedirs(OUT, exist_ok=True)

lon = ((np.arange(W, dtype=np.float32) + .5) / W - .5) * 2 * np.pi
lat = (.5 - (np.arange(H, dtype=np.float32) + .5) / H) * np.pi
LON, LAT = np.meshgrid(lon, lat)
P = np.stack([np.cos(LAT) * np.sin(LON), np.sin(LAT), np.cos(LAT) * np.cos(LON)], -1).astype(np.float32)


def vec(la, lo):
    la, lo = math.radians(la), math.radians(lo)
    return np.array([math.cos(la) * math.sin(lo), math.sin(la), math.cos(la) * math.cos(lo)], np.float32)


GRID = gaussian_filter(rng.standard_normal((96, 96, 96)).astype(np.float32), 1.0, mode='wrap')
GRID /= GRID.std()


def noise(scale, off=0.0):
    c = ((P * scale + off) % 96).reshape(-1, 3).T
    return map_coordinates(GRID, c, order=1, mode='grid-wrap').reshape(H, W)


def fbm(scale, octaves, off=0.0, gain=.5):
    out = np.zeros((H, W), np.float32)
    a = 1.0
    for i in range(octaves):
        out += a * noise(scale * 2 ** i, off + i * 17.3)
        a *= gain
    return out


def ang(c):
    return np.arccos(np.clip(P @ c, -1, 1))


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# Моря: широта, долгота, радиус в градусах. Океан Бурь собран из нескольких пятен
MARIA = [
    (33, -16, 21), (27, 18, 13.5), (8, 31, 16), (17, 59, 8.5), (-4, 51, 12), (-15, 35, 6.5),
    (-24, -39, 8.5), (-21, -17, 13.5), (-10, -30, 9),
    # Перемычки: Дождей, Ясности, Спокойствия и Изобилия в настоящем море сливаются
    (24, 3, 6.5), (13, 4, 6), (15, 22, 6), (2, 43, 7), (-8, 40, 5), (-2, -12, 7.5), (-14, -25, 7), *[(56 + 2 * math.sin(i), lo, 3.6) for i, lo in enumerate(range(-36, 44, 5))],
    (18, -57, 15), (30, -55, 12), (5, -52, 12.5), (-5, -48, 10), (42, -42, 9), (14, -40, 11), (25, -38, 12), (8, -20, 7),
    (20, 70, 3), (2, 85, 3.5), (-20, 75, 3), (33, 148, 2.6), (-20, -95, 4.2), (-35, 163, 3.2),
]
# Поле морей: мягкое слияние пятен, край рвёт фрактальный шум, поэтому пятна сливаются в одну неровную кайму
# Сфера перед замером искажается шумом: круги становятся лопастями и заливами, центры морей остаются на местах
def warped():
    w = np.stack([fbm(2.3, 4, 101.0 + 37 * i, .55) for i in range(3)], -1) * .085
    w += np.stack([fbm(7.5, 4, 301.0 + 41 * i, .55) for i in range(3)], -1) * .03
    q = P + w
    return q / np.linalg.norm(q, axis=-1, keepdims=True)


PW = warped()
field = np.zeros((H, W), np.float32)
for la, lo, r in MARIA:
    d = np.degrees(np.arccos(np.clip(PW @ vec(la, lo), -1, 1))) / r
    field += np.exp(-(d * 1.16) ** 4)
edge = (fbm(6.5, 7, 3.0, .62) * .30 + fbm(21, 5, 77.0, .6) * .16) * smooth(.02, .4, field)
mare = smooth(-.09, .13, field - .42 + edge)

# Рельеф материка: крупные бассейны, холмы, мелкая рябь
Hh = fbm(3.0, 7, 9.0, .5) * .03
Hh *= 1 - mare * .72

# Кратеры от крупных к мелким, в морях их почти нет
sizes = []
for r0, n in [(7.5, 14), (4.2, 42), (2.2, 150), (1.2, 560), (.62, 2300), (.33, 9000), (.17, 26000)]:
    sizes += list(r0 * rng.uniform(.62, 1.0, n))
sizes = np.array(sizes, np.float32)
u, v = rng.random(len(sizes)), rng.random(len(sizes))
cla = np.arcsin(2 * v - 1).astype(np.float32)
clo = ((u * 2 - 1) * np.pi).astype(np.float32)
fresh = (rng.random(len(sizes)) ** 3).astype(np.float32)
ci = np.clip(((.5 - cla / np.pi) * H).astype(np.int32), 0, H - 1)
cj = np.clip(((clo / (2 * np.pi) + .5) * W).astype(np.int32), 0, W - 1)
mare_at = mare[ci, cj]
keep = rng.random(len(sizes)) > mare_at * np.where(sizes > 1.2, .985, .9)
sizes, cla, clo, fresh = sizes[keep], cla[keep], clo[keep], fresh[keep]

# Настоящие молодые кратеры: широта, долгота, радиус, свежесть
NAMED = [(-43.3, -11.2, 1.45, 1), (9.6, -20.1, 1.6, 1), (8.1, -38, .55, 1), (23.7, -47.5, .62, 1), (51.6, -9.4, 1.7, .25),
         (-8.9, 61, 2.1, .55), (-11.4, 3.1, 1.9, .3), (16.1, 46.9, .4, 1), (-32.5, 54, .35, 1), (3.2, -13, 1.0, .5),
         (-8.9, -1.9, 1.5, .2), (-23.4, -13.7, 1.1, .3), (-58.4, -14.4, 3.4, .1), (18.7, -9.3, .7, .4)]
for la, lo, r, f in NAMED:
    sizes = np.append(sizes, np.float32(r))
    cla = np.append(cla, np.float32(math.radians(la)))
    clo = np.append(clo, np.float32(math.radians(lo)))
    fresh = np.append(fresh, np.float32(f))
order = np.argsort(-sizes)
sizes, cla, clo, fresh = sizes[order], cla[order], clo[order], fresh[order]


@njit(fastmath=True)
def stamp(Hm, Am, sizes, cla, clo, fresh, W, H):
    for k in range(sizes.shape[0]):
        R = math.radians(sizes[k])
        la0, lo0, f = cla[k], clo[k], fresh[k]
        ext = R * (2.6 + 3.0 * f)
        i0 = max(0, int((.5 - (la0 + ext) / math.pi) * H))
        i1 = min(H - 1, int((.5 - (la0 - ext) / math.pi) * H) + 1)
        depth = R * min(.42, .30 * sizes[k] ** -.22)
        rim = depth * .24
        sl, cl = math.sin(la0), math.cos(la0)
        big = sizes[k] > 1.0
        for i in range(i0, i1 + 1):
            la = (.5 - (i + .5) / H) * math.pi
            c = math.cos(la)
            dlo = min(ext / max(c, .02), math.pi)
            j0 = int(((lo0 - dlo) / (2 * math.pi) + .5) * W)
            j1 = int(((lo0 + dlo) / (2 * math.pi) + .5) * W) + 1
            s2 = math.sin(la)
            for jj in range(j0, j1 + 1):
                j = jj % W
                lo = ((j + .5) / W - .5) * 2 * math.pi
                cd = s2 * sl + c * cl * math.cos(lo - lo0)
                d = math.acos(min(1.0, max(-1.0, cd))) / R
                if d >= 2.6 + 3.0 * f:
                    continue
                if d < 1.0:
                    flat = .42 if big else .0
                    q = max(d, flat)
                    b = q * q
                    h = -depth * (1 - b) + rim
                    if big and d < .22:
                        h += depth * .38 * (1 - d / .22) ** 2
                    # Новый кратер съедает старый рельеф под собой
                    Hm[i, j] = Hm[i, j] * (.35 + .65 * d) + h
                    Am[i, j] += f * .13 * (1 - d * .4)
                else:
                    t = (d - 1) / 1.6
                    if t < 1:
                        Hm[i, j] += rim * (1 - t) ** 3
                    Am[i, j] += f * .14 * math.exp(-(d - 1) * 1.5)


Am = np.zeros((H, W), np.float32)
stamp(Hh, Am, sizes, cla, clo, fresh, W, H)

# Лучи молодых кратеров: узор по азимуту, длина своя у каждого
LUT = rng.random(4096).astype(np.float32)
for s in (160, 60, 18):
    LUT = LUT * .6 + gaussian_filter(rng.random(4096).astype(np.float32), s / 8, mode='wrap') * (s / 14)
LUT = (LUT - LUT.min()) / (LUT.max() - LUT.min())
rays = np.zeros((H, W), np.float32)
for la, lo, reach, power in [(-43.3, -11.2, 62, 1), (9.6, -20.1, 17, .8), (8.1, -38, 11, .65), (23.7, -47.5, 8, .55),
                             (16.1, 46.9, 9, .55), (-32.5, 54, 10, .5), (-8.9, 61, 15, .35), (46, 176, 30, .6)]:
    c = vec(la, lo)
    d = np.degrees(ang(c))
    e = np.cross(c, [0, 1, 0])
    e /= np.linalg.norm(e)
    az = (np.arctan2(P @ np.cross(c, e), P @ e) / (2 * np.pi) + .5) * 4096
    a = LUT[az.astype(np.int32) % 4096]
    wig = fbm(9, 3, la) * .5 + .5
    rays += power * np.clip(a * 1.9 - .72, 0, 1) ** 1.6 * np.exp(-d / (reach * .42)) * smooth(0, 1.8, d) * np.clip(wig, 0, 1)

grain = fbm(30, 4, 40.0)
mottled = fbm(6.5, 6, 21.0, .55)
south = smooth(.3, -.7, np.sin(LAT))
highland = .54 + south * .07 + mottled * .062 + grain * .016
# Лавы разного возраста: тёмные и светлые поля внутри одного моря, к берегу светлее
flows = fbm(2.6, 6, 50.0, .6)
sea = .185 + flows * .05 + (1 - smooth(.35, 1, mare)) * .05 + grain * .01
A = highland * (1 - mare) + sea * mare + Am * .9 + rays * .34
A = np.clip(A, .05, 1)

gx = (np.roll(Hh, -1, 1) - np.roll(Hh, 1, 1)) / (2 * 2 * np.pi / W) / np.maximum(np.cos(LAT), .08)
gy = (np.roll(Hh, 1, 0) - np.roll(Hh, -1, 0)) / (2 * np.pi / H)
gy[0] = gy[1]
gy[-1] = gy[-2]
print('slope p1 p50 p99', np.percentile(gx, [1, 50, 99]))


def save(a, name, q, size=None):
    im = Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8), 'L')
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(f'{OUT}/{name}.webp', quality=q, method=6)
    print(name, im.size, os.path.getsize(f'{OUT}/{name}.webp') // 1024, 'KB')


# Крутые склоны поджаты: в шейдере значение читается как наклон с запасом
ax = .5 + .5 * gx / (1 + np.abs(gx))
ay = .5 + .5 * gy / (1 + np.abs(gy))
# Яркость хранится в гамме 1/2.2, в шейдере разворачивается обратно
for tag, size in (('', (W // 2, H // 2)), ('-lo', (W // 4, H // 4))):
    save(A ** (1 / 2.2), f'moon-albedo{tag}', 72, size)
    save(ax, f'moon-nx{tag}', 66, size)
    save(ay, f'moon-ny{tag}', 66, size)

# Мелкий тайл для низкой орбиты: тот же рельеф в мелком масштабе, стыкуется сам с собой
T = 2048
f = np.fft.fftfreq(T)
fr = np.sqrt(f[:, None] ** 2 + f[None, :] ** 2)
fr[0, 0] = 1
spec = (rng.standard_normal((T, T)) + 1j * rng.standard_normal((T, T))) * fr ** -1.3
# Крупные волны убраны: на фоне страницы они читались бы пятнами под текстом
spec *= 1 - np.exp(-(fr * T / 14) ** 2)
tile = np.fft.ifft2(spec).real.astype(np.float32)
tile /= tile.std()
tile *= .35


@njit(fastmath=True)
def tile_craters(t, n, seed):
    np.random.seed(seed)
    T = t.shape[0]
    for k in range(n):
        R = 2.0 + 220.0 * np.random.random() ** 7
        cx, cy = np.random.random() * T, np.random.random() * T
        depth = .34 * R ** .5
        e = int(R * 2.2) + 1
        for y in range(int(cy) - e, int(cy) + e):
            for x in range(int(cx) - e, int(cx) + e):
                d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / R
                yy, xx = y % T, x % T
                if d < 1:
                    t[yy, xx] = t[yy, xx] * (.4 + .6 * d) - depth * (1 - d * d) + depth * .3
                elif d < 2.2:
                    t[yy, xx] += depth * .3 * (1 - (d - 1) / 1.2) ** 3


tile_craters(tile, 9000, 7)
tile = (tile - np.percentile(tile, .3)) / (np.percentile(tile, 99.7) - np.percentile(tile, .3))
save(tile, 'regolith', 80)

# Млечный Путь: мягкая полоса и пыль, на него ложатся звёзды
SW, SH = 2048, 1024
slon = ((np.arange(SW) + .5) / SW - .5) * 2 * np.pi
slat = (.5 - (np.arange(SH) + .5) / SH) * np.pi
LO, LA = np.meshgrid(slon, slat)
Ps = np.stack([np.cos(LA) * np.sin(LO), np.sin(LA), np.cos(LA) * np.cos(LO)], -1)
pole = np.array([.42, .80, -.43])
pole /= np.linalg.norm(pole)
g = Ps @ pole


def sn(scale, off):
    c = ((Ps * scale + off) % 96).reshape(-1, 3).T
    return map_coordinates(GRID, c, order=1, mode='grid-wrap').reshape(SH, SW)


def sf(scale, oct_, off):
    o = np.zeros((SH, SW))
    a = 1
    for i in range(oct_):
        o += a * sn(scale * 2 ** i, off + i * 9.1)
        a *= .55
    return o


band = np.exp(-(g / .17) ** 2) * .85 + np.exp(-(g / .42) ** 2) * .22
core = Ps @ (np.array([.60, -.28, .75]) / np.linalg.norm([.60, -.28, .75]))
band *= .5 + .9 * np.clip(core * .5 + .5, 0, 1) ** 2.4
dust = np.clip(sf(3.4, 6, 11) * .55 + .35, 0, 1) * np.exp(-(g / .13) ** 2)
glow = band * (.72 + sf(2.4, 5, 31) * .2) * (1 - dust * .82)
glow = np.clip(glow, 0, 1)
tint = np.clip(sf(1.6, 4, 61) * .5 + .5, 0, 1)
rgb = np.stack([glow * (.86 + tint * .2), glow * (.82 + tint * .04), glow * (.90 - tint * .1)], -1) * .5
Image.fromarray((np.clip(rgb, 0, 1) ** (1 / 2.2) * 255).astype(np.uint8)).save(f'{OUT}/sky.webp', quality=60, method=6)
print('sky', os.path.getsize(f'{OUT}/sky.webp') // 1024, 'KB')
