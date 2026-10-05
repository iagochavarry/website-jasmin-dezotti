// Nasal-floor height field + solid floor slab.
//
// The maxilla / palatine scans are thin shells: below the floor there is nothing
// but ragged alveolar sheets and tooth sockets. We measure the upper surface of
// the floor (z-buffer of up-facing triangles), cut every shell below it with a
// smooth field, and add a closed slab under the floor so a section through the
// cavity reads as a solid, clean floor. The same profile tells the septum
// where it has to rest (septum.mjs).
import { Grid2D, signedDistance, fillHoles, largestRegion, surfaceNets, gaussian, rasterizeMesh } from "./sdf.mjs";

/** Grid with u = z (anterior), v = x (patient's left). */
export function floorGrid() {
  return new Grid2D(-7.0, 1.0, -2.6, 2.6, 0.04);
}

/** Highest up-facing surface below `yMax` per (z, x) cell. NaN where there is none. */
export function floorTop(g, meshes, yMax = -0.85, yMin = -2.2) {
  const top = new Float32Array(g.nu * g.nv).fill(NaN);
  for (const m of meshes) {
    const p = m.pos;
    for (let t = 0; t < m.idx.length; t += 3) {
      const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
      // up-facing?
      const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
      const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      if (ny / nl < 0.5) continue;
      const P = [[p[a + 2], p[a], p[a + 1]], [p[b + 2], p[b], p[b + 1]], [p[c + 2], p[c], p[c + 1]]]; // [u, v, y]
      const us = P.map((q) => q[0]), vs = P.map((q) => q[1]);
      const i0 = Math.max(0, Math.floor((Math.min(...us) - g.u0) / g.h)), i1 = Math.min(g.nu - 1, Math.ceil((Math.max(...us) - g.u0) / g.h));
      const j0 = Math.max(0, Math.floor((Math.min(...vs) - g.v0) / g.h)), j1 = Math.min(g.nv - 1, Math.ceil((Math.max(...vs) - g.v0) / g.h));
      const [[ax, ay, ah], [bx, by, bh], [cx, cy, ch]] = P;
      const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(d) < 1e-12) continue;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const x = g.u(i), y = g.v(j);
        const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d;
        const l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d;
        const l3 = 1 - l1 - l2;
        if (l1 < 0 || l2 < 0 || l3 < 0) continue;
        const h = l1 * ah + l2 * bh + l3 * ch;
        if (h > yMax || h < yMin) continue;
        const k = j * g.nu + i;
        if (!(top[k] >= h)) top[k] = h;
      }
    }
  }
  return top;
}

/** Fill NaN cells by diffusing the nearest valid values (keeps valid cells untouched). */
export function inpaint(g, f) {
  const out = Float32Array.from(f);
  const valid = new Uint8Array(f.length).map((_, k) => (Number.isNaN(f[k]) ? 0 : 1));
  for (let pass = 0; pass < 400; pass++) {
    let missing = 0;
    const next = Uint8Array.from(valid), nv = Float32Array.from(out);
    for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) {
      const k = j * g.nu + i;
      if (valid[k]) continue;
      let s = 0, n = 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= g.nu || jj >= g.nv) continue;
        const kk = jj * g.nu + ii;
        if (valid[kk]) { s += out[kk]; n++; }
      }
      if (n) { nv[k] = s / n; next[k] = 1; } else missing++;
    }
    out.set(nv); valid.set(next);
    if (!missing) break;
  }
  return out;
}

/**
 * Build the floor profile from the maxilla/palatine meshes.
 * Returns { g, top (raw, NaN outside), cut (filled+smoothed), at(x, z), mid(z) }.
 */
export function buildFloor(meshes) {
  const g = floorGrid();
  const top = floorTop(g, meshes);
  const filled = inpaint(g, top);
  const smooth = gaussian(g, filled, 2);
  const at = (x, z) => g.sample(smooth, z, x, -1.45);
  const raw = (x, z) => g.sample(filled, z, x, -1.45);
  // Midline profile: highest floor point within |x| < 0.25 (the nasal crest the septum rests on),
  // lightly smoothed along z (±0.15 cm) so single-cell bumps don't leave gaps/notches.
  const rawMid = (z) => {
    let best = -Infinity;
    for (let x = -0.25; x <= 0.2501; x += 0.05) {
      const k = Math.round((x - g.v0) / g.h) * g.nu + Math.round((z - g.u0) / g.h);
      const v = top[k];
      if (v > best) best = v;
    }
    return Number.isFinite(best) ? best : NaN;
  };
  const mid = (z) => {
    let s = 0, n = 0;
    for (let dz = -0.15; dz <= 0.1501; dz += 0.05) { const v = rawMid(z + dz); if (Number.isFinite(v)) { s += v; n++; } }
    return n >= 4 ? s / n : NaN;
  };
  return { g, top, filled, smooth, at, raw, mid };
}

/**
 * Closed slab under the floor: top just below the floor surface (hidden), flat bottom.
 * Footprint = where the floor exists, |x| <= xMax. It is closed at its lateral ends (the
 * viewer draws cut caps from back faces, so a see-through end would show the background).
 */
export function floorSlab(floor, { xMax, thick = 0.5, tuck = 0.03, yMin = -1.95, cover = [] }) {
  const { g, top, smooth } = floor;
  let m = g.mask();
  for (let k = 0; k < m.length; k++) m[k] = Number.isNaN(top[k]) ? 0 : 1;
  // also cover everything the (already cut) bones project onto, so no shell is left with an open underside
  for (const c of cover) rasterizeMesh(g, c, (x, y, z) => [z, x], m);
  m = largestRegion(g, fillHoles(g, m));
  // carry the footprint straight out past the lateral cut plane so the slab's side is cut, never closed
  for (let i = 0; i < g.nu; i++) for (const sgn of [-1, 1]) {
    const j0 = Math.round((sgn * (xMax - 0.3) - g.v0) / g.h);
    if (!m[j0 * g.nu + i]) continue;
    for (let j = j0; j >= 0 && j < g.nv; j += sgn) m[j * g.nu + i] = 1;
  }
  // erode slightly so the slab never pokes out of the shell outline
  const sd = signedDistance(g, m, 2);
  const foot = (x, z) => g.sample(sd, z, x, 1) + 0.06;
  const f = (x, y, z) => {
    const h = Math.max(g.sample(smooth, z, Math.max(-1.25, Math.min(1.25, x)), -1.45), yMin + 0.25); // flat past |x| = 1.25
    return Math.max(y - (h - tuck), Math.min(h - 0.2, yMin) - y, foot(x, z), Math.abs(x) - xMax); // closed ends at |x| = xMax
  };
  return surfaceNets(f, [-xMax - 0.1, -2.6, -7.0], [xMax + 0.1, -0.6, 1.0], [0.05, 0.04, 0.05]);
}
