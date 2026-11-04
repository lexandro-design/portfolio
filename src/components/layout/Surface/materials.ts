import { FRAGMENT } from '../Steel/shader'

/** Примерочная фона: материалы считаются по координате, текстур нет. Каждый отдаёт
    цвет как есть, finish укладывает его в полосу яркости темы и красит оттенком,
    поэтому токены текста остаются читаемыми на любом материале */

const HEAD = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uScroll;
uniform float uDpr;
uniform float uTime;
uniform vec2 uIn;
uniform vec2 uBand;
uniform vec3 uTint;
uniform float uAmount;
uniform float uSat;
`

const FINISH = `
float luma(vec3 c) { return dot(c, vec3(.2126, .7152, .0722)); }

vec3 finish(vec3 c) {
  float l = luma(c);
  c = mix(c, uTint * (l / luma(uTint)), uAmount);
  float t = mix(uBand.x, uBand.y, clamp((l - uIn.x) / (uIn.y - uIn.x), 0., 1.));
  c *= t / max(luma(c), .015);
  /* Тёмный цвет, поднятый в светлую полосу, становится кислотным: там он бледнее */
  c = mix(vec3(t), c, uSat);
  float over = max(max(c.r, max(c.g, c.b)) - 1., 0.);
  return clamp(mix(c, vec3(t), min(over * 1.5, 1.)), 0., 1.);
}
`

const TOOLS = `
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}

float fbm(vec2 p) {
  float a = .5, s = 0.;
  for (int i = 0; i < 3; i++) {
    s += a * noise(p);
    p = p * 2.03 + 17.;
    a *= .5;
  }
  return s / .875;
}

mat2 turn(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

/* Лампа за курсором: широкое пятно, w и h доли экрана */
float lamp(vec2 s, vec2 size, float w, float h) {
  vec2 d = (s - uLight) / (size * vec2(w, h) + 60.);
  return exp(-dot(d, d));
}

/* Звёздная пыль вспыхивает у лампы, края чуть светятся */
vec3 cosmos(vec3 c, vec2 s, vec2 q, vec2 size) {
  vec2 id = floor(q / 72.);
  vec2 f = fract(q / 72.) - .5 - (vec2(hash(id + 3.), hash(id + 7.)) - .5) * .7;
  float star = step(.88, hash(id)) * exp(-dot(f, f) * 2200.);
  float near = exp(-dot(s - uLight, s - uLight) / 70000.);
  vec2 e = (s / size - .5) * 2.;
  float edge = smoothstep(.5, 1.5, dot(e * e, e * e));
  return c + star * (.1 + .9 * near) * vec3(.9, .92, 1.) + edge * vec3(.05, .05, .13);
}
`

const body = (code: string) => `${HEAD}${FINISH}${TOOLS}
${code}
void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 size = uRes / uDpr;
  vec2 q = s + vec2(0., uScroll);
  gl_FragColor = vec4(finish(paint(s, q, size)), 1.);
}
`

/* Шлифованная сталь: тот же лист, что в теме, меняется только последняя строка */
const STEEL = FRAGMENT.replace('uniform float uDpr;', `uniform float uDpr;\nuniform vec2 uIn;\nuniform vec2 uBand;\nuniform vec3 uTint;\nuniform float uAmount;\nuniform float uSat;\n${FINISH}`).replace(
  'gl_FragColor = vec4(mix(dark, lite, v), 1.);',
  'gl_FragColor = vec4(finish(mix(dark, lite, v)), 1.);',
)

const TITANIUM = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  float g = noise(q * 1.4) * .5 + noise(q * 2.9 + 7.) * .3 + noise(q * .45) * .2;
  float hair = noise(q * vec2(.012, 1.1)) - .5;
  float l = lamp(s, size, .42, .62);
  float room = .4 + (fbm(q * .0013) - .5) * .3;
  float v = room + l * .36 + (g - .5) * .2 + hair * .1;
  /* Плёнка окисла: еле заметные цвета побежалости у лампы */
  float film = fbm(q * .0007 + 40.) * 1.2 + l * .4;
  vec3 temper = .5 + .5 * cos(6.283 * (film + vec3(.0, .12, .3)));
  return v * mix(vec3(.97, .97, 1.), temper * 1.4, .08 + l * .08);
}
`)

