// A textbook-clean CORONAL SLICE of the nasal cavity, built from the same geometry/fields as the
// 3D model. Every tissue is a closed solid slab whose front face lies exactly at z = z0.
//
//   corte_osso                   maxilla / palatine: floor + lateral nasal wall + roof (one clean frame)
//   corte_concha_dir / _esq      inferior turbinates, attached to the lateral wall
//   corte_septo_cartilagem       quadrangular cartilage band(s) at z0
//   corte_septo_osso             perpendicular plate / vomer bands at z0
//   corte_mucosa_septal_dir/esq  septal mucosa (morph `desvio`, same D field as the 3D model)
//   corte_mucosa_parede          thin mucosal lining of wall, floor and roof
//   corte_ar_dir / _esq          air in the airway cross-section (morph `desvio`)
//
// Axes as everywhere: x = patient's left, y = up, z = anterior (cm).
import { Grid2D, signedDistance, gaussian, surfaceNets, plate, fillHoles, largestRegion, and, or, minus } from "./sdf.mjs";
import { taubin } from "./mesh.mjs";

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export const SLICE = {
  z0: -2.5,        // cm: where the front face lies (largest inferior turbinate; spur next to it)
  depth: 0.6,      // cm: slab depth (toward −z)
  wall: 0.28,      // lateral bony wall thickness
  floorT: 0.5,     // floor thickness
  roofT: 0.6,      // wall thickness around the olfactory cleft / roof
  wallMax: 1.38,   // lateral wall at turbinate level (each side ≈ 1.2 cm between septal mucosa and wall)
  cleftHalf: 0.5,  // half-width of the cavity at the olfactory cleft (cleft ≈ this − septum+mucosa 0.17)
  roofY: 3.0, roofRise: 0.3,   // domed roof: y at the cleft edges, extra height at the midline
  // turbinates: ellipse body (centre, semi-axes), medial-lower curl (centre, radius), neck to the wall
  // (pear / scroll: a wide upper body on the wall + a narrower lower body that curls medially)
  infL: { xc: 0.95, yc: -0.08, a: 0.43, b: 0.38, x2: 0.70, y2: -0.55, a2: 0.30, b2: 0.46 },
  infR: { xc: -0.97, yc: 0.13, a: 0.43, b: 0.42, x2: -0.725, y2: -0.37, a2: 0.28, b2: 0.44 },
  midL: { xc: 0.8, yc: 1.72, a: 0.22, b: 0.55 },
  midR: { xc: -0.8, yc: 1.72, a: 0.22, b: 0.55 },
  lining: 0.08,    // mucosal lining thickness
  airInset: 0.05,  // air is inset from every wall
  airDepth: 0.3,   // air slab depth, centred in the slab
  edge: 0.04,      // rim rounding of the solids
  turbGrow: 0.13,  // turbinate body growth (cm), away from the septum
};

/** Segments [x1, y1, x2, y2] where a mesh crosses the plane z = z0. */
export function sliceSegments(mesh, z0) {
  const out = [], p = mesh.pos;
  for (let t = 0; t < mesh.idx.length; t += 3) {
    const v = [0, 1, 2].map((k) => mesh.idx[t + k] * 3);
    const d = v.map((a) => p[a + 2] - z0);
    if ((d[0] > 0 && d[1] > 0 && d[2] > 0) || (d[0] < 0 && d[1] < 0 && d[2] < 0)) continue;
    const pts = [];
    for (let e = 0; e < 3; e++) {
      const a = v[e], b = v[(e + 1) % 3], da = d[e], db = d[(e + 1) % 3];
      if ((da < 0) !== (db < 0)) { const s = da / (da - db); pts.push([p[a] + s * (p[b] - p[a]), p[a + 1] + s * (p[b + 1] - p[a + 1])]); }
    }
    if (pts.length === 2) out.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
  }
  return out;
}

