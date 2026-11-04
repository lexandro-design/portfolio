# Шрифты сайта: только нужные подмножества в public/fonts и логотип кривыми.
# Запускать из корня репо, пока пакеты @fontsource-variable на месте.
import io
import os
import shutil
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

NM = 'node_modules/@fontsource-variable'
OUT = 'public/fonts'
os.makedirs(OUT, exist_ok=True)

for src, dst in [
    (f'{NM}/inter/files/inter-latin-wght-normal.woff2', 'inter-latin.woff2'),
    (f'{NM}/inter/files/inter-cyrillic-wght-normal.woff2', 'inter-cyrillic.woff2'),
    (f'{NM}/cormorant/files/cormorant-latin-wght-normal.woff2', 'cormorant-latin.woff2'),
    (f'{NM}/cormorant/files/cormorant-cyrillic-wght-normal.woff2', 'cormorant-cyrillic.woff2'),
    (f'{NM}/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-latin.woff2'),
]:
    shutil.copy(src, f'{OUT}/{dst}')


def rub(src, dst):
    """Знак рубля живёт в расширенной латинице: вместо 80 КБ берём один символ"""
    f = TTFont(src)
    o = Options()
    o.flavor = 'woff2'
    o.layout_features = []
    s = Subsetter(o)
    s.populate(unicodes=[0x20BD])
    s.subset(f)
    f.flavor = 'woff2'
    f.save(dst)


rub(f'{NM}/inter/files/inter-latin-ext-wght-normal.woff2', f'{OUT}/inter-rub.woff2')
rub(f'{NM}/cormorant/files/cormorant-latin-ext-wght-normal.woff2', f'{OUT}/cormorant-rub.woff2')

# логотип: Unbounded 800 кривыми, шрифт на сайт больше не грузится
f = TTFont(f'{NM}/unbounded/files/unbounded-latin-wght-normal.woff2')
f = instancer.instantiateVariableFont(f, {'wght': 800})
gs = f.getGlyphSet()
cmap = f.getBestCmap()
x = 0
parts = []
for ch in 'LEXANDRO':
    name = cmap[ord(ch)]
    pen = SVGPathPen(gs, ntos=lambda v: str(round(v)))
    gs[name].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
    parts.append(pen.getCommands())
    x += gs[name].width
cap = f['OS/2'].sCapHeight
print('LOGO', x, cap)
open('tools/logo-path.txt', 'w').write(f'{x} {cap}\n' + ''.join(parts))
for n in sorted(os.listdir(OUT)):
    print(n, os.path.getsize(f'{OUT}/{n}'))