const ANODIZED = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  float grain = noise(q * vec2(.32, 2.4)) - .5;
  float fine = noise(q * 3.1) - .5;
  float l = lamp(s, size, .6, .3);
  float band = .5 + .5 * sin(s.y / size.y * 3.1 + 1.1 + (fbm(q * .001) - .5) * 1.4);
  float v = .3 + band * .24 + l * .34 + grain * .09 + fine * .05;
  return v * vec3(.72, .84, 1.05);
}
`)

const COPPER = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  /* Точёный диск: штрихи кругами, блики расходятся веером от центра */
  vec2 c = vec2(size.x * 1.08, -size.y * .22 + uScroll * .15);
  vec2 p = s - c;
  float r = length(p);
  float a = atan(p.y, p.x);
  vec2 lp = uLight - c;
  float la = atan(lp.y, lp.x);
  float ring = noise(vec2(r * 1.25, a * 3.)) * .6 + noise(vec2(r * .34, a * 9.) + 11.) * .4;
  float fan = pow(abs(cos(a - la)), 46.) + .55 * pow(abs(cos(a - la + .55)), 90.) + .4 * pow(abs(cos(a - la - .7)), 70.);
  float v = .26 + fan * .5 + (ring - .5) * .2;
  float brass = fbm(q * .0012 + 5.);
  vec3 tone = mix(vec3(1.05, .62, .4), vec3(1.02, .78, .42), brass);
  return v * tone + fan * vec3(.16, .13, .1);
}
`)

const CHROME = body(`
float strips(float t) {
  return .9 * exp(-pow((t - .2) / .05, 2.)) + .5 * exp(-pow((t - .36) / .018, 2.))
    + .75 * exp(-pow((t - .68) / .09, 2.)) + .3 * exp(-pow((t - .9) / .03, 2.));
}

vec3 paint(vec2 s, vec2 q, vec2 size) {
  vec2 uv = s / size;
  float wob = (fbm(q * .0011) - .5) * .28 + (noise(q * .005) - .5) * .02;
  float t = uv.y + wob + (uLight.y / size.y - .5) * .22 + (uv.x - .5) * .16;
  float v = .07 + strips(fract(t)) * .55;
  v += lamp(s, size, .2, .34) * .16;
  return v * vec3(.94, .98, 1.06);
}
`)

const GUNMETAL = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  /* Кованая поверхность: каждая вмятина ловит лампу своим склоном, кромки сглажены */
  vec2 g = q / 34.;
  vec2 id = floor(g);
  vec2 best = vec2(9.);
  float d1 = 9., d2 = 9.;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 n = vec2(float(i), float(j));
      vec2 o = n + vec2(hash(id + n), hash(id + n + 19.)) - fract(g);
      float d = dot(o, o);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        best = o;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  float soft = smoothstep(0., .5, sqrt(d2) - sqrt(d1));
  vec2 to = normalize(normalize(uLight - s + .001) + vec2(-.4, -.9));
  float slope = dot(best, to) * soft * .26;
  float l = lamp(s, size, .46, .6);
  float v = .28 + slope * (.5 + l * .7) + l * .26 + (noise(q * 1.7) - .5) * .05 + (fbm(q * .0015) - .5) * .12;
  return v * vec3(.84, .92, 1.04);
}
`)

const CARBON = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  /* Саржа 2 на 2: жгуты вдоль и поперёк по-разному ловят лампу */
  float tow = 9.;
  vec2 id = floor(q / tow);
  vec2 f = fract(q / tow);
  bool warp = mod(id.x + id.y, 4.) < 2.;
  float across = warp ? f.x : f.y;
  float along = warp ? q.y : q.x;
  float round_ = sin(across * 3.1416);
  float fiber = noise(vec2((warp ? q.x : q.y) * 2.4, along * .04));
  vec2 d = (s - uLight) / (size * vec2(.3, .36) + 60.);
  float sheen = warp ? exp(-d.x * d.x * 2.4 - d.y * d.y * .3) : exp(-d.y * d.y * 2.4 - d.x * d.x * .3);
  float coat = lamp(s, size, .5, .5);
  float v = .1 + round_ * .12 + sheen * .4 * round_ + (fiber - .5) * .08 + coat * .1;
  return v * vec3(.96, .98, 1.03);
}
`)

