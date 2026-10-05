// Shared helpers for build-head.mjs / check-head.mjs: BodyParts3D loading, voxel grids
// (scanline voxelisation, 3-D distance transforms, Gaussian blur, surface nets),
// manifold booleans, mesh capping, decimation and reading the compressed GLB back.
import fs from "node:fs";
import path from "node:path";
import { loadSTL, mapVertices, merge, normals, bbox, components } from "./mesh.mjs";
import { edt1d, surfaceNets } from "./sdf.mjs";
import { MeshoptSimplifier, MeshoptDecoder } from "meshoptimizer";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";

await MeshoptSimplifier.ready;

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
export const CACHE = path.join(ROOT, ".cache/bodyparts3d");
const MIRROR = "https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl";
// BodyParts3D: x = patient's left(+)/right(-), y = posterior(+), z = up. mm → scene cm.
export const ORIGIN = { y: -185, z: 1505 };
export const toScene = (x, y, z) => [x * 0.1, (z - ORIGIN.z) * 0.1, -(y - ORIGIN.y) * 0.1];

export async function stl(fma) {
  const file = path.join(CACHE, `FMA${fma}.stl`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(CACHE, { recursive: true });
    const res = await fetch(`${MIRROR}/FMA${fma}.stl`);
    if (!res.ok) throw new Error(`download FMA${fma}: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return mapVertices(loadSTL(file), toScene);
}

// ───────────────────────── topology ─────────────────────────
/** Edge statistics: open edges, non-manifold edges, inconsistently oriented edges. */
export function topo(m) {
  const e = new Map();
  for (let t = 0; t < m.idx.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = m.idx[t + k], b = m.idx[t + (k + 1) % 3];
    const key = a < b ? a * 4294967296 + b : b * 4294967296 + a;
    const r = e.get(key) || [0, 0];
    r[a < b ? 0 : 1]++;
    e.set(key, r);
  }
  let open = 0, nonManifold = 0, flipped = 0;
  for (const r of e.values()) {
    if (r[0] + r[1] === 1) open++;
    else if (r[0] + r[1] > 2) nonManifold++;
    else if (r[0] !== 1) flipped++;
  }
  return { open, nonManifold, flipped, ok: !open && !nonManifold && !flipped };
}

/** Signed volume (cm³, positive for outward-facing closed meshes). */
export function volume(m) {
  let v = 0; const p = m.pos;
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
    v += (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) / 6;
  }
  return v;
}

/** Close planar holes (a mesh cut by a plane) with a centroid fan per boundary loop. */
export function capHoles(m) {
  const next = new Map(), pos = Array.from(m.pos), idx = Array.from(m.idx);
  const cnt = new Map();
  const key = (a, b) => a * 4294967296 + b;
  for (let t = 0; t < m.idx.length; t += 3) for (let k = 0; k < 3; k++) {
    const a = m.idx[t + k], b = m.idx[t + (k + 1) % 3];
    cnt.set(key(a, b), (cnt.get(key(a, b)) ?? 0) + 1);
  }
  const bnd = [];
  for (const k of cnt.keys()) {
    const a = Math.floor(k / 4294967296), b = k - a * 4294967296;
    if (!cnt.has(key(b, a))) bnd.push([b, a]); // boundary half-edge reversed → the cap triangle edge
  }
  const outs = new Map();
  for (const [a, b] of bnd) { if (!outs.has(a)) outs.set(a, []); outs.get(a).push(b); }
  const used = new Set();
  for (const [a0, b0] of bnd) {
    if (used.has(key(a0, b0))) continue;
    const loop = [a0]; let a = a0, b = b0;
    used.add(key(a, b));
    while (b !== a0) {
      loop.push(b);
      const cands = (outs.get(b) ?? []).filter((c) => !used.has(key(b, c)));
      if (!cands.length) break;
      used.add(key(b, cands[0])); a = b; b = cands[0];
    }
    if (loop.length < 3) continue;
    let cx = 0, cy = 0, cz = 0;
    for (const v of loop) { cx += pos[v * 3]; cy += pos[v * 3 + 1]; cz += pos[v * 3 + 2]; }
    const c = pos.length / 3;
    pos.push(cx / loop.length, cy / loop.length, cz / loop.length);
    for (let i = 0; i < loop.length; i++) idx.push(loop[i], loop[(i + 1) % loop.length], c);
  }
  return { pos: Float32Array.from(pos), idx: Uint32Array.from(idx) };
}

// ───────────────────────── simplify ─────────────────────────
export function simplify(m, ratio, error = 0.01, lockBorder = true) {
  const target = Math.max(12, Math.floor((m.idx.length * ratio) / 3) * 3);
  const [idx] = MeshoptSimplifier.simplify(m.idx, m.pos, 3, target, error, lockBorder ? ["LockBorder"] : []);
  const remap = new Int32Array(m.pos.length / 3).fill(-1), order = [], out = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) {
    const v = idx[i];
    if (remap[v] < 0) { remap[v] = order.length; order.push(v); }
    out[i] = remap[v];
  }
  const pos = new Float32Array(order.length * 3);
  order.forEach((v, i) => pos.set(m.pos.subarray(v * 3, v * 3 + 3), i * 3));
  return { pos, idx: out };
}

// ───────────────────────── voxel grids ─────────────────────────
export class Vox {
  constructor(min, max, h) {
    this.h = h; this.min = min.slice();
    this.n = [0, 1, 2].map((a) => Math.ceil((max[a] - min[a]) / h) + 1);
    [this.nx, this.ny, this.nz] = this.n;
    this.size = this.nx * this.ny * this.nz;
  }
  idx(i, j, k) { return (k * this.ny + j) * this.nx + i; }
  x(i) { return this.min[0] + i * this.h; }
  y(j) { return this.min[1] + j * this.h; }
  z(k) { return this.min[2] + k * this.h; }
  mask() { return new Uint8Array(this.size); }
  field(v = 0) { return new Float32Array(this.size).fill(v); }
  /** Trilinear sample of a field (clamped to the grid). */
  sample(f, x, y, z) {
    let u = (x - this.min[0]) / this.h, v = (y - this.min[1]) / this.h, w = (z - this.min[2]) / this.h;
    u = Math.min(this.nx - 1.0001, Math.max(0, u)); v = Math.min(this.ny - 1.0001, Math.max(0, v)); w = Math.min(this.nz - 1.0001, Math.max(0, w));
    const i = u | 0, j = v | 0, k = w | 0, fu = u - i, fv = v - j, fw = w - k;
    const a = this.idx(i, j, k), sx = 1, sy = this.nx, sz = this.nx * this.ny;
    const l = (o) => f[a + o];
    const c00 = l(0) * (1 - fu) + l(sx) * fu, c10 = l(sy) * (1 - fu) + l(sy + sx) * fu;
    const c01 = l(sz) * (1 - fu) + l(sz + sx) * fu, c11 = l(sz + sy) * (1 - fu) + l(sz + sy + sx) * fu;
    return (c00 * (1 - fv) + c10 * fv) * (1 - fw) + (c01 * (1 - fv) + c11 * fv) * fw;
  }
  /** Fill a field/mask from f(x, y, z). */
  fill(f, into = this.field()) {
    for (let k = 0; k < this.nz; k++) for (let j = 0; j < this.ny; j++) for (let i = 0; i < this.nx; i++) into[this.idx(i, j, k)] = f(this.x(i), this.y(j), this.z(k));
    return into;
  }
}

/** Voxelise a closed mesh (ray parity along z, jittered rays). Returns a 0/1 mask. */
export function voxelize(g, m, into = g.mask()) {
  const cols = new Array(g.nx * g.ny);
  const p = m.pos, h = g.h, JX = 1.37e-5, JY = 2.11e-5;
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
    const ax = p[a], ay = p[a + 1], az = p[a + 2], bx = p[b], by = p[b + 1], bz = p[b + 2], cx = p[c], cy = p[c + 1], cz = p[c + 2];
    const i0 = Math.max(0, Math.ceil((Math.min(ax, bx, cx) - g.min[0] - JX) / h)), i1 = Math.min(g.nx - 1, Math.floor((Math.max(ax, bx, cx) - g.min[0] - JX) / h));
    const j0 = Math.max(0, Math.ceil((Math.min(ay, by, cy) - g.min[1] - JY) / h)), j1 = Math.min(g.ny - 1, Math.floor((Math.max(ay, by, cy) - g.min[1] - JY) / h));
    if (i1 < i0 || j1 < j0) continue;
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(d) < 1e-14) continue;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = g.min[0] + i * h + JX, y = g.min[1] + j * h + JY;
      const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d, l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d, l3 = 1 - l1 - l2;
      if (l1 < 0 || l2 < 0 || l3 < 0) continue;
      const z = l1 * az + l2 * bz + l3 * cz;
      (cols[j * g.nx + i] ??= []).push(z);
    }
  }
  for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) {
    const zs = cols[j * g.nx + i]; if (!zs) continue;
    zs.sort((u, v) => u - v);
    for (let q = 0; q + 1 < zs.length; q += 2) {
      const k0 = Math.max(0, Math.ceil((zs[q] - g.min[2]) / h)), k1 = Math.min(g.nz - 1, Math.floor((zs[q + 1] - g.min[2]) / h));
      for (let k = k0; k <= k1; k++) into[g.idx(i, j, k)] = 1;
    }
  }
  return into;
}

/** Euclidean distance (voxel units) to the nearest set voxel (mask value 1). */
export function edt3(g, m) {
  const { nx, ny, nz } = g, INF = 1e20, f = new Float64Array(g.size);
  for (let i = 0; i < f.length; i++) f[i] = m[i] ? 0 : INF;
  const line = (len, get, set) => {
    const buf = new Float64Array(len);
    for (let q = 0; q < len; q++) buf[q] = get(q);
    const r = edt1d(buf, len);
    for (let q = 0; q < len; q++) set(q, r[q]);
  };
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) { const o = (k * ny + j) * nx; line(nx, (q) => f[o + q], (q, v) => { f[o + q] = v; }); }
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) { const o = k * ny * nx + i; line(ny, (q) => f[o + q * nx], (q, v) => { f[o + q * nx] = v; }); }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const o = j * nx + i, s = nx * ny; line(nz, (q) => f[o + q * s], (q, v) => { f[o + q * s] = v; }); }
  for (let i = 0; i < f.length; i++) f[i] = Math.sqrt(f[i]);
  return f;
}

/** Signed distance in cm (negative inside) of a mask. */
export function sdf(g, m) {
  const inv = new Uint8Array(m.length); for (let i = 0; i < m.length; i++) inv[i] = m[i] ? 0 : 1;
  const dOut = edt3(g, m), dIn = edt3(g, inv), f = new Float32Array(m.length);
  for (let i = 0; i < f.length; i++) f[i] = (m[i] ? -(dIn[i] - 0.5) : dOut[i] - 0.5) * g.h;
  return f;
}

/** Separable Gaussian blur of a field (sigma in voxels). */
export function gauss3(g, f, sigma) {
  if (sigma <= 0) return f;
  const r = Math.ceil(sigma * 3), w = [];
  for (let i = -r; i <= r; i++) w.push(Math.exp((-i * i) / (2 * sigma * sigma)));
  const s = w.reduce((a, b) => a + b, 0); for (let i = 0; i < w.length; i++) w[i] /= s;
  const dims = [g.nx, g.ny, g.nz], strides = [1, g.nx, g.nx * g.ny];
  let src = f;
  for (let ax = 0; ax < 3; ax++) {
    const dst = new Float32Array(f.length), n = dims[ax], st = strides[ax];
    const o1 = (ax + 1) % 3, o2 = (ax + 2) % 3;
    for (let b = 0; b < dims[o2]; b++) for (let a = 0; a < dims[o1]; a++) {
      const base = a * strides[o1] + b * strides[o2];
      for (let q = 0; q < n; q++) {
        let acc = 0;
        for (let k = -r; k <= r; k++) acc += w[k + r] * src[base + Math.min(n - 1, Math.max(0, q + k)) * st];
        dst[base + q * st] = acc;
      }
    }
    src = dst;
  }
  return src;
}

/** Remove the triangles around non-manifold edges and cap the holes this leaves (rare surface-nets pinches). */
export function repairManifold(m) {
  let cur = m;
  for (let pass = 0; pass < 6; pass++) {
    if (topo(cur).ok) return cur;
    const cnt = new Map();
    for (let t = 0; t < cur.idx.length; t += 3) for (let k = 0; k < 3; k++) {
      const a = cur.idx[t + k], b = cur.idx[t + (k + 1) % 3];
      const key = a < b ? a * 4294967296 + b : b * 4294967296 + a;
      cnt.set(key, (cnt.get(key) ?? 0) + 1);
    }
    const bad = new Set([...cnt].filter(([, c]) => c > 2).map(([k]) => k));
    const keep = [];
    for (let t = 0; t < cur.idx.length; t += 3) {
      let drop = false;
      for (let k = 0; k < 3 && !drop; k++) {
        const a = cur.idx[t + k], b = cur.idx[t + (k + 1) % 3];
        if (bad.has(a < b ? a * 4294967296 + b : b * 4294967296 + a)) drop = true;
      }
      if (!drop) keep.push(cur.idx[t], cur.idx[t + 1], cur.idx[t + 2]);
    }
    cur = capHoles({ pos: cur.pos, idx: Uint32Array.from(keep) });
  }
  return cur;
}

/** Like `nets`, but guarantees a valid manifold (retries the iso level, then repairs pinches). */
export function netsManifold(g, f, iso = 0, box = null) {
  for (let t = 0; t < 9; t++) {
    const m = nets(g, f, iso + (t % 2 ? 1 : -1) * Math.ceil(t / 2) * 0.0021 * (t ? 1 : 0), box);
    if (topo(m).ok) return m;
    const r = repairManifold(m);
    if (topo(r).ok) return r;
  }
  throw new Error("netsManifold: could not produce a manifold surface");
}

/** Surface-nets mesh of the iso-level `iso` of a grid field (negative = inside). */
export function nets(g, f, iso = 0, box = null) {
  const min = box ? box.min : g.min, max = box ? box.max : [g.x(g.nx - 1), g.y(g.ny - 1), g.z(g.nz - 1)];
  return surfaceNets((x, y, z) => g.sample(f, x, y, z) - iso, min, max, [g.h, g.h, g.h]);
}

// ───────────────────────── manifold booleans ─────────────────────────
let _wasm;
export async function manifold() {
  if (_wasm) return _wasm;
  const Module = (await import("manifold-3d")).default;
  _wasm = await Module();
  _wasm.setup();
  return _wasm;
}
export function toManifold(wasm, m) {
  const make = (q) => { const mesh = new wasm.Mesh({ numProp: 3, vertProperties: Float32Array.from(q.pos), triVerts: Uint32Array.from(q.idx) }); mesh.merge(); return new wasm.Manifold(mesh); };
  try { return make(m); } catch (e) { return make(repairManifold(m)); }
}
export function fromManifold(man) {
  const mesh = man.getMesh();
  const np = mesh.numProp, vp = mesh.vertProperties, pos = new Float32Array((vp.length / np) * 3);
  for (let i = 0; i < vp.length / np; i++) { pos[i * 3] = vp[i * np]; pos[i * 3 + 1] = vp[i * np + 1]; pos[i * 3 + 2] = vp[i * np + 2]; }
  return { pos, idx: Uint32Array.from(mesh.triVerts) };
}
export function boolean(wasm, op, a, bs) {
  const A = toManifold(wasm, a), Bs = bs.map((b) => toManifold(wasm, b));
  const r = op === "subtract" ? Bs.reduce((x, b) => x.subtract(b), A) : op === "intersect" ? Bs.reduce((x, b) => x.intersect(b), A) : Bs.reduce((x, b) => x.add(b), A);
  return fromManifold(r);
}

export { merge, normals, bbox };

/** Mark every voxel touched by the surface of a mesh (dense barycentric sampling). */
export function voxelizeSurface(g, m, into = g.mask()) {
  const p = m.pos, h = g.h;
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
    const e = Math.max(Math.hypot(p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]), Math.hypot(p[c] - p[a], p[c + 1] - p[a + 1], p[c + 2] - p[a + 2]), Math.hypot(p[c] - p[b], p[c + 1] - p[b + 1], p[c + 2] - p[b + 2]));
    const n = Math.max(1, Math.ceil(e / (h * 0.5)));
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
      const u = i / n, v = j / n, w = 1 - u - v;
      const x = w * p[a] + u * p[b] + v * p[c], y = w * p[a + 1] + u * p[b + 1] + v * p[c + 1], z = w * p[a + 2] + u * p[b + 2] + v * p[c + 2];
      const ii = Math.round((x - g.min[0]) / h), jj = Math.round((y - g.min[1]) / h), kk = Math.round((z - g.min[2]) / h);
      if (ii >= 0 && jj >= 0 && kk >= 0 && ii < g.nx && jj < g.ny && kk < g.nz) into[g.idx(ii, jj, kk)] = 1;
    }
  }
  return into;
}

/** Interior of a (possibly leaky) surface: not reachable from the grid border without crossing the surface voxels. */
export function fillSurface(g, shell) {
  const out = new Uint8Array(g.size).fill(1), stack = [];
  const push = (i, j, k) => { const q = g.idx(i, j, k); if (!shell[q] && out[q]) { out[q] = 0; stack.push(q); } };
  for (let k = 0; k < g.nz; k++) for (let j = 0; j < g.ny; j++) { push(0, j, k); push(g.nx - 1, j, k); }
  for (let k = 0; k < g.nz; k++) for (let i = 0; i < g.nx; i++) { push(i, 0, k); push(i, g.ny - 1, k); }
  for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) { push(i, j, 0); push(i, j, g.nz - 1); }
  while (stack.length) {
    const q = stack.pop(), i = q % g.nx, j = ((q / g.nx) | 0) % g.ny, k = (q / (g.nx * g.ny)) | 0;
    if (i > 0) push(i - 1, j, k); if (i < g.nx - 1) push(i + 1, j, k);
    if (j > 0) push(i, j - 1, k); if (j < g.ny - 1) push(i, j + 1, k);
    if (k > 0) push(i, j, k - 1); if (k < g.nz - 1) push(i, j, k + 1);
  }
  return out;
}

/**
 * Manifold-preserving decimation: Manifold.simplify(tolerance) with the tolerance searched so that
 * the result has about `tris` triangles (never more than `maxTol` cm of deviation).
 * (meshoptimizer's simplifier is not used on parts that must stay closed manifolds: it pinches edges.)
 */
export function decimate(m, tris, maxTol = 0.06, wasm = _wasm) {
  let M;
  try { M = toManifold(wasm, m); } catch (e) { throw new Error(`decimate: input is not manifold (${e.message})`); }
  if (m.idx.length / 3 <= tris) return fromManifold(M);
  let lo = 0, hi = maxTol, best = null;
  const at = (tol) => fromManifold(M.simplify(tol));
  const top = at(hi);
  if (top.idx.length / 3 > tris) return top; // cannot reach the target within the allowed deviation
  best = top;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2, r = at(mid);
    if (r.idx.length / 3 > tris) lo = mid; else { hi = mid; best = r; }
  }
  return best;
}

/**
 * Smooth, closed, manifold re-mesh of a (possibly ragged or self-intersecting) bone: voxelise,
 * blur the signed distance, surface-nets. `h` voxel (cm), `sigma` blur (voxels).
 */
export function remesh(m, h = 0.07, sigma = 1.3, pad = 0.4) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < m.pos.length; i++) { const k = i % 3; mn[k] = Math.min(mn[k], m.pos[i]); mx[k] = Math.max(mx[k], m.pos[i]); }
  const g = new Vox(mn.map((v) => v - pad), mx.map((v) => v + pad), h);
  const mask = voxelize(g, m);
  return netsManifold(g, gauss3(g, sdf(g, mask), sigma), 0);
}

/** Drop stray positive-volume pieces smaller than `minVol` mL (boolean/decimation shards); inner void shells are kept. */
export function dropShards(m, minVol = 0.02) {
  const cs = components(m);
  if (cs.length === 1) return m;
  const keep = cs.filter((c) => { const v = volume(c); return v < 0 || v >= minVol; });
  return keep.length === 1 ? keep[0] : merge(keep);
}

/** Decoded world-space positions + indices of every node of a (meshopt + quantized) GLB, keyed by node name. */
export async function readParts(file) {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  const doc = await io.read(file);
  const out = {};
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const prim = mesh.listPrimitives()[0];
    const pos = decodeAcc(prim.getAttribute("POSITION"), node.getWorldMatrix());
    out[node.getName()] = { pos, idx: Uint32Array.from(prim.getIndices().getArray()) };
  }
  return out;
}
const decodeAcc = (acc, M) => {
  const n = acc.getCount(), a = new Float32Array(n * 3), v = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    acc.getElement(i, v);
    a[i * 3] = M[0] * v[0] + M[4] * v[1] + M[8] * v[2] + M[12];
    a[i * 3 + 1] = M[1] * v[0] + M[5] * v[1] + M[9] * v[2] + M[13];
    a[i * 3 + 2] = M[2] * v[0] + M[6] * v[1] + M[10] * v[2] + M[14];
  }
  return a;
};
