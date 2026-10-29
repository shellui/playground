/**
 * Dot field on a canvas, ported from the Shellui windows layout desktop
 * (`@shellui/core` features/layouts/windows/deskDots.ts) at its normal speed.
 * Colours come from the `--foreground` and `--primary` theme variables.
 * Decorative only: the caller mounts it on an `aria-hidden` host.
 */
const P = {
  spacing: 24,
  radius: 1.1,
  alphaLight: 0.15,
  alphaDark: 0.11,
  accentEvery: 11,
  accentAlpha: 0.22,
  gustLift: 0.16,
  gustPx: 7,
  frontWidth: 70,
  slantDeg: 18,
  crossMs: [6700, 10000],
  everyMs: [1000, 3000],
  spring: 0.06,
  damp: 0.82,
  fps: 30,
  dprMax: 2,
};

const BUCKETS = 6;

function bucketAlpha(accent, bucket, dark) {
  const m = (bucket + 0.5) / BUCKETS;
  if (accent) return P.accentAlpha + P.gustLift * 1.6 * m;
  return (dark ? P.alphaDark : P.alphaLight) + P.gustLift * m;
}

/**
 * Mount the field in `host` (positioned, sized by CSS). Pauses while the tab is
 * hidden or the host is off screen, and idles between wind fronts.
 * @param {HTMLElement} host
 * @returns {() => void} destroy
 */
export function mountDotField(host) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  });
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};
  host.appendChild(canvas);
  host.setAttribute('data-live', 'true');

  const slant = Math.tan((P.slantDeg * Math.PI) / 180);
  const smooth = (t) => t * t * (3 - 2 * t);
  const rnd = (a, b) => a + Math.random() * (b - a);

  let w = 0;
  let h = 0;
  let n = 0;
  let X, Y, OX, OY, VX, VY, S, PH, AC;
  let fronts = [];
  let nextAt = 0;
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let settled = false;
  let destroyed = false;
  let idleTimer;
  let layoutTimer;
  let fg = [0, 0, 0];
  let pr = [0, 0, 0];
  let dark = false;

  // Resolve any CSS colour (oklch included) to RGB through a 1 x 1 canvas.
  const probe = document.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  const toRgb = (css, fallback) => {
    if (!pctx || !css) return fallback;
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = 'black';
    pctx.fillStyle = css;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  const paths = new Array(BUCKETS * 2);
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let k = 0; k < paths.length; k++) paths[k] = new Path2D();
    for (let i = 0; i < n; i++) {
      const m = Math.min(1, Math.hypot(OX[i], OY[i]) / P.gustPx);
      const b = Math.min(BUCKETS - 1, (m * BUCKETS) | 0);
      const p = paths[AC[i] * BUCKETS + b];
      const x = X[i] + OX[i];
      const y = Y[i] + OY[i];
      p.moveTo(x + P.radius, y);
      p.arc(x, y, P.radius, 0, Math.PI * 2);
    }
    for (let a = 0; a < 2; a++) {
      const c = a ? pr : fg;
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${bucketAlpha(a === 1, b, dark).toFixed(3)})`;
        ctx.fill(paths[a * BUCKETS + b]);
      }
    }
  }

  function readTheme() {
    const cs = getComputedStyle(host);
    fg = toRgb(cs.getPropertyValue('--foreground').trim(), fg);
    pr = toRgb(cs.getPropertyValue('--primary').trim(), pr);
    dark = document.documentElement.classList.contains('dark');
    settled = false;
    if (n) draw();
  }

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, P.dprMax);
    w = host.clientWidth;
    h = host.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.max(0, Math.ceil(w / P.spacing));
    const rows = Math.max(0, Math.ceil(h / P.spacing));
    n = cols * rows;
    X = new Float32Array(n);
    Y = new Float32Array(n);
    OX = new Float32Array(n);
    OY = new Float32Array(n);
    VX = new Float32Array(n);
    VY = new Float32Array(n);
    S = new Float32Array(n);
    PH = new Float32Array(n);
    AC = new Uint8Array(n);
    const x0 = (w - (cols - 1) * P.spacing) / 2;
    const y0 = P.spacing / 2;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        X[i] = x0 + c * P.spacing;
        Y[i] = y0 + r * P.spacing;
        S[i] = 0.6 + Math.random() * 0.4;
        PH[i] = Math.random() * Math.PI * 2;
        AC[i] = (c * 7 + r * 3) % P.accentEvery === 0 ? 1 : 0;
      }
    }
    settled = false;
    draw();
    kick();
  }

  const running = () => !destroyed && onScreen && !document.hidden;

  function step(now) {
    raf = 0;
    if (!running()) return;
    if (now - last < 1000 / P.fps - 1) {
      raf = requestAnimationFrame(step);
      return;
    }
    last = now;
    if (!nextAt) nextAt = now + rnd(800, 2500);
    if (now >= nextAt) {
      fronts.push({
        t: now,
        v: (w + 2 * P.frontWidth + h * slant) / rnd(P.crossMs[0], P.crossMs[1]),
        x: 0,
      });
      nextAt = now + rnd(P.everyMs[0], P.everyMs[1]);
    }
    for (const f of fronts) f.x = (now - f.t) * f.v - P.frontWidth - h * slant;
    fronts = fronts.filter((f) => f.x < w + P.frontWidth);
    let energy = 0;
    for (let i = 0; i < n; i++) {
      let tx = 0;
      let ty = 0;
      for (const f of fronts) {
        const k = 1 - Math.abs(X[i] - f.x - (h - Y[i]) * slant) / P.frontWidth;
        if (k > 0) {
          const g = P.gustPx * S[i] * smooth(k);
          tx += g;
          ty += g * 0.25 * Math.sin(PH[i]);
        }
      }
      VX[i] = (VX[i] + (tx - OX[i]) * P.spring) * P.damp;
      VY[i] = (VY[i] + (ty - OY[i]) * P.spring) * P.damp;
      OX[i] += VX[i];
      OY[i] += VY[i];
      energy += Math.abs(VX[i]) + Math.abs(VY[i]) + Math.abs(OX[i]);
    }
    // Idle: no front on screen and every dot at rest. Stop until the next front.
    if (!fronts.length && energy < n * 0.002) {
      if (!settled) {
        OX.fill(0);
        OY.fill(0);
        draw();
        settled = true;
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(kick, Math.max(0, nextAt - performance.now()));
      return;
    }
    settled = false;
    draw();
    raf = requestAnimationFrame(step);
  }

  function kick() {
    if (!raf && running()) raf = requestAnimationFrame(step);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  const ro =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          clearTimeout(layoutTimer);
          layoutTimer = setTimeout(layout, 150);
        })
      : null;
  ro?.observe(host);
  const io =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen) kick();
          else stop();
        })
      : null;
  io?.observe(host);
  // The theme writes its variables inline on <html>, so watch style as well as class.
  const mo = new MutationObserver(readTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
  const onVisibility = () => (document.hidden ? stop() : kick());
  document.addEventListener('visibilitychange', onVisibility);

  readTheme();
  layout();

  return () => {
    destroyed = true;
    stop();
    clearTimeout(idleTimer);
    clearTimeout(layoutTimer);
    ro?.disconnect();
    io?.disconnect();
    mo.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.remove();
    host.removeAttribute('data-live');
  };
}