/** Even-odd scanline fill of the closed contours formed by `segs`. */
function scanFill(g, segs, into = g.mask()) {
  for (let j = 0; j < g.nv; j++) {
    const y = g.v(j) + 1e-6, xs = [];
    for (const [x1, y1, x2, y2] of segs) if ((y1 <= y) !== (y2 <= y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k] - g.u0) / g.h)), i1 = Math.min(g.nu - 1, Math.floor((xs[k + 1] - g.u0) / g.h));
      for (let i = i0; i <= i1; i++) into[j * g.nu + i] = 1;
    }
  }
  return into;
}

const smoothMask = (g, m, sigma) => Uint8Array.from(gaussian(g, Float32Array.from(m), sigma), (v) => (v > 0.5 ? 1 : 0));
/** Morphological opening with a disc of radius r (rounds convex corners). */
function opening(g, m, r) {
  const sd = signedDistance(g, m, 0);
  const eroded = Uint8Array.from(sd, (d) => (d < -r ? 1 : 0));
  const back = signedDistance(g, eroded, 0);
  return Uint8Array.from(back, (d) => (d < r ? 1 : 0));
}
const dilate = (g, m, r) => { const sd = signedDistance(g, m, 0); return Uint8Array.from(sd, (d) => (d < r ? 1 : 0)); };
const erode = (g, m, r) => { const sd = signedDistance(g, m, 0); return Uint8Array.from(sd, (d) => (d < -r ? 1 : 0)); };

function smooth1d(a, sigma) {
  const r = Math.ceil(sigma * 3), w = [];
  for (let i = -r; i <= r; i++) w.push(Math.exp((-i * i) / (2 * sigma * sigma)));
  return a.map((_, i) => { let s = 0, n = 0; for (let k = -r; k <= r; k++) { const j = Math.min(a.length - 1, Math.max(0, i + k)); s += w[k + r] * a[j]; n += w[k + r]; } return s / n; });
}

/**
 * ctx: { floor, maxL, maxR, palL, palR, conchaL, conchaR, septum: { masks, label, D, halfT } }
 * Returns { sections (2D masks + measurements), parts }.
 */
