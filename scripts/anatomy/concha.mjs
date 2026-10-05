// Re-shapes the inferior turbinates (BodyParts3D scans) so the section reads like a
// real coronal CT: the turbinate hangs from the lateral wall, leaves a visible
// inferior meatus above the floor, and (left side) a patent gap to the septum.
//   - squeeze: the medial free edge moves toward the wall by `squeeze` (cm),
//   - lift: the free lower edge rises by `lift` (cm) — the attachment stays put,
//   - attach: the upper/lateral flange is stretched onto the lateral wall.
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Medial surface of the lateral wall as a function of (y, z): nearest x beyond `from` (signed by side). */
export function wallProfile(side, meshes, from = 0.45, cell = 0.05) {
  const map = new Map();
  const key = (j, k) => j * 4096 + k;
  for (const m of meshes) {
    for (let i = 0; i < m.pos.length; i += 3) {
      const x = m.pos[i] * side;
      if (x < from) continue;
      const j = Math.round(m.pos[i + 1] / cell), k = Math.round(m.pos[i + 2] / cell);
      for (let dj = -1; dj <= 1; dj++) for (let dk = -1; dk <= 1; dk++) {
        const kk = key(j + dj, k + dk);
        const cur = map.get(kk);
        if (cur === undefined || x < cur) map.set(kk, x);
      }
    }
  }
  return (y, z) => {
    const v = map.get(key(Math.round(y / cell), Math.round(z / cell)));
    return v === undefined ? Infinity : v * side;
  };
}

export function reshapeConcha(m, side, wall, { squeeze, lift, reach = 0.65 }) {
  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
  for (let i = 0; i < m.pos.length; i += 3) {
    xmin = Math.min(xmin, m.pos[i]); xmax = Math.max(xmax, m.pos[i]);
    ymin = Math.min(ymin, m.pos[i + 1]); ymax = Math.max(ymax, m.pos[i + 1]);
  }
  const xl = side > 0 ? xmax : xmin, xm = side > 0 ? xmin : xmax; // lateral / medial extremes
  const pos = Float32Array.from(m.pos);
  for (let i = 0; i < pos.length; i += 3) {
    const x = m.pos[i], y = m.pos[i + 1], z = m.pos[i + 2];
    const s = Math.min(1, Math.max(0, (xl - x) * side / ((xl - xm) * side))); // 0 lateral … 1 medial
    const top = Math.min(1, Math.max(0, (ymax - y) / (ymax - ymin)));          // 0 top … 1 bottom
    // attachment: lateral AND upper part is carried onto the wall
    const a = smoothstep(0.55, 0.15, s) * smoothstep(0.65, 0.3, top);
    const w = wall(y, z);
    let dx = squeeze * Math.pow(s, 1.3) * (1 - a) * side;
    if (a > 0 && Number.isFinite(w)) {
      const gap = (w - x) * side - 0.02; // how far to the wall (signed outward)
      if (gap > 0 && gap < reach) dx += a * gap * side;
    }
    pos[i] = x + dx;
    pos[i + 1] = y + lift * Math.pow(top, 0.9) * (1 - a);
  }
  return { pos, idx: m.idx };
}
