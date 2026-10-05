/* Cursor Ring Field — Originkit. Adapted from the component supplied by the owner.
 * Uses its analytical WebGL renderer without React or floating-point textures. */
(() => {
'use strict';
const FIELD = 500
const HALF = FIELD / 2
const WORLD = 5


const FOV = 40
const MAX_POINTS = 65536
const TAU = Math.PI * 2
const MAX_COLORS = 5


const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
    + i.y+vec4(0.0,i1.y,i2.y,1.0))
    + i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

const FIELD_TERMS = `
void fieldTerms(
    vec2 ref, vec2 ringPos, float time,
    float ringRadius, float w1, float w2, float turb,
    out vec2 disp, out float bandT, out float bandHot
){
    float dist = distance(ref, ringPos);

    // Break the ring's own edge with a slow noise so it never reads as a
    // mathematically clean circle. Only the OUTER smoothstep uses the wobbled
    // distance — wobbling both would just translate the band.
    float n0 = snoise(vec3(ref * 0.2 + vec2(18.4924, 72.9744), time * 0.5));
    float dist1 = distance(ref + (n0 * 0.005), ringPos);

    float t  = smoothstep(ringRadius - (w1 * 2.0), ringRadius, dist)
             - smoothstep(ringRadius, ringRadius + w1, dist1);
    float t2 = smoothstep(ringRadius - (w2 * 2.0), ringRadius, dist)
             - smoothstep(ringRadius, ringRadius + w2, dist1);
    float t3 = (1.0 - smoothstep(ringRadius, ringRadius + w2, dist)); // solid interior

    t  = pow(max(t, 0.0), 2.0);
    t2 = pow(max(t2, 0.0), 3.0);

    t += t2 * 3.0;                                   // hot core of the band
    t += t3 * 0.4;                                   // lift everything inside
    t += snoise(vec3(ref * 30.0 + vec2(11.4924, 12.9744), time * 0.5)) * t3 * 0.5;

    // Baseline shimmer, present with no ring anywhere near: this is what keeps
    // the rest of the field alive instead of black.
    float nS = snoise(vec3(ref * 2.0 + vec2(18.4924, 72.9744), time * 0.5));
    t += pow((nS + 1.5) * 0.5, 2.0) * 0.6;

    // Two octaves of drift plus a standing wave. The wave is scaled by the
    // distance to the ring so the band itself stays coherent while the far
    // field ripples.
    float n1 = snoise(vec3(ref * 4.0 + vec2(88.494, 32.4397), time * 0.35));
    float n2 = snoise(vec3(ref * 4.0 + vec2(50.904, 120.947), time * 0.35));
    float n3 = snoise(vec3(ref * 20.0 + vec2(18.4924, 72.9744), time * 0.5));
    float n4 = snoise(vec3(ref * 20.0 + vec2(50.904, 120.947), time * 0.5));

    vec2 d = vec2(n1, n2) * 0.03 + vec2(n3, n4) * 0.005;
    d.x += sin((ref.x * 20.0) + (time * 4.0)) * 0.02 * clamp(dist, 0.0, 1.0);
    d.y += cos((ref.y * 20.0) + (time * 3.0)) * 0.02 * clamp(dist, 0.0, 1.0);

    disp = d * turb;
    bandT = t;
    bandHot = t2;
}
`

const RENDER_VERT = (isStatic         ) => `
precision highp float;

attribute vec2 aUV;
attribute vec2 aRef;

uniform sampler2D uState;
uniform float uProjF;
uniform float uAspect;
uniform float uCamDist;
uniform float uPointScale;
${
    isStatic
        ? `uniform vec2  uRingPos;
uniform float uRingRadius;
uniform float uRingWidth;
uniform float uRingWidth2;
uniform float uTurb;
uniform float uTime;`
        : ``
}

varying vec2  vLocalPos;
varying float vScale;
varying float vEnergy;

${isStatic ? NOISE : ``}
${isStatic ? FIELD_TERMS : ``}

void main(){
${
    isStatic
        ? `    vec2 disp; float t; float t2;
    fieldTerms(aRef, uRingPos, uTime * 0.5, uRingRadius, uRingWidth, uRingWidth2, uTurb, disp, t, t2);
    vec4 state = vec4(aRef + disp, t, t * 0.5);`
        : `    vec4 state = texture2D(uState, aUV);`
}

    vLocalPos = state.xy;
    vScale    = state.z;
    vEnergy   = state.w;

    vec2 world = state.xy * ${WORLD.toFixed(1)};

    gl_Position = vec4(world.x * uProjF / uAspect, world.y * uProjF, 0.0, uCamDist);

    gl_PointSize = max(vScale, 0.0) * 7.0 * uPointScale;
}
`

const RENDER_FRAG = `
precision highp float;

varying vec2  vLocalPos;
varying float vScale;
varying float vEnergy;

uniform vec3  uColors[${MAX_COLORS}];
uniform int   uColorCount;
uniform vec2  uRingPos;
uniform float uTime;

${NOISE}

float sdRoundBox(in vec2 p, in vec2 b, in float r){
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec2 rotate(vec2 v, float a){
    float s = sin(a);
    float c = cos(a);
    return mat2(c, s, -s, c) * v;
}

void main(){
    float noiseAngle = snoise(vec3(vLocalPos * 10.0 + vec2(18.4924, 72.9744), uTime * 0.85));
    float noiseColor = snoise(vec3(vLocalPos * 2.0  + vec2(74.664,  91.556),  uTime * 0.5));
    noiseColor = (noiseColor + 1.0) * 0.5;

    float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);

    vec2 uv = gl_PointCoord.xy - vec2(0.5);
    uv.y *= -1.0;
    uv = rotate(uv, -angle + (noiseAngle * 0.5));

    float p = smoothstep(0.0, 0.75, pow(noiseColor, 2.0));
    vec3 color = uColors[0];
    for (int i = 0; i < ${MAX_COLORS - 1}; i++) {
        if (i < uColorCount - 1) {
            float span = 1.0 / float(uColorCount - 1);
            float t = clamp((p - float(i) * span) / span, 0.0, 1.0);
            color = mix(color, uColors[i + 1], t);
        }
    }

    float d = sdRoundBox(uv, vec2(0.5, 0.2), 0.25);
    float mask = (1.0 - smoothstep(0.0, 0.1, d));

    float a = mask * smoothstep(0.1, 0.2, vScale);
    if (a < 0.01) discard;

    color = clamp(color, 0.0, 1.0);
    color *= clamp(vEnergy, 0.0, 1.0);

    gl_FragColor = vec4(color, clamp(a, 0.0, 1.0));
}
`

function compile(gl     , type        , src        ) {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh)
        gl.deleteShader(sh)
        throw new Error(log || "shader compile failed")
    }
    return sh
}