export function buildSlice(ctx, opts = {}) {
  const P = { ...SLICE, ...opts };
  const { z0 } = P;
  const g = new Grid2D(-2.7, 2.7, -2.4, 3.9, 0.02);
  const { D, halfT, label } = ctx.septum;
  const sg = ctx.septum.masks.g;

  // ── lateral wall profile x_w(y): medial surface of the maxilla/palatine at z0 (both sides averaged) ──
  const ys = []; for (let y = -1.8; y <= 3.8001; y += 0.04) ys.push(+y.toFixed(3));
  const wallSide = (meshes, sgn) => {
    const best = ys.map(() => Infinity);
    for (const m of meshes) for (const [x1, y1, x2, y2] of sliceSegments(m, z0)) {
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 0.02));
      for (let s = 0; s <= n; s++) {
        const x = (x1 + ((x2 - x1) * s) / n) * sgn, y = y1 + ((y2 - y1) * s) / n;
        if (x < 0.45 || x > 2.2) continue;
        const j = Math.round((y - ys[0]) / 0.04);
        if (j >= 0 && j < ys.length && x < best[j]) best[j] = x;
      }
    }
    return best;
  };
  const wl = wallSide([ctx.maxL, ctx.palL], +1), wr = wallSide([ctx.maxR, ctx.palR], -1);
  const fillGaps = (a) => {
    const out = [...a];
    const idx = out.map((v, i) => (Number.isFinite(v) ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) return out.map(() => 1.3);
    for (let i = 0; i < out.length; i++) if (!Number.isFinite(out[i])) {
      const lo = [...idx].reverse().find((k) => k < i), hi = idx.find((k) => k > i);
      out[i] = lo === undefined ? out[hi] : hi === undefined ? out[lo] : out[lo] + ((out[hi] - out[lo]) * (i - lo)) / (hi - lo);
    }
    return out;
  };
  const wlF = fillGaps(wl), wrF = fillGaps(wr);
  const xwArr = smooth1d(wlF.map((v, i) => (v + wrF[i]) / 2), 9);
  const xw = (y) => { const f = (y - ys[0]) / 0.04, i = Math.min(ys.length - 2, Math.max(0, Math.floor(f))); const t = Math.min(1, Math.max(0, f - i)); return xwArr[i] * (1 - t) + xwArr[i + 1] * t; };

  // ── floor profile y_f(x) at z0 (smoothed along x, symmetric) ──
  const xs = []; for (let x = 0; x <= 2.2001; x += 0.04) xs.push(x);
  const yfArr = smooth1d(xs.map((x) => (ctx.floor.at(x, z0) + ctx.floor.at(-x, z0)) / 2), 3);
  const yf = (x) => { x = Math.abs(x); const f = x / 0.04, i = Math.min(xs.length - 2, Math.floor(f)); const t = f - i; return yfArr[i] * (1 - t) + yfArr[i + 1] * t; };

  if (process.env.SLICE_DBG) {
    console.log("slice z0", z0, "wall x_w(y):", ys.filter((_, i) => i % 8 === 0).map((y, k) => `${y.toFixed(1)}:${xw(y).toFixed(2)}`).join(" "));
    console.log("floor y_f(x):", [0, 0.4, 0.8, 1.2, 1.6].map((x) => `${x}:${yf(x).toFixed(2)}`).join(" "));
  }

  // ── cavity: measured lateral wall below, olfactory cleft above, domed roof ──
  const xwF = (y) => { const t = smoothstep(2.0, 2.7, y); return Math.min(xw(y), P.wallMax) * (1 - t) + P.cleftHalf * t; };
  const yDome = (x) => P.roofY + P.roofRise * Math.sqrt(Math.max(0, 1 - (x / P.cleftHalf) ** 2));
  let cav = g.fill((x, y) => y > yf(x) && Math.abs(x) < xwF(y) && y < yDome(x));
  cav = opening(g, smoothMask(g, cav, 6), 0.1);
  cav = largestRegion(g, cav);
  const yTop = P.roofY + P.roofRise;
  // bone frame: thin lateral wall, thicker floor, thick roof/ethmoid around the cleft
  const cavSd = signedDistance(g, cav, 1);
  let bone = g.fill((x, y) => {
    const d = cavSd[Math.round((y - g.v0) / g.h) * g.nu + Math.round((x - g.u0) / g.h)];
    const T = y < yf(x) ? P.floorT : P.wall + (P.roofT - P.wall) * smoothstep(1.9, 2.7, y);
    return d > 0 && d < T;
  });
  bone = smoothMask(g, bone, 3);

  // ── septum bands at z0 ──
  const colU = Math.round((z0 - sg.u0) / sg.h);
  const rows = (ids) => (y) => { const j = Math.round((y - sg.v0) / sg.h); return j >= 0 && j < sg.nv && ids.includes(label[j * sg.nu + colU]); };
  const isCart = rows([1, 2]), isBone = rows([3, 4, 5]);
  const inCav = (x, y) => cav[Math.round((y - g.v0) / g.h) * g.nu + Math.round((x - g.u0) / g.h)] === 1;
  const sCart = smoothMask(g, g.fill((x, y) => isCart(y) && Math.abs(x) <= halfT(z0, y) && inCav(x, y)), 1.2);
  const sBone = smoothMask(g, g.fill((x, y) => isBone(y) && Math.abs(x) <= halfT(z0, y) && inCav(x, y)), 1.2);
  // septal mucosa on both sides (same offsets as the 3D model)
  const sAny = or(sCart, sBone);
  const rowAny = (y) => isCart(y) || isBone(y);
  const mucL = g.fill((x, y) => rowAny(y) && x >= halfT(z0, y) + 0.025 && x <= halfT(z0, y) + 0.095 && inCav(x, y));
  const mucR = g.fill((x, y) => rowAny(y) && -x >= halfT(z0, y) + 0.025 && -x <= halfT(z0, y) + 0.095 && inCav(x, y));

  // ── turbinates: rounded scroll bodies hanging from the lateral wall (the medial edge sets the common meatus) ──
  const ell = (cx, cy, a, b) => (x, y) => ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 <= 1;
  const finish = (m) => largestRegion(g, minus(minus(and(smoothMask(g, m, 5), cav), sAny), or(mucL, mucR)));
  const inferior = (S, sgn) => finish(g.fill((x, y) => ell(S.xc, S.yc, S.a, S.b)(x, y) || ell(S.x2, S.y2, S.a2, S.b2)(x, y)
    // neck: the upper-lateral part runs into the wall
    || (x * sgn >= S.xc * sgn && x * sgn <= xwF(y) + 0.1 && y >= S.yc && y <= S.yc + S.b - 0.06)));
  const middle = (S, sgn) => finish(g.fill((x, y) => ell(S.xc, S.yc, S.a, S.b)(x, y)
    || (x * sgn >= S.xc * sgn && x * sgn <= xwF(y) + 0.1 && y >= S.yc + 0.2 && y <= S.yc + S.b)));
  const tL = inferior(P.infL, +1), tR = inferior(P.infR, -1);
  const mL = middle(P.midL, +1), mR = middle(P.midR, -1);

  // ── mucosal lining of wall/floor/roof, and the air ──
  const solidsInCav = or(or(sAny, or(mucL, mucR)), or(or(tL, tR), or(mL, mR)));
  const lining0 = and(minus(cav, solidsInCav), Uint8Array.from(cavSd, (d) => (d > -P.lining ? 1 : 0)));
  const keepBig = (m, minArea) => { // drop speckles: keep connected regions larger than minArea (cm²)
    const label = new Int32Array(m.length).fill(-1), keep = new Uint8Array(m.length);
    for (let s0 = 0; s0 < m.length; s0++) {
      if (!m[s0] || label[s0] !== -1) continue;
      const stack = [s0], cells = []; label[s0] = s0;
      while (stack.length) { const k = stack.pop(); cells.push(k); const i = k % g.nu, j = (k / g.nu) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= g.nu || jj >= g.nv) continue; const kk = jj * g.nu + ii; if (m[kk] && label[kk] === -1) { label[kk] = s0; stack.push(kk); } } }
      if (process.env.SLICE_DBG) console.log('region', (cells.length * g.h * g.h).toFixed(3), 'cm2 at', g.u(cells[0] % g.nu).toFixed(2), g.v((cells[0] / g.nu) | 0).toFixed(2));
      if (cells.length * g.h * g.h >= minArea) for (const k of cells) keep[k] = 1;
    }
    return keep;
  };
  const lining = keepBig(lining0, 0.02);
  const airSd = signedDistance(g, minus(cav, or(solidsInCav, lining)), 0.8); // negative inside air
  const airAll = Uint8Array.from(airSd, (d) => (d < -P.airInset ? 1 : 0));
  const airL = largestRegion(g, and(airAll, g.fill((x) => x > 0))), airR = largestRegion(g, and(airAll, g.fill((x) => x < 0)));

  // ── airway widths at z0 for a given septal displacement (D at the front face) ──
  const rowMed = { L: new Float32Array(g.nv).fill(NaN), R: new Float32Array(g.nv).fill(NaN) }, rowObs = { L: new Float32Array(g.nv).fill(NaN), R: new Float32Array(g.nv).fill(NaN) };
  const bounds = (m) => maskBounds(g, m);
  const tb = { L: bounds(tL), R: bounds(tR) };
  const widths = (state) => {
    const res = {};
    for (const side of ["L", "R"]) {
      const sgn = side === "L" ? 1 : -1, tm = or(side === "L" ? or(tL, mL) : or(tR, mR), new Uint8Array(tL.length));
      const stat = { meatus: { min: Infinity, y: 0 }, cleft: { min: Infinity, y: 0 }, all: { min: Infinity, y: 0 } };
      for (let j = 0; j < g.nv; j++) {
        const y = g.v(j);
        if (y < yf(0) + 0.15 || y > yTop - 0.35 || !rowAny(y)) continue;
        const face = halfT(z0, y) + 0.095;
        const xm = sgn * face + (state ? D(z0, y) : 0);
        let xo = Infinity;
        const i0 = Math.round((xm - g.u0) / g.h);
        for (let i = i0; i >= 0 && i < g.nu; i += sgn) {
          const k = j * g.nu + i;
          if (tm[k] || !cav[k] || lining[k]) { xo = g.u(i); break; }
        }
        if (!state) { rowMed[side][j] = sgn * face; rowObs[side][j] = xo; }
        const gap = Number.isFinite(xo) ? (xo - xm) * sgn : NaN;
        if (!Number.isFinite(gap)) continue;
        const bucket = y >= tb[side].y0 - 0.02 && y <= tb[side].y1 + 0.02 ? stat.meatus : y > 2.45 ? stat.cleft : null;
        if (bucket && gap < bucket.min) { bucket.min = gap; bucket.y = y; }
        if (gap < stat.all.min) { stat.all.min = gap; stat.all.y = y; }
      }
      res[side] = { min: stat.meatus.min, minY: stat.meatus.y, cleft: stat.cleft.min, cleftY: stat.cleft.y };
    }
    return res;
  };
  const w0 = widths(0), w1 = widths(1);
  if (process.env.SLICE_DBG) {
    const cls = (k) => bone[k] ? "#" : sCart[k] ? "c" : sBone[k] ? "s" : mucL[k] || mucR[k] ? "m" : tL[k] || tR[k] || mL[k] || mR[k] ? "t" : lining[k] ? "l" : airL[k] || airR[k] ? "a" : cav[k] ? "." : " ";
    for (let j = g.nv - 1; j >= 0; j -= 5) { let line = g.v(j).toFixed(1).padStart(5) + " "; for (let i = 0; i < g.nu; i += 3) line += cls(j * g.nu + i); console.log(line); }
    console.log("widths straight", JSON.stringify(w0), "deviated", JSON.stringify(w1));
  }

  // clearances under the inferior turbinates (inferior meatus) and the turbinate / cleft geometry
  const meatus = {};
  for (const [side, t] of [["L", tL], ["R", tR]]) {
    let min = Infinity;
    for (let i = 0; i < g.nu; i++) { let low = Infinity; for (let j = 0; j < g.nv; j++) if (t[j * g.nu + i]) { low = g.v(j); break; } if (Number.isFinite(low)) min = Math.min(min, low - yf(g.u(i))); }
    meatus[side] = min;
  }
  const area = (m) => m.reduce((q, v) => q + v, 0) * g.h * g.h;
  const geom = { area: { infL: area(tL), infR: area(tR), midL: area(mL), midR: area(mR) }, infL: bounds(tL), infR: bounds(tR), midL: bounds(mL), midR: bounds(mR), meatus, cavity: bounds(cav), wallThickness: P.wall };
  return { z0, g, cav, bone, sCart, sBone, mucL, mucR, tL, tR, mL, mR, geom, lining, airL, airR, yTop, yf, xw, widths: { straight: w0, deviated: w1 }, rowMed, rowObs, P, D };
}


