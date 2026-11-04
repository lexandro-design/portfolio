/** Шлифованный лист: штрихи идут вдоль, блик полосой поперёк штриха, как у настоящей стали.
    Текстуры нет, всё считается по координате, поэтому зерно чёткое на любом экране */
export const VERTEX = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0., 1.); }
`

export const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uScroll;
uniform float uDpr;

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

/* Редкие глубокие риски: одна на ячейку, лежит почти вдоль шлифовки */
float scratch(vec2 q) {
  vec2 cell = vec2(420., 26.);
  vec2 id = floor(q / cell);
  float on = step(.86, hash(id));
  vec2 f = fract(q / cell) - .5;
  float y = (hash(id + 7.) - .5) * .7 + f.x * (hash(id + 3.) - .5) * .5;
  float len = 1. - smoothstep(.2, .5, abs(f.x));
  return on * len * (1. - smoothstep(0., .03, abs(f.y - y)));
}

void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 q = s + vec2(0., uScroll);
  vec2 size = uRes / uDpr;

  /* Зерно: чем мельче штрих, тем он длиннее относительно ширины */
  float g1 = noise(q * vec2(.0052, 1.9));
  float g2 = noise(q * vec2(.011, .72) + 40.);
  float g3 = noise(q * vec2(.0023, .21) + 90.);
  float g4 = noise(q * vec2(.0009, .05) + 130.);
  float grain = (g1 - .5) * .5 + (g2 - .5) * .3 + (g3 - .5) * .24 + (g4 - .5) * .2;

  /* Лист не идеально ровный: полосы отражений чуть гуляют */
  float k = clamp(size.x / 1440., .35, 1.2);
  float warp = ((noise(q * .0016) - .5) * 150. + (noise(q * .0052 + 9.) - .5) * 34.) * k;
  /* Каждый штрих отражает со своим смещением: полоса рассыпается на нити */
  float x = s.x + warp + grain * 210. * k;
  float nx = x / size.x;

  /* Комната: мягкие полосы света и тени, которые лист отражает всегда */
  float room = .3
    + .2 * exp(-pow((nx - .16) / .17, 2.))
    + .16 * exp(-pow((nx - .93) / .13, 2.))
    - .16 * exp(-pow((nx - .56) / .2, 2.))
    - .08 * exp(-pow((nx + .08) / .1, 2.));

  /* Лампа: узкая вдоль штриха, длинная поперёк */
  float dx = (x - uLight.x) / (size.x * .15 + 60.);
  float dy = (s.y - uLight.y) / (size.y * .95 + 160.);
  float lamp = exp(-dx * dx - dy * dy);
  float core = exp(-dx * dx * 7. - dy * dy * 2.2);

  float v = room + lamp * .4 + core * .2 + grain * .17;
  v -= scratch(q) * .07;
  v += scratch(q + vec2(0., 1.2)) * .05;

  v = clamp(v, 0., 1.);
  vec3 dark = vec3(.6, .62, .64);
  vec3 lite = vec3(.93, .945, .955);
  gl_FragColor = vec4(mix(dark, lite, v), 1.);
}
`
