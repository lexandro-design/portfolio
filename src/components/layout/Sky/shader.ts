/** Вся сцена в одном проходе: луч из камеры, сфера считается формулой, поэтому Луна стоит
    как один полноэкранный прямоугольник и на телефоне тоже. Текстуры Луны из данных NASA, готовит tools/space/moon-nasa.py */
export const QUAD = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0., 1.); }
`

export const SCENE = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uFocal;
uniform vec3 uC;
uniform mat3 uBody;
uniform mat3 uSkyM;
uniform vec3 uSun;
uniform float uIn;
uniform sampler2D uAlb;
uniform sampler2D uNx;
uniform sampler2D uNy;
uniform sampler2D uSky;
out vec4 o;

const float PI = 3.14159265;

vec2 lonlat(vec3 m) { return vec2(atan(m.x, m.z), asin(clamp(m.y, -1., 1.))); }

/* Шов на обратной стороне: берём ту развёртку, где производная не рвётся */
vec2 mapUv(vec2 ll) {
  float a = ll.x / (2. * PI) + .5;
  float b = fract(a + .5) - .5;
  float u = fwidth(a) < fwidth(b) + 1e-6 ? a : b;
  return vec2(u, .5 - ll.y / PI);
}

vec3 sky(vec3 d) {
  vec3 m = uSkyM * d;
  vec3 c = texture(uSky, mapUv(lonlat(m))).rgb;
  return pow(c, vec3(2.2)) * vec3(.72, .84, 1.15) * .09;
}

/* Наклон поверхности на восток и на север по картам NASA LOLA: в текстуре корень от |s| / SMAX,
   так тонкие склоны получают больше градаций. Тот же SMAX в tools/space/moon-nasa.py */
const float SMAX = .5;
vec2 slope(vec2 uv) {
  vec2 v = vec2(texture(uNx, uv).r, texture(uNy, uv).r) * 2. - 1.;
  return sign(v) * v * v * SMAX;
}

vec3 moon(vec3 d, vec3 P) {
  vec3 N = normalize(P);
  vec3 M = uBody * N;
  vec3 S = uBody * uSun;
  vec3 V = uBody * -d;
  vec2 ll = lonlat(M);
  vec2 uv = mapUv(ll);
  /* Смещение уровня мипов: при соотношении текселя к пикселю около 1:1 трилинейная выборка иначе мылит */
  vec3 tex = texture(uAlb, uv, -.6).rgb;
  /* Цвет снимков чуть приглушён: настоящая Луна почти серая, тёплые нагорья и холодные моря едва различимы */
  vec3 alb = pow(mix(vec3(dot(tex, vec3(.3, .59, .11))), tex, .75), vec3(2.2));
  /* Рельеф с запасом: на полной фазе склоны почти не видны, у терминатора они и лепят шар */
  vec2 s = slope(uv) * 2.8;
  vec3 E = normalize(vec3(M.z, 0., -M.x) + 1e-5);
  vec3 Nn = cross(M, E);
  vec3 n = normalize(M - s.x * E - s.y * Nn);
  float g = dot(M, S);
  /* Склон влияет не на всю силу: чёрные ямы-провалы в кратерах смягчены, лепка остаётся */
  float mu0 = max(mix(dot(M, S), dot(n, S), .88), 0.);
  float mu = max(dot(n, V), .04);
  /* Терминатор мягкий: свет уходит плавно, без ступеньки между днём и ночью */
  float day = smoothstep(-.16, .24, g);
  /* Лунная пыль рассеивает назад: диск почти плоский, край не темнеет, как у шара из пластика */
  float ls = mu0 / (mu0 + mu);
  float phase = dot(S, V);
  float light = (ls * 1.5 + mu0 * .55) * (1. + .35 * pow(max(phase, 0.), 6.));
  vec3 sun = vec3(1., .975, .94) * alb * light * day * 1.9;
  /* Пепельный свет: ночная сторона светится отражённой Землёй */
  vec3 earth = vec3(.62, .74, 1.) * alb * .014 * max(N.z * .6 + .4, 0.);
  /* Лёгкое свечение у самого края с освещённой стороны */
  float rim = pow(1. - clamp(dot(N, vec3(0., 0., 1.)), 0., 1.), 3.) * smoothstep(-.1, .5, dot(N, uSun));
  return sun + earth + vec3(.55, .62, .8) * rim * .05;
}

void main() {
  vec3 d = normalize(vec3(gl_FragCoord.xy - uRes * .5, -uFocal));
  float b = dot(d, uC);
  float cc = dot(uC, uC);
  float near = sqrt(max(cc - b * b, 0.));
  float px = b / uFocal;
  float cover = b > 0. ? clamp((1. - near) / px + .5, 0., 1.) : 0.;
  vec3 c = sky(d);
  if (b > 0. && near > .96) {
    /* Ореол: рассеянный свет вокруг диска, гуще со стороны Солнца и на фазе ближе к полной */
    vec3 q = d * b - uC;
    float lit = max(dot(normalize(q), uSun) * .5 + .5, 0.);
    float full = uSun.z * .5 + .5;
    float k = exp(-max(near - 1., 0.) * 16.);
    c += vec3(.72, .8, 1.) * k * lit * lit * (.012 + .05 * full) * uIn;
  }
  if (cover > 0. && uIn > 0.) {
    float t = b - sqrt(max(1. - near * near, 0.));
    vec3 m = moon(d, d * t - uC);
    c = mix(c, m, cover * uIn);
  }
  c = 1. - exp(-c * 1.5);
  c = pow(c, vec3(1. / 2.2));
  o = vec4(c + (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255., 1.);
}
`

/** Звёзды отдельными точками: в шейдере они размылись бы, а резкая точка и делает небо настоящим */
export const STAR_V = `#version 300 es
in vec3 p;
in vec2 m;
uniform vec2 uRes;
uniform float uFocal;
uniform vec3 uC;
uniform mat3 uSkyT;
uniform float uPx;
uniform float uDim;
out vec3 vColor;
void main() {
  vec3 d = uSkyT * p;
  gl_Position = vec4(0., 0., 2., 1.);
  gl_PointSize = 0.;
  vColor = vec3(0.);
  if (d.z >= -.02) return;
  float b = dot(d, uC);
  if (b > 0. && dot(uC, uC) - b * b < 1.) return;
  vec2 s = d.xy / -d.z * uFocal;
  gl_Position = vec4(s / (uRes * .5), 0., 1.);
  gl_PointSize = (1.1 + m.x * m.x * 2.6) * uPx;
  vec3 tint = mix(vec3(1., .82, .66), vec3(.74, .84, 1.), m.y);
  vColor = mix(vec3(1.), tint, .6) * (.16 + m.x * .95) * uDim;
}
`

export const STAR_F = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord * 2. - 1.;
  float a = exp(-dot(q, q) * 3.2);
  o = vec4(vColor * a, 1.);
}
`
