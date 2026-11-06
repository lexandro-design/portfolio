# Обложки с настоящими роликами кейса. Запускать из корня репо после tools/cards/stage.mjs
#   parfumeria: окно с главной сайта, в нём третий баннер Issey, вокруг размытый тот же ролик
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1216, 860
TMP = 'tools/cards/.motion'
ENC = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an']
# Ролик главной Parfumeria лежит в репо сайта
ISSEY = '../parfumeria-next/public/video/hero-issey.mp4'


def run(args):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', *args], check=True)


def parfumeria():
    x, y, ww = 56, 92, 1104
    k = ww / 1440
    vh = round(875 * k)
    # Шапка, текст и полоса разделов сняты с локальной главной поверх прозрачного фона
    ui = Image.open('tools/cards/src/parfumeria-ui.webp').convert('RGBA')
    page = Image.new('RGBA', (ww, ui.height), (0, 0, 0, 0))
    ImageDraw.Draw(page).rectangle((0, vh, ww, ui.height), fill=(255, 255, 255, 255))
    page.alpha_composite(ui)
    r = 20
    corners = Image.new('L', (ww, ui.height), 0)
    ImageDraw.Draw(corners).rounded_rectangle((0, 0, ww - 1, ui.height + r), r, fill=255)
    page.putalpha(Image.composite(page.getchannel('A'), Image.new('L', page.size, 0), corners))
    top = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    top.paste(page, (x, y), page)
    top.save(f'{TMP}-top.png')
    corners.crop((0, 0, ww, vh)).save(f'{TMP}-mask.png')
    shade = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shade).rounded_rectangle((x, y + 24, x + ww, H + 80), r, fill=150)
    shadow = Image.new('RGBA', (W, H), (10, 40, 90, 0))
    shadow.putalpha(shade.filter(ImageFilter.GaussianBlur(38)))
    shadow.save(f'{TMP}-shadow.png')
    graph = (
        '[0:v]fps=30,crop=1580:960:0:0,split=2[a][b];'
        f'[a]scale=-2:{H},crop={W}:{H}:0:0,gblur=sigma=34,eq=saturation=1.25:brightness=-0.02[bg];'
        f'[b]scale={ww}:{vh},format=rgba[s];[3:v]format=gray[m];[s][m]alphamerge[sharp];'
        '[bg][1:v]overlay=0:0:shortest=1[l1];'
        f'[l1][sharp]overlay={x}:{y}:shortest=1[l2];'
        '[l2][2:v]overlay=0:0:shortest=1,format=yuv420p[out]'
    )
    args = ['-i', ISSEY, '-loop', '1', '-i', f'{TMP}-shadow.png', '-loop', '1', '-i', f'{TMP}-top.png', '-loop', '1', '-i', f'{TMP}-mask.png', '-filter_complex', graph, '-map', '[out]', '-t', '8']
    run([*args, *ENC, 'public/cases/parfumeria/card.mp4'])
    run(['-ss', '3.2', '-i', 'public/cases/parfumeria/card.mp4', '-frames:v', '1', '-q:v', '3', 'public/cases/parfumeria/card.jpg'])


JOBS = {'parfumeria': parfumeria}
for name in sys.argv[1:] or JOBS:
    JOBS[name]()
import glob
import os
for f in glob.glob(f'{TMP}-*'):
    os.remove(f)
print('готово')
