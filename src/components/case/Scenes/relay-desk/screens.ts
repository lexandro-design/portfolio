/**
 * Экраны прототипа и его карта кликов. Координаты областей сняты с макета, в пикселях экрана 1440.
 * Назначение области: id экрана или «y<число>» для прокрутки внутри экрана
 */

export type Hot = { x: number; y: number; w: number; h: number; to: string }
export type Screen = {
  id: string
  name: string
  /** Высота экрана в макете */
  h: number
  /** Кадры экрана: файл, отступ сверху и высота. Главная собрана из трёх частей */
  parts: [file: string, top: number, height: number][]
  hot: Hot[]
}

/** Шапка одна на всех экранах: логотип, пять разделов и кнопка доступа */
const HEADER =
  '64 16 131 32 home;449 16 78 32 board;537 16 78 32 desks;625 16 62 32 log;697 16 78 32 plans;785 16 86 32 manual;1157 8 219 48 access'

const CARDS = (y: number, to: string) => [64, 512, 960].map((x) => `${x} ${y} 416 392 ${to}`).join(';')
const LINES = (x: number, y: number, w: number, n: number) =>
  Array.from({ length: n }, (_, i) => `${x} ${y + i * 40} ${w} 40 log`).join(';')
const TASKS = (y: number, h = 260) => [64, 400, 736, 1072].map((x) => `${x} ${y} 304 ${h} task`).join(';')

const RAW: [id: string, name: string, h: number, hot: string, parts?: Screen['parts']][] = [
  [
    'home',
    'Home',
    11591,
    `64 336 235 64 board;315 336 215 64 manual;64 852 240 16 y900;464 1652 209 48 board;737 1332 304 260 task;64 3780 416 392 desk;960 3780 416 392 desk;96 5120 159 48 signoff;271 5120 259 48 board;1227 6710 149 48 desks;${CARDS(6822, 'desk')};${CARDS(7246, 'desk')};1157 8558 219 48 log;64 9062 416 584 access;512 9062 416 584 access;960 9062 416 584 access;464 10530 235 64 access;723 10530 215 64 manual`,
    [
      ['home-1', 0, 4364],
      ['home-2', 4268, 4434],
      ['home-3', 8702, 2889],
    ],
  ],
  [
    'board',
    'Board',
    2876,
    `1207 472 169 48 task;258 628 136 40 task;433 628 206 40 task;678 628 171 40 task;923 628 206 40 task;328 692 276 40 task;643 692 241 40 task;958 692 276 40 task;258 756 206 40 task;503 756 171 40 task;713 756 206 40 task;993 756 206 40 task;398 820 206 40 task;643 820 136 40 task;853 820 241 40 task;293 884 311 40 task;643 884 136 40 task;818 884 276 40 task;1028 948 206 40 task;${TASKS(1272)}`,
  ],
  [
    'task',
    'Task',
    2520,
    `312 832 49 76 board;494 832 69 76 desk;686 832 69 78 desk;878 832 69 76 desk;1075 832 59 76 signoff;1257 832 79 76 signoff;341 1688 219 48 board;${LINES(624, 1168, 752, 8)}`,
  ],
  [
    'desks',
    'Desks',
    2732,
    `${CARDS(552, 'desk')};${CARDS(976, 'desk')};${[64, 256, 448, 640, 832, 1024].map((x) => `${x} 1640 80 140 desk`).join(';')};1216 1640 80 140 signoff`,
  ],
  [
    'desk',
    'Desk',
    2608,
    `258 1144 206 40 task;503 1144 171 40 task;713 1144 206 40 task;993 1144 206 40 task;64 1300 304 260 task;64 1624 304 232 task;${LINES(400, 1332, 976, 8)}`,
  ],
  ['log', 'Log', 2040, ''],
  [
    'signoff',
    'Sign-off',
    3056,
    '64 584 304 260 task;64 860 304 260 task;64 1136 304 260 task;591 1548 275 64 board;64 2044 304 260 task;400 2044 304 260 task;736 2044 304 232 task;1072 2044 304 232 task',
  ],
  ['plans', 'Plans', 3480, '64 552 416 584 access;512 552 416 584 access;960 552 416 584 access'],
  [
    'manual',
    'Manual',
    5356,
    '64 504 304 48 y432;64 552 304 48 y1116;64 600 304 48 y1728;64 648 304 48 y2564;64 696 304 48 y3128;64 744 304 48 y3928;544 3496 304 260 task',
  ],
  ['changelog', 'Changelog', 2568, ''],
  ['access', 'Access', 2032, ''],
  ['e404', '404', 1648, '64 616 265 64 board;345 616 185 64 log'],
]

const parse = (s: string): Hot[] =>
  s
    .split(';')
    .filter(Boolean)
    .map((row) => {
      const [x, y, w, h, to] = row.split(' ')
      return { x: +x, y: +y, w: +w, h: +h, to }
    })

export const SCREENS: Screen[] = RAW.map(([id, name, h, hot, parts]) => ({
  id,
  name,
  h,
  parts: parts ?? [[id, 0, h]],
  // Крупные области ниже мелких: мелкая остаётся кликабельной поверх
  hot: parse(`${HEADER};${hot}`)
    .filter((a) => a.to !== id)
    .sort((a, b) => b.w * b.h - a.w * a.h),
}))

/** Экран, с которого начинается показ: доска, главный маршрут прототипа «доска, задача, стол» */
export const START = 'board'