const DENIM = body(`
float stitch(float along, float at, float pos) {
  float dash = step(.32, fract(along / 15.));
  return dash * (1. - smoothstep(.8, 1.7, abs(pos - at)));
}

vec3 paint(vec2 s, vec2 q, vec2 size) {
  /* Саржа: диагональный рубчик, белый уток просвечивает сквозь индиго */
  float rib = .5 + .5 * sin((q.x + q.y) * 1.48);
  float warpSlub = noise(q * vec2(.9, .018));
  float weftSlub = noise(q * vec2(.022, .95) + 31.);
  float wear = smoothstep(.42, .78, fbm(q * .0024 + 3.));
  float whisk = smoothstep(.62, .9, noise(vec2(q.x * .012 + q.y * .003, q.y * .0016)));
  float white = rib * .24 + (weftSlub - .5) * .34 + wear * .3 + whisk * .12 + (warpSlub - .5) * .1;
  vec3 c = mix(vec3(.07, .13, .3), vec3(.56, .66, .82), clamp(white, 0., 1.));
  c *= .86 + lamp(s, size, .4, .5) * .34;

  /* Швы: подгиб по краям и кокетка поперёк, двойная строчка рыжей ниткой */
  vec3 thread = vec3(.96, .62, .22);
  float yoke = mod(q.y, 1500.) - 872.;
  float fold = 1. - smoothstep(9., 11., abs(yoke));
  c *= 1. + fold * .16 - (1. - smoothstep(0., 3., abs(abs(yoke) - 11.))) * .4;
  float st = stitch(q.x, 7., abs(yoke));
  float edge = size.x > 900. ? 1. : 0.;
  float side = min(s.x, size.x - s.x) - 26.;
  float hem = edge * (1. - smoothstep(9., 11., abs(side)));
  c *= 1. + hem * .16 - edge * (1. - smoothstep(0., 3., abs(abs(side) - 11.))) * .4;
  st = max(st, edge * stitch(q.y, 7., abs(side)));
  c = mix(c, thread, st * .9);
  return cosmos(c, s, q, size);
}
`)

const WOOL = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  /* Войлок: короткие волокна лежат вразнобой, поверх мягкие пятна уваливания */
  float f1 = noise(turn(.6) * q * vec2(.1, 1.05));
  float f2 = noise(turn(-1.1) * q * vec2(.11, 1.) + 9.);
  float f3 = noise(turn(2.2) * q * vec2(.14, .85) + 21.);
  float fibres = (f1 + f2 + f3) / 3. - .5;
  float mott = fbm(q * .0075);
  float cloud = fbm(q * .0014 + 60.);
  float v = .3 + fibres * .42 + (mott - .5) * .22 + (cloud - .5) * .2 + lamp(s, size, .5, .55) * .2;
  /* Редкие цветные волокна: меланж */
  float fleck = step(.965, noise(turn(.9) * q * vec2(.16, 1.3) + 44.));
  vec3 c = v * vec3(1., .97, .94) + fleck * vec3(.12, .03, .0);
  return cosmos(c, s, q, size);
}
`)

const FUR = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  /* Ворс причёсан вниз с плавными завитками, у лампы отклоняется от неё */
  float swirl = (fbm(q * .0016) - .5) * 2.;
  vec2 dir = turn(swirl) * vec2(.16, 1.);
  vec2 away = s - uLight;
  float r = length(away);
  float push = exp(-r * r / 34000.);
  dir = normalize(dir + away / (r + 1.) * push * 2.6);

  /* Прядь: шум протягивается вдоль ворса */
  float strand = 0.;
  float wide = 0.;
#ifdef LOW
  const int TAPS = 4;
  float stepLen = 7.;
#else
  const int TAPS = 8;
  float stepLen = 3.6;
#endif
  for (int i = 0; i < TAPS; i++) {
    vec2 p = q - dir * float(i) * stepLen;
    strand += noise(p * .85);
    wide += noise(p * .2 + 13.);
  }
  strand /= float(TAPS);
  wide /= float(TAPS);

  float tips = smoothstep(.34, .66, strand);
  float depth = smoothstep(.3, .72, wide);
  float l = lamp(s, size, .36, .5);
  float v = .1 + tips * .34 + depth * .3 + l * .16 * tips;
  /* Где ворс разошёлся, виден тёмный подшёрсток */
  v *= 1. - exp(-r * r / 5200.) * .5;
  vec3 c = v * mix(vec3(1.02, .9, .8), vec3(.98, .96, 1.), depth);
  return cosmos(c, s, q, size);
}
`)