function program(gl     , vs        , fs        , names          ) {
    const prog = gl.createProgram()
    const v = compile(gl, gl.VERTEX_SHADER, vs)
    const f = compile(gl, gl.FRAGMENT_SHADER, fs)
    gl.attachShader(prog, v)
    gl.attachShader(prog, f)
    gl.linkProgram(prog)
    gl.deleteShader(v)
    gl.deleteShader(f)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(prog)
        gl.deleteProgram(prog)
        throw new Error(log || "program link failed")
    }
    const u                      = {}
    const nulls           = []
    for (const n of names) {
        const loc = gl.getUniformLocation(prog, n)
        if (loc === null) nulls.push(n)
        u[n] = loc
    }
    return { prog, u, nulls }
}

function mulberry32(a        ) {
    return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const linMap = (x        , a        , b        , c        , d        ) =>
    ((x - a) * (d - c)) / (b - a) + c

function poissonDisk(
    size        ,
    minD        ,
    maxD        ,
    tries        ,
    rand              
) {
    const cell = minD / Math.SQRT2
    const gw = Math.ceil(size / cell)
    const gh = Math.ceil(size / cell)
    const grid = new Int32Array(gw * gh).fill(-1)
    const px           = []
    const py           = []
    const active           = []
    const minD2 = minD * minD

    const add = (x        , y        ) => {
        const i = px.length
        px.push(x)
        py.push(y)
        grid[((y / cell) | 0) * gw + ((x / cell) | 0)] = i
        active.push(i)
    }

    add(rand() * size, rand() * size)

    while (active.length > 0 && px.length < MAX_POINTS) {
        const ai = (rand() * active.length) | 0
        const idx = active[ai]
        let placed = false
        for (let t = 0; t < tries; t++) {
            const ang = rand() * TAU
            const r = minD + (maxD - minD) * rand()
            const nx = px[idx] + Math.cos(ang) * r
            const ny = py[idx] + Math.sin(ang) * r
            if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue
            const cx = (nx / cell) | 0
            const cy = (ny / cell) | 0
            let ok = true
            for (let j = Math.max(0, cy - 2); j <= Math.min(gh - 1, cy + 2) && ok; j++) {
                for (let i = Math.max(0, cx - 2); i <= Math.min(gw - 1, cx + 2); i++) {
                    const q = grid[j * gw + i]
                    if (q < 0) continue
                    const dx = px[q] - nx
                    const dy = py[q] - ny
                    if (dx * dx + dy * dy < minD2) {
                        ok = false
                        break
                    }
                }
            }
            if (ok) {
                add(nx, ny)
                placed = true
                break
            }
        }
        if (!placed) {
            active[ai] = active[active.length - 1]
            active.pop()
        }
    }
    return { px, py, count: px.length }
}

function buildField(density        ) {
    const rand = mulberry32(0x9e3779b9)
    const minD = linMap(density, 0, 300, 10, 2)
    const maxD = linMap(density, 0, 300, 11, 3)
    const { px, py, count } = poissonDisk(FIELD, minD, maxD, 20, rand)

    let texSize = 8
    while (texSize * texSize < count) texSize *= 2

    const refs = new Float32Array(texSize * texSize * 4)
    const aUV = new Float32Array(count * 2)
    const aRef = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) {
        const x = (px[i] - HALF) / HALF
        const y = (py[i] - HALF) / HALF
        refs[i * 4 + 0] = x
        refs[i * 4 + 1] = y
        aRef[i * 2 + 0] = x
        aRef[i * 2 + 1] = y

        aUV[i * 2 + 0] = ((i % texSize) + 0.5) / texSize
        aUV[i * 2 + 1] = (Math.floor(i / texSize) + 0.5) / texSize
    }
    return { count, texSize, refs, aUV, aRef }
}

