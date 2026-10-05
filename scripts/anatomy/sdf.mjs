// 2D masks → signed distance fields → smooth 3D plates (naive surface nets).
// Used to synthesise thin midline structures (septum pieces, mucosa) that the
// BodyParts3D scan does not resolve, while keeping outlines taken from the scan.

/** A regular grid over the sagittal plane: u = anterior (z), v = up (y). */
export class Grid2D {
  constructor(u0, u1, v0, v1, h) {
    this.u0 = u0; this.v0 = v0; this.h = h;
    this.nu = Math.ceil((u1 - u0) / h) + 1;
    this.nv = Math.ceil((v1 - v0) / h) + 1;
  }
  mask() { return new Uint8Array(this.nu * this.nv); }
  field() { return new Float32Array(this.nu * this.nv); }
  u(i) { return this.u0 + i * this.h; }
  v(j) { return this.v0 + j * this.h; }
  /** Bilinear sample of a field at (u, v); outside → `fallback`. */
  sample(f, u, v, fallback = 1) {
    const x = (u - this.u0) / this.h, y = (v - this.v0) / this.h;
    if (x < 0 || y < 0 || x >= this.nu - 1 || y >= this.nv - 1) return fallback;
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const k = j * this.nu + i;
    return (f[k] * (1 - fx) + f[k + 1] * fx) * (1 - fy) + (f[k + this.nu] * (1 - fx) + f[k + this.nu + 1] * fx) * fy;
  }
  /** Fill a mask from a predicate on cell centres. */
  fill(pred, into = this.mask()) {
    for (let j = 0; j < this.nv; j++) for (let i = 0; i < this.nu; i++) if (pred(this.u(i), this.v(j))) into[j * this.nu + i] = 1;
    return into;
  }
}

export function pointInPolygon(u, v, poly) {
  let inside = false;
  for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
    const [ua, va] = poly[a], [ub, vb] = poly[b];
    if ((va > v) !== (vb > v) && u < ((ub - ua) * (v - va)) / (vb - va) + ua) inside = !inside;
  }
  return inside;
}

/** Rasterise the (u, v) projection of a mesh's triangles into a mask. */
export function rasterizeMesh(grid, mesh, project, into = grid.mask()) {
  const p = mesh.pos;
  for (let t = 0; t < mesh.idx.length; t += 3) {
    const pts = [0, 1, 2].map((k) => project(p[mesh.idx[t + k] * 3], p[mesh.idx[t + k] * 3 + 1], p[mesh.idx[t + k] * 3 + 2]));
    const us = pts.map((q) => q[0]), vs = pts.map((q) => q[1]);
    const i0 = Math.max(0, Math.floor((Math.min(...us) - grid.u0) / grid.h));
    const i1 = Math.min(grid.nu - 1, Math.ceil((Math.max(...us) - grid.u0) / grid.h));
    const j0 = Math.max(0, Math.floor((Math.min(...vs) - grid.v0) / grid.h));
    const j1 = Math.min(grid.nv - 1, Math.ceil((Math.max(...vs) - grid.v0) / grid.h));
    const [[ax, ay], [bx, by], [cx, cy]] = pts;
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(d) < 1e-12) continue;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = grid.u(i), y = grid.v(j);
      const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d;
      const l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d;
      if (l1 >= -0.02 && l2 >= -0.02 && 1 - l1 - l2 >= -0.02) into[j * grid.nu + i] = 1;
    }
  }
  return into;
}

// ── Binary morphology & mask algebra ──
export const and = (a, b) => a.map((x, i) => x & b[i]);
export const or = (a, b) => a.map((x, i) => x | b[i]);
export const not = (a) => a.map((x) => 1 - x);
export const minus = (a, b) => a.map((x, i) => x & (1 - b[i]));

/** Keep the largest 4-connected region of a mask (drops speckles). */
export function largestRegion(grid, m) {
  const label = new Int32Array(m.length).fill(-1);
  let best = -1, bestSize = 0, id = 0;
  for (let s = 0; s < m.length; s++) {
    if (!m[s] || label[s] !== -1) continue;
    const stack = [s]; label[s] = id; let size = 0;
    while (stack.length) {
      const k = stack.pop(); size++;
      const i = k % grid.nu, j = (k / grid.nu) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= grid.nu || jj >= grid.nv) continue;
        const kk = jj * grid.nu + ii;
        if (m[kk] && label[kk] === -1) { label[kk] = id; stack.push(kk); }
      }
    }
    if (size > bestSize) { bestSize = size; best = id; }
    id++;
  }
  return m.map((_, k) => (label[k] === best ? 1 : 0));
}

/** Fill holes: cells not reachable from the border through empty cells. */
export function fillHoles(grid, m) {
  const seen = new Uint8Array(m.length);
  const stack = [];
  for (let i = 0; i < grid.nu; i++) stack.push(i, (grid.nv - 1) * grid.nu + i);
  for (let j = 0; j < grid.nv; j++) stack.push(j * grid.nu, j * grid.nu + grid.nu - 1);
  while (stack.length) {
    const k = stack.pop();
    if (seen[k] || m[k]) continue;
    seen[k] = 1;
    const i = k % grid.nu, j = (k / grid.nu) | 0;
    if (i > 0) stack.push(k - 1);
    if (i < grid.nu - 1) stack.push(k + 1);
    if (j > 0) stack.push(k - grid.nu);
    if (j < grid.nv - 1) stack.push(k + grid.nu);
  }
  return m.map((x, k) => (x || !seen[k] ? 1 : 0));
}