const MERCURY = body(`
float wave(vec2 s, vec2 q) {
  vec2 p = q * .0021;
  float t = uTime * .11;
  vec2 d = s - uLight;
  float r = length(d) + 1.;
  /* Металл расступается у лампы и бежит кольцом */
  p += d / (r + 90.) * exp(-r * .0042) * (.34 + .1 * sin(r * .03 - uTime * 2.));
  p += .62 * sin(p.yx * 1.7 + vec2(t, -t * .8));
  p += .38 * sin(p.yx * 3.1 + vec2(-t * 1.3, t));
  return sin(p.x * 2.1) + cos(p.y * 2.4);
}

vec3 paint(vec2 s, vec2 q, vec2 size) {
  float h = wave(s, q);
  float e = 4.;
  vec2 n = vec2(wave(s + vec2(e, 0.), q + vec2(e, 0.)) - h, wave(s + vec2(0., e), q + vec2(0., e)) - h) * 9.;
  /* Зеркало: складки отражают тёмный потолок и две полосы света */
  float t = h * .34 + n.y * .34 + n.x * .12;
  float v = .1 + .34 * (.5 + .5 * cos(t * 5.2));
  v += .66 * pow(.5 + .5 * cos(t * 5.2 + 1.2), 7.);
  v += .3 * pow(.5 + .5 * cos(t * 11. + .4), 12.);
  return v * vec3(.95, .98, 1.04);
}
`)

const HOLO = body(`
vec3 paint(vec2 s, vec2 q, vec2 size) {
  vec2 uv = s / size;
  vec2 l = uLight / size;
  /* Цвет зависит от угла к лампе, поэтому переливается за курсором */
  float ang = dot(uv - l, vec2(.72, .46)) * 1.1 + (fbm(q * .0014) - .5) * .7;
  float micro = (noise(q * 2.2) - .5) * .05 + sin((q.x - q.y) * .6) * .012;
  /* Фольга не радуга: холодные голубой и сиреневый переходят в тёплый персик */
  float w = .5 + .5 * sin(6.283 * (ang + micro));
  float w2 = .5 + .5 * sin(6.283 * (ang * 1.7 + micro + .2));
  vec3 c = mix(vec3(.5, .86, .92), vec3(.8, .62, .96), w);
  c = mix(c, vec3(1., .82, .66), w2 * w2 * .7);
  float glint = step(.988, hash(floor(q / 3.))) * lamp(s, size, .22, .3);
  float fall = lamp(s, size, .5, .62);
  return c * (.6 + fall * .42) + glint * .5;
}
`)

const AURORA = body(`
float ribbon(vec2 uv, float at, float width, float speed, float seed) {
  float t = uTime * speed;
  float y = at + (fbm(vec2(uv.x * 1.3 + t, seed)) - .5) * .62;
  float d = (uv.y - y) / width;
  float rays = .7 + .3 * noise(vec2(uv.x * 60. + t * 3., seed + 4.));
  return exp(-d * d) * rays;
}

vec3 paint(vec2 s, vec2 q, vec2 size) {
  vec2 uv = s / size;
  uv.y += uScroll / size.y * .12;
  uv.x += (uLight.x / size.x - .5) * .05;
  float a = ribbon(uv, .34, .16, .035, 1.);
  float b = ribbon(uv, .62, .12, .025, 7.);
  float c2 = ribbon(uv, .96, .14, .02, 13.);
  vec3 c = vec3(.012, .02, .035);
  c += a * vec3(.05, .6, .5) + b * vec3(.32, .2, .7) + c2 * vec3(.06, .2, .44);
  /* Стекло: косой блик и лёгкий шум против полос на градиенте */
  float glass = exp(-pow((uv.x + uv.y * .5 - .8) / .3, 2.)) * .04;
  return c + glass + (hash(q + fract(uTime)) - .5) * .014;
}
`)

export const GROUPS = ['Металлы', 'Ткани', 'Будущее'] as const

export type Material = {
  id: string
  name: string
  group: (typeof GROUPS)[number]
  source: string
  /** Какой яркостью материал реально рисует: из этого диапазона он ложится в полосу темы */
  range: [number, number]
  /** Живёт во времени: рисуется постоянно, остальные только от курсора и скролла */
  moving?: boolean
  /** Образец на кнопке */
  chip: string
}