function valueNoise1(x        , seed        ) {
    const i = Math.floor(x)
    const f = x - i
    const h = (n        ) => {
        const s = Math.sin((n + seed) * 127.1) * 43758.5453
        return s - Math.floor(s)
    }
    const u = f * f * (3 - 2 * f)
    return h(i) * (1 - u) + h(i + 1) * u
}


const hero = document.querySelector('.hero');
const canvas = document.querySelector('.hero-particles');
const toggle = document.querySelector('.hero-motion-toggle');
if (!hero || !canvas || !toggle) return;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 800px)');
const coarse = matchMedia('(pointer: coarse)');
const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, powerPreference: 'low-power',
});
if (!gl) return; // Keep the existing hero image when WebGL is unavailable.

// Keep only particles that can enter the visible camera frustum. This retains
// the supplied Poisson distribution while avoiding work on offscreen particles.
const field = buildField(300);
const projection = 1 / Math.tan(FOV * Math.PI / 360);
const camera = 1.6;
const palette = new Float32Array([
    0.44, 0.60, 1.0, 0.18, 0.44, 0.98, 0.52, 0.23, 0.63,
    0, 0, 0, 0, 0, 0,
]);
let renderer, buffer, count = 0, width = 1, height = 1, dpr = 1;
let frame = 0, lastFrame = 0, time = 8, ready = false;
let inView = true, pageActive = true, userPaused = false;
let pointerInside = false, pointerX = 0, pointerY = 0;
let ringX = compact.matches ? 0.045 : 0.14, ringY = 0;

function setup() {
    renderer = program(gl, RENDER_VERT(true), RENDER_FRAG, [
        'uProjF', 'uAspect', 'uCamDist', 'uPointScale', 'uRingPos',
        'uRingRadius', 'uRingWidth', 'uRingWidth2', 'uTurb', 'uTime',
        'uColors[0]', 'uColorCount',
    ]);
    buffer = gl.createBuffer();
    const location = gl.getAttribLocation(renderer.prog, 'aRef');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    ready = true;
    resize();
    hero.classList.add('has-ring-effect');
    syncMotion();
}