// ── meshing ──
function maskBounds(g, m) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) if (m[j * g.nu + i]) { x0 = Math.min(x0, g.u(i)); x1 = Math.max(x1, g.u(i)); y0 = Math.min(y0, g.v(j)); y1 = Math.max(y1, g.v(j)); }
  return { x0, x1, y0, y1 };
}

/** Closed slab: the 2D mask extruded over z ∈ [zBack, zFront] with rounded rims (radius r). */
function slab(g, mask, zBack, zFront, r, cell) {
  const sd = signedDistance(g, mask, 1.5);
  const bb = maskBounds(g, mask);
  const zc = (zBack + zFront) / 2, hz = (zFront - zBack) / 2;
  const f = (x, y, z) => plate(g.sample(sd, x, y, 1), Math.abs(z - zc) - hz, r);
  return surfaceNets(f, [bb.x0 - 0.1, bb.y0 - 0.1, zBack - 0.1], [bb.x1 + 0.1, bb.y1 + 0.1, zFront + 0.1], cell);
}

/** Builds the corte_* parts. `simplify` decimates nodes without morph targets. */
export function meshSlice(sec, simplify) {
  const { g, P, D } = sec, zF = sec.z0, zB = sec.z0 - P.depth;
  const parts = [];
  const solid = (name, mask, { morph = null, cell = [0.04, 0.04, 0.04] } = {}) => {
    let m = slab(g, mask, zB, zF, P.edge, cell);
    m = taubin(m, 2);
    // taubin leaves the flat front face where it is; snap it to z0 exactly (flat region only)
    for (let i = 2; i < m.pos.length; i += 3) if (Math.abs(m.pos[i] - zF) < 0.004) m.pos[i] = zF;
    if (morph) {
      const dev = Float32Array.from(m.pos);
      for (let i = 0; i < dev.length; i += 3) dev[i] += morph(m.pos[i], m.pos[i + 1], m.pos[i + 2]);
      m = { ...m, morphs: [{ name: "desvio", pos: dev }] };
    } else m = simplify(m);
    parts.push({ name, ...m });
  };
  const shift = (x, y, z) => D(z, y);
  solid("corte_osso", sec.bone, { cell: [0.05, 0.05, 0.04] });
  solid("corte_concha_dir", sec.tR);
  solid("corte_concha_esq", sec.tL);
  solid("corte_concha_media_dir", sec.mR);
  solid("corte_concha_media_esq", sec.mL);
  if (sec.sCart.some((v) => v)) solid("corte_septo_cartilagem", sec.sCart, { morph: shift, cell: [0.04, 0.06, 0.04] });
  solid("corte_septo_osso", sec.sBone, { morph: shift, cell: [0.04, 0.12, 0.05] });
  solid("corte_mucosa_septal_dir", sec.mucR, { morph: shift, cell: [0.02, 0.12, 0.05] });
  solid("corte_mucosa_septal_esq", sec.mucL, { morph: shift, cell: [0.02, 0.12, 0.05] });
  solid("corte_mucosa_parede", sec.lining, { cell: [0.025, 0.025, 0.04] });
  // air: thinner than the slab, centred in depth; displaced with the septum next to it
  const zc = (zF + zB) / 2, hz = P.airDepth / 2;
  for (const side of ["R", "L"]) {
    const mask = side === "L" ? sec.airL : sec.airR;
    const sd = signedDistance(g, mask, 1.5), bb = maskBounds(g, mask);
    const f = (x, y, z) => plate(g.sample(sd, x, y, 1), Math.abs(z - zc) - hz, 0.03);
    let m = taubin(surfaceNets(f, [bb.x0 - 0.1, bb.y0 - 0.1, zc - hz - 0.1], [bb.x1 + 0.1, bb.y1 + 0.1, zc + hz + 0.1], [0.06, 0.12, 0.06]), 2);
    const sgn = side === "L" ? 1 : -1, med = sec.rowMed[side], obs = sec.rowObs[side];
    const dev = Float32Array.from(m.pos);
    for (let i = 0; i < dev.length; i += 3) {
      const x = m.pos[i], y = m.pos[i + 1], z = m.pos[i + 2];
      const j = Math.round((y - g.v0) / g.h);
      const xm = med[j], xo = obs[j];
      if (!Number.isFinite(xm) || !Number.isFinite(xo)) continue;
      const t = (x - xm) * sgn / ((xo - xm) * sgn); // 0 at the mucosa face … 1 at the first obstacle
      if (t < -0.2 || t > 1) continue;
      dev[i] += D(z, y) * Math.min(1, Math.max(0, 1 - t));
    }
    parts.push({ name: side === "L" ? "corte_ar_esq" : "corte_ar_dir", ...m, morphs: [{ name: "desvio", pos: dev }] });
  }
  return parts;
}