export const MATERIALS: Material[] = [
  { id: 'steel', name: 'Шлифованная сталь', group: 'Металлы', source: STEEL, range: [0.6, 0.95], chip: 'linear-gradient(100deg, #8d9499, #e4e8ea 40%, #a4aaae 62%, #d6dadd)' },
  { id: 'titanium', name: 'Титан', group: 'Металлы', source: TITANIUM, range: [0.12, 0.92], chip: 'linear-gradient(135deg, #6f7378, #a9a7ab 48%, #8f97a6 72%, #b3a897)' },
  { id: 'anodized', name: 'Анодированный алюминий', group: 'Металлы', source: ANODIZED, range: [0.14, 0.9], chip: 'linear-gradient(180deg, #5d7796, #a6c2e4 55%, #6e88a8)' },
  { id: 'copper', name: 'Медь и латунь', group: 'Металлы', source: COPPER, range: [0.1, 0.95], chip: 'conic-gradient(from 210deg at 80% 10%, #7b4326, #e8a56f, #8a5230, #e8c070, #7b4326)' },
  { id: 'chrome', name: 'Тёмный хром', group: 'Металлы', source: CHROME, range: [0.04, 0.7], chip: 'linear-gradient(180deg, #17191c 18%, #9aa2aa 26%, #202328 34%, #0f1113 62%, #6b727a 72%, #14161a)' },
  { id: 'gunmetal', name: 'Гунметал', group: 'Металлы', source: GUNMETAL, range: [0.06, 0.74], chip: 'radial-gradient(circle at 30% 30%, #6c7682, #2d333a 62%), #2d333a' },
  { id: 'carbon', name: 'Карбон', group: 'Металлы', source: CARBON, range: [0.02, 0.86], chip: 'repeating-conic-gradient(#2c2f33 0 25%, #121315 0 50%) 0 0 / 8px 8px' },
  { id: 'denim', name: 'Деним', group: 'Ткани', source: DENIM, range: [0.08, 0.72], chip: 'repeating-linear-gradient(135deg, #24406e 0 2px, #5a79a8 2px 3px)' },
  { id: 'wool', name: 'Шерсть и войлок', group: 'Ткани', source: WOOL, range: [0.06, 0.66], chip: 'radial-gradient(circle at 60% 40%, #8a8580, #4c4844)' },
  { id: 'fur', name: 'Мех', group: 'Ткани', source: FUR, range: [0.02, 0.86], chip: 'repeating-linear-gradient(82deg, #3b322b 0 2px, #7d6c5e 2px 3px, #4c4138 3px 5px)' },
  { id: 'mercury', name: 'Жидкий хром', group: 'Будущее', source: MERCURY, range: [0.06, 0.92], moving: true, chip: 'radial-gradient(120% 80% at 30% 20%, #f2f5f8, #5a626b 40%, #c5ccd3 60%, #2f353b)' },
  { id: 'holo', name: 'Голографическая фольга', group: 'Будущее', source: HOLO, range: [0.2, 0.95], chip: 'linear-gradient(120deg, #9de2ee, #d7b7f2 34%, #f4d6a8 62%, #a7efc6)' },
  { id: 'aurora', name: 'Аврора на тёмном стекле', group: 'Будущее', source: AURORA, range: [0.012, 0.52], moving: true, chip: 'linear-gradient(170deg, #06090f 12%, #127a68 42%, #3b2a8c 66%, #06090f)' },
]

export type Tint = { id: string; name: string; color: [number, number, number]; amount: number }

export const TINTS: Tint[] = [
  { id: 'natural', name: 'Родной', color: [1, 1, 1], amount: 0 },
  { id: 'ice', name: 'Лёд', color: [0.68, 0.82, 0.96], amount: 0.72 },
  { id: 'sand', name: 'Песок', color: [0.94, 0.82, 0.64], amount: 0.72 },
  { id: 'rose', name: 'Пепельная роза', color: [0.93, 0.72, 0.72], amount: 0.72 },
  { id: 'olive', name: 'Олива', color: [0.7, 0.75, 0.52], amount: 0.72 },
  { id: 'indigo', name: 'Индиго', color: [0.5, 0.55, 0.94], amount: 0.72 },
]

/** Полоса яркости темы: тёмная остаётся тёмной, светлая светлой, в Стали металлический средний тон */
export const BANDS: Record<string, { band: [number, number]; sat: number }> = {
  dark: { band: [0.03, 0.24], sat: 1 },
  light: { band: [0.8, 0.965], sat: 0.34 },
  steel: { band: [0.6, 0.93], sat: 0.4 },
}
