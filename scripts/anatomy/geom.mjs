// Small geometry queries used by the build checks: exact point-to-triangle distance
// over a uniform hash grid of triangles.

const CP = [0, 0, 0];
/** Closest point on a triangle to p (written into CP); returns the squared distance. */
function closestPointOnTriangle(px, py, pz, ax, ay, az, bx, by, bz, cx, cy, cz) {
  // Ericson, Real-Time Collision Detection.
  const out = (x, y, z) => { CP[0] = x; CP[1] = y; CP[2] = z; return (px - x) ** 2 + (py - y) ** 2 + (pz - z) ** 2; };
  const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  if (d1 <= 0 && d2 <= 0) return out(ax, ay, az);
  const bpx = px - bx, bpy = py - by, bpz = pz - bz;
  const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
  if (d3 >= 0 && d4 <= d3) return out(bx, by, bz);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return out(ax + v * abx, ay + v * aby, az + v * abz); }
  const cpx = px - cx, cpy = py - cy, cpz = pz - cz;
  const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
  if (d6 >= 0 && d5 <= d6) return out(cx, cy, cz);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return out(ax + w * acx, ay + w * acy, az + w * acz); }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    return out(bx + w * (cx - bx), by + w * (cy - by), bz + w * (cz - bz));
  }
  const denom = 1 / (va + vb + vc), v = vb * denom, w = vc * denom;
  return out(ax + v * abx + w * acx, ay + v * aby + w * acy, az + v * abz + w * acz);
}

/**
 * Distance query over a set of meshes ({ pos, idx } — positions can be overridden per
 * mesh with `posOf`, e.g. to evaluate a morph target).
 */
export function makeDistance(meshes, { cell = 0.2, posOf = (m) => m.pos } = {}) {
  const tris = []; // [pos, a, b, c]
  const grid = new Map();
  const key = (i, j, k) => (i + 512) * 1048576 + (j + 512) * 1024 + (k + 512);
  for (const m of meshes) {
    const p = posOf(m);
    for (let t = 0; t < m.idx.length; t += 3) {
      const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
      const id = tris.length;
      tris.push([p, a, b, c]);
      const lo = [0, 1, 2].map((k) => Math.floor(Math.min(p[a + k], p[b + k], p[c + k]) / cell));
      const hi = [0, 1, 2].map((k) => Math.floor(Math.max(p[a + k], p[b + k], p[c + k]) / cell));
      for (let i = lo[0]; i <= hi[0]; i++) for (let j = lo[1]; j <= hi[1]; j++) for (let k = lo[2]; k <= hi[2]; k++) {
        const kk = key(i, j, k);
        let l = grid.get(kk);
        if (!l) grid.set(kk, (l = []));
        l.push(id);
      }
    }
  }
  const seen = new Int32Array(tris.length).fill(-1);
  let stamp = 0;
  /** Distance to the nearest triangle; `dist.point` holds the closest point after a call. */
  function dist(x, y, z, maxR = 1.0) {
    stamp++;
    const bestPt = [0, 0, 0];
    const ci = Math.floor(x / cell), cj = Math.floor(y / cell), ck = Math.floor(z / cell);
    let best = Infinity;
    const maxRing = Math.ceil(maxR / cell);
    for (let r = 0; r <= maxRing; r++) {
      for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) {
        if (Math.max(Math.abs(i), Math.abs(j), Math.abs(k)) !== r) continue;
        const l = grid.get(key(ci + i, cj + j, ck + k));
        if (!l) continue;
        for (const id of l) {
          if (seen[id] === stamp) continue;
          seen[id] = stamp;
          const [p, a, b, c] = tris[id];
          const d = closestPointOnTriangle(x, y, z, p[a], p[a + 1], p[a + 2], p[b], p[b + 1], p[b + 2], p[c], p[c + 1], p[c + 2]);
          if (d < best) { best = d; bestPt[0] = CP[0]; bestPt[1] = CP[1]; bestPt[2] = CP[2]; }
        }
      }
      if (best <= (r * cell) ** 2) break; // nothing in further rings can be closer
    }
    dist.point = bestPt;
    return Math.sqrt(best);
  }
  return dist;
}