function resize() {
    if (!ready) return;
    const bounds = hero.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(devicePixelRatio || 1, compact.matches ? 1.25 : 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const halfY = camera / (projection * WORLD);
    const halfX = halfY * width / height;
    const visible = [];
    for (let i = 0; i < field.aRef.length; i += 2) {
        const x = field.aRef[i], y = field.aRef[i + 1];
        if (Math.abs(x) < halfX + 0.07 && Math.abs(y) < halfY + 0.07) {
            visible.push(x, y);
        }
    }
    count = visible.length / 2;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(visible), gl.STATIC_DRAW);
    draw();
}

function draw() {
    if (!ready) return;
    const u = renderer.u;
    const small = compact.matches;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(renderer.prog);
    gl.uniform1f(u.uProjF, projection);
    gl.uniform1f(u.uAspect, width / height);
    gl.uniform1f(u.uCamDist, camera);
    gl.uniform1f(u.uPointScale, (height / 602) * dpr * (small ? 0.30 : 0.46));
    gl.uniform2f(u.uRingPos, ringX, ringY);
    gl.uniform1f(u.uRingRadius, (small ? 0.068 : 0.095) + 0.008 * Math.sin(time));
    gl.uniform1f(u.uRingWidth, small ? 0.045 : 0.07);
    gl.uniform1f(u.uRingWidth2, 0.025);
    gl.uniform1f(u.uTurb, 0.8);
    gl.uniform1f(u.uTime, time);
    gl.uniform3fv(u['uColors[0]'], palette);
    gl.uniform1i(u.uColorCount, 3);
    gl.drawArrays(gl.POINTS, 0, count);
}

function shouldAnimate() {
    return ready && inView && pageActive && !document.hidden && !userPaused && !reducedMotion.matches;
}
function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
}
function animate(now) {
    frame = 0;
    if (!shouldAnimate()) return;
    const interval = 1000 / (coarse.matches ? 24 : 30);
    if (!lastFrame || now - lastFrame >= interval - 1) {
        const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.08) : 1 / 30;
        lastFrame = now;
        time += delta * 0.18;
        const following = pointerInside && !coarse.matches;
        const centerX = compact.matches ? 0.045 : 0.14;
        const targetX = following ? pointerX : centerX + (valueNoise1(time * 0.4, 12) - 0.5) * 0.055;
        const targetY = following ? pointerY : (valueNoise1(time * 0.4, 78) - 0.5) * 0.045;
        const easing = 1 - Math.exp(-delta * (following ? 6 : 1.2));
        ringX += (targetX - ringX) * easing;
        ringY += (targetY - ringY) * easing;
        draw();
    }
    frame = requestAnimationFrame(animate);
}
function syncMotion() {
    stop();
    toggle.hidden = !ready || reducedMotion.matches;
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.setAttribute('aria-label', userPaused ? 'Retomar animação de partículas' : 'Pausar animação de partículas');
    toggle.querySelector('span').textContent = userPaused ? 'Retomar efeito' : 'Pausar efeito';
    if (shouldAnimate()) frame = requestAnimationFrame(animate);
}
function fallback() {
    ready = false;
    stop();
    hero.classList.remove('has-ring-effect');
    toggle.hidden = true;
}

hero.addEventListener('pointermove', event => {
    if (!ready || reducedMotion.matches || userPaused || event.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / width * 2 - 1) * camera * (width / height) / (projection * WORLD);
    pointerY = (1 - (event.clientY - rect.top) / height * 2) * camera / (projection * WORLD);
    pointerInside = true;
}, {passive: true});
hero.addEventListener('pointerleave', () => { pointerInside = false; });
hero.addEventListener('pointercancel', () => { pointerInside = false; });
toggle.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
reducedMotion.addEventListener('change', syncMotion);
compact.addEventListener('change', () => {
    ringX = compact.matches ? 0.045 : 0.14;
    ringY = 0;
    pointerInside = false;
    resize();
});
document.addEventListener('visibilitychange', syncMotion);
window.addEventListener('pagehide', () => { pageActive = false; stop(); });
window.addEventListener('pageshow', () => { pageActive = true; syncMotion(); });
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); });
canvas.addEventListener('webglcontextrestored', () => { try { setup(); } catch { fallback(); } });
if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        syncMotion();
    }).observe(hero);
}
if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
else window.addEventListener('resize', resize, {passive: true});
try { setup(); } catch { fallback(); }
})();