// Felzenszwalb & Huttenlocher squared distance transform (1D pass).
export function edt1d(f, n) {
  const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s;
    while (true) {
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      if (s <= z[k]) { k--; if (k < 0) { k = 0; break; } } else break;
    }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
  return d;
}

/** Euclidean distance (in grid units) from every cell to the nearest set cell. */
export function edt(grid, m) {
  const INF = 1e20, { nu, nv } = grid;
  const g = new Float64Array(nu * nv);
  for (let k = 0; k < g.length; k++) g[k] = m[k] ? 0 : INF;
  const col = new Float64Array(nv);
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) col[j] = g[j * nu + i];
    const d = edt1d(col, nv);
    for (let j = 0; j < nv; j++) g[j * nu + i] = d[j];
  }
  const row = new Float64Array(nu);
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) row[i] = g[j * nu + i];
    const d = edt1d(row, nu);
    for (let i = 0; i < nu; i++) g[j * nu + i] = Math.sqrt(d[i]);
  }
  return g;
}

/** Signed distance (world units, negative inside) of a mask, lightly blurred for smooth outlines. */
export function signedDistance(grid, m, blur = 1.5) {
  const out = edt(grid, m), inn = edt(grid, not(m));
  const f = grid.field();
  for (let k = 0; k < f.length; k++) f[k] = (m[k] ? -(inn[k] - 0.5) : out[k] - 0.5) * grid.h;
  return blur > 0 ? gaussian(grid, f, blur) : f;
}

/** Separable Gaussian blur of a field (sigma in cells). */
export function gaussian(grid, f, sigma) {
  const r = Math.ceil(sigma * 3), w = [];
  for (let i = -r; i <= r; i++) w.push(Math.exp((-i * i) / (2 * sigma * sigma)));
  const sum = w.reduce((a, b) => a + b, 0);
  const { nu, nv } = grid;
  const tmp = new Float32Array(f.length), out = new Float32Array(f.length);
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += w[k + r] * f[j * nu + Math.min(nu - 1, Math.max(0, i + k))];
    tmp[j * nu + i] = s / sum;
  }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += w[k + r] * tmp[Math.min(nv - 1, Math.max(0, j + k)) * nu + i];
    out[j * nu + i] = s / sum;
  }
  return out;
}

/**
 * Naive surface nets over a box. `f(x, y, z)` is a signed distance (negative
 * inside). Returns a watertight { pos, idx } mesh.
 */
export function surfaceNets(f, min, max, cell) {
  const n = [0, 1, 2].map((a) => Math.max(2, Math.ceil((max[a] - min[a]) / cell[a]) + 1));
  const [nx, ny, nz] = n;
  const vals = new Float32Array(nx * ny * nz);
  const at = (i, j, k) => (k * ny + j) * nx + i;
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++)
    vals[at(i, j, k)] = f(min[0] + i * cell[0], min[1] + j * cell[1], min[2] + k * cell[2]);

  const vid = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const cid = (i, j, k) => (k * (ny - 1) + j) * (nx - 1) + i;
  const pos = [];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const c = corners.map(([a, b, d]) => vals[at(i + a, j + b, k + d)]);
    let inside = 0;
    for (const x of c) if (x < 0) inside++;
    if (inside === 0 || inside === 8) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [a, b] of edges) {
      if ((c[a] < 0) === (c[b] < 0)) continue;
      const t = c[a] / (c[a] - c[b]);
      const pa = corners[a], pb = corners[b];
      sx += pa[0] + t * (pb[0] - pa[0]); sy += pa[1] + t * (pb[1] - pa[1]); sz += pa[2] + t * (pb[2] - pa[2]);
      cnt++;
    }
    vid[cid(i, j, k)] = pos.length / 3;
    pos.push(min[0] + (i + sx / cnt) * cell[0], min[1] + (j + sy / cnt) * cell[1], min[2] + (k + sz / cnt) * cell[2]);
  }
  const idx = [];
  // Cell vertex id, or -1 outside the cell range.
  const cv = (i, j, k) => (i < 0 || j < 0 || k < 0 || i > nx - 2 || j > ny - 2 || k > nz - 2 ? -1 : vid[cid(i, j, k)]);
  // For an edge along axis d starting at grid point p, the 4 cells around it
  // (in the u,v plane, u = d+1, v = d+2) form a quad whose normal points +d
  // when p is inside.
  const quad = (a, b, c, d, flipped) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flipped) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
  };
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v0 = vals[at(i, j, k)] < 0;
    if (i < nx - 1 && v0 !== (vals[at(i + 1, j, k)] < 0))
      quad(cv(i, j - 1, k - 1), cv(i, j, k - 1), cv(i, j, k), cv(i, j - 1, k), !v0);
    if (j < ny - 1 && v0 !== (vals[at(i, j + 1, k)] < 0))
      quad(cv(i - 1, j, k - 1), cv(i - 1, j, k), cv(i, j, k), cv(i, j, k - 1), !v0);
    if (k < nz - 1 && v0 !== (vals[at(i, j, k + 1)] < 0))
      quad(cv(i - 1, j - 1, k), cv(i, j - 1, k), cv(i, j, k), cv(i - 1, j, k), !v0);
  }
  return { pos: Float32Array.from(pos), idx: Uint32Array.from(idx) };
}

/** Rounded plate: 2D signed distance `d2` intersected with a slab |x - c| <= t/2, rim radius r. */
export function plate(d2, dx, r) {
  const a = d2 + r, b = dx + r;
  const ma = Math.max(a, 0), mb = Math.max(b, 0);
  return Math.hypot(ma, mb) + Math.min(Math.max(a, b), 0) - r;
}
