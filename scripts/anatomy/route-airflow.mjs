// Dev tool: suggests airflow stream control points that stay clear of every mesh in
// BOTH states (septum straight / deviated).
//
//   ANATOMY_RAW=/tmp/raw.glb node scripts/anatomy/build-nose.mjs   # raw (uncompressed) GLB
//   node scripts/anatomy/route-airflow.mjs /tmp/raw.glb [right-upper,left-lower,...]
//
// It voxelises all surfaces of both states, takes a 3D distance transform, and runs a
// Dijkstra that prefers high clearance between anatomical waypoints; the resulting
// centreline is reduced to a handful of Catmull-Rom control points. Paste the result
// into the `airflow` array of lib/anatomy/procedures/septoplastia.ts (build-nose.mjs
// then asserts the clearance).
import { NodeIO } from "@gltf-transform/core";
import * as THREE from "three";
import { edt1d } from "./sdf.mjs";

const file = process.argv[2];
const H = 0.05, MIN_CLEAR = +(process.env.CLEAR ?? 0.16);
const box = { x: [-2.0, 2.0], y: [-3.4, 4.2], z: [-7.6, 3.2] };
const [nx, ny, nz] = [box.x, box.y, box.z].map(([a, b]) => Math.ceil((b - a) / H) + 1);
const idx3 = (i, j, k) => (k * ny + j) * nx + i;
const toVox = (x, y, z) => [Math.round((x - box.x[0]) / H), Math.round((y - box.y[0]) / H), Math.round((z - box.z[0]) / H)];
const fromVox = (i, j, k) => [box.x[0] + i * H, box.y[0] + j * H, box.z[0] + k * H];

const doc = await new NodeIO().read(file);
const meshes = [];
for (const n of doc.getRoot().listNodes()) {
  const m = n.getMesh(); if (!m) continue;
  const name = n.getName();
  if (/^(incisao|splints|suturas|pele)$/.test(name)) continue; // skin: translucent ghost, nostrils are pinched shut in the scan
  const prim = m.listPrimitives()[0];
  const pos = prim.getAttribute("POSITION").getArray(), idx = prim.getIndices().getArray();
  const dev = prim.listTargets().length ? prim.listTargets()[0].getAttribute("POSITION").getArray() : null;
  meshes.push({ name, base: pos, dev: dev ? Float32Array.from(pos, (v, i) => v + dev[i]) : pos, idx });
}

const surf = new Uint8Array(nx * ny * nz);
function raster(pos, idx) {
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const e = Math.max(Math.hypot(pos[a] - pos[b], pos[a + 1] - pos[b + 1], pos[a + 2] - pos[b + 2]), Math.hypot(pos[a] - pos[c], pos[a + 1] - pos[c + 1], pos[a + 2] - pos[c + 2]), Math.hypot(pos[b] - pos[c], pos[b + 1] - pos[c + 1], pos[b + 2] - pos[c + 2]));
    const n = Math.max(1, Math.ceil(e / (H * 0.4)));
    for (let u = 0; u <= n; u++) for (let v = 0; v <= n - u; v++) {
      const w = n - u - v, fu = u / n, fv = v / n, fw = w / n;
      const x = fu * pos[a] + fv * pos[b] + fw * pos[c], y = fu * pos[a + 1] + fv * pos[b + 1] + fw * pos[c + 1], z = fu * pos[a + 2] + fv * pos[b + 2] + fw * pos[c + 2];
      const [i, j, k] = toVox(x, y, z);
      if (i >= 0 && j >= 0 && k >= 0 && i < nx && j < ny && k < nz) surf[idx3(i, j, k)] = 1;
    }
  }
}
for (const m of meshes) { raster(m.base, m.idx); raster(m.dev, m.idx); }

// 3D Euclidean distance transform (separable, Felzenszwalb)
const g = new Float64Array(nx * ny * nz);
for (let q = 0; q < g.length; q++) g[q] = surf[q] ? 0 : 1e12;
const run = (len, get, set) => { const f = new Float64Array(len); for (let q = 0; q < len; q++) f[q] = get(q); const d = edt1d(f, len); for (let q = 0; q < len; q++) set(q, d[q]); };
for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) run(nx, (i) => g[idx3(i, j, k)], (i, v) => { g[idx3(i, j, k)] = v; });
for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) run(ny, (j) => g[idx3(i, j, k)], (j, v) => { g[idx3(i, j, k)] = v; });
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) run(nz, (k) => g[idx3(i, j, k)], (k, v) => { g[idx3(i, j, k)] = v; });
const clear = Float32Array.from(g, (v) => Math.sqrt(v) * H);
console.log("voxels", nx, ny, nz, "clearance field ready");

if (process.env.SAG) {
  const x = +process.env.SAG, y0 = +(process.env.Y0 ?? -3.4), y1 = +(process.env.Y1 ?? 2);
  for (let y = y1; y >= y0; y -= 0.1) {
    let line = y.toFixed(1).padStart(5) + " ";
    for (let z = -7.5; z <= 3.1; z += 0.07) {
      const [i, j, k] = toVox(x, y, z), c = clear[idx3(i, j, k)];
      line += surf[idx3(i, j, k)] ? "#" : c >= 0.16 ? "." : c >= 0.1 ? "-" : "+";
    }
    console.log(line);
  }
  process.exit(0);
}
if (process.env.SLICE) {
  const z = +process.env.SLICE, y0 = +(process.env.Y0 ?? -3.4), y1 = +(process.env.Y1 ?? 2);
  for (let y = y1; y >= y0; y -= 0.1) {
    let line = y.toFixed(1).padStart(5) + " ";
    for (let x = -2; x <= 2; x += 0.05) {
      const [i, j, k] = toVox(x, y, z), c = clear[idx3(i, j, k)];
      line += surf[idx3(i, j, k)] ? "#" : c >= 0.16 ? "." : c >= 0.1 ? "-" : "+";
    }
    console.log(line);
  }
  process.exit(0);
}
const clearAt = (x, y, z) => { const [i, j, k] = toVox(x, y, z); return i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz ? 0 : clear[idx3(i, j, k)]; };

/** A* through voxels with clearance ≥ MIN_CLEAR (and on the requested side), cost = length · (1 + (0.4 / clearance)²). */
function route(from, to, side) {
  const ok = (i, j, k) => clear[idx3(i, j, k)] >= MIN_CLEAR && (box.x[0] + i * H) * side >= 0.05;
  const snap = (p) => {
    const [i0, j0, k0] = toVox(...p);
    let best = null, bd = Infinity;
    for (let r = 0; r < 14; r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) for (let dk = -r; dk <= r; dk++) {
      const i = i0 + di, j = j0 + dj, k = k0 + dk;
      if (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz || !ok(i, j, k)) continue;
      const d = di * di + dj * dj + dk * dk;
      if (d < bd) { bd = d; best = [i, j, k]; }
    }
    return best;
  };
  const s = snap(from), t = snap(to);
  console.log('  route', from, '→', to, 'snapped', s && fromVox(...s).map((v) => +v.toFixed(2)), t && fromVox(...t).map((v) => +v.toFixed(2)));
  if (!s || !t) return null;
  const total = nx * ny * nz;
  const dist = new Float32Array(total).fill(Infinity), prev = new Int32Array(total).fill(-1);
  const hk = [], hv = []; // flat binary heap (keys, values)
  const push = (key, val) => { let c = hk.length; hk.push(key); hv.push(val); while (c > 0) { const p = (c - 1) >> 1; if (hk[p] <= key) break; hk[c] = hk[p]; hv[c] = hv[p]; c = p; } hk[c] = key; hv[c] = val; };
  const pop = () => { const val = hv[0], lk = hk.pop(), lv = hv.pop(); if (hk.length) { let c = 0; for (;;) { let l = 2 * c + 1; if (l >= hk.length) break; if (l + 1 < hk.length && hk[l + 1] < hk[l]) l++; if (hk[l] >= lk) break; hk[c] = hk[l]; hv[c] = hv[l]; c = l; } hk[c] = lk; hv[c] = lv; } return val; };
  const goal = idx3(...t);
  const heur = (i, j, k) => Math.hypot(i - t[0], j - t[1], k - t[2]) * H;
  dist[idx3(...s)] = 0;
  push(heur(...s), idx3(...s));
  const nbrs = [];
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) if (a || b || c) nbrs.push([a, b, c, Math.hypot(a, b, c)]);
  let expanded = 0;
  const closed = new Uint8Array(total);
  while (hk.length) {
    const q = pop();
    if (closed[q]) continue;
    closed[q] = 1;
    if (q === goal) break;
    if (++expanded % 500000 === 0) console.log('   expanded', expanded, 'heap', hk.length);
    const i = q % nx, j = ((q / nx) | 0) % ny, k = (q / (nx * ny)) | 0;
    const dq = dist[q];
    for (const [a, b, c, len] of nbrs) {
      const ii = i + a, jj = j + b, kk = k + c;
      if (ii < 0 || jj < 0 || kk < 0 || ii >= nx || jj >= ny || kk >= nz || !ok(ii, jj, kk)) continue;
      const q2 = idx3(ii, jj, kk);
      const nd = dq + len * H * (1 + (0.4 / clear[q2]) ** 2);
      if (nd < dist[q2]) { dist[q2] = nd; prev[q2] = q; push(nd + heur(ii, jj, kk), q2); }
    }
  }
  if (!Number.isFinite(dist[goal])) return null;
  const path = [];
  for (let q = goal; q >= 0; q = prev[q]) path.push(fromVox(q % nx, ((q / nx) | 0) % ny, (q / (nx * ny)) | 0));
  return path.reverse();
}

// Waypoints (patient's right = −x). Hints only: A* picks the clearest way between them.
// Both streams of a side share the nostril / vestibule entry, then diverge.
const mirror = (p) => [-p[0], p[1], p[2]];
const ENTRY = [[0.8, -2.6, 2.2], [0.7, -2.3, 1.4], [0.55, -1.65, 0.9], [0.6, -1.3, 0.45]];
const SPEC = {
  upper: [...ENTRY, [0.8, 0.0, -0.6], [0.95, 0.5, -1.3], [0.85, 0.6, -3.5], [0.4, -0.3, -6.9]],
  lower: [...ENTRY, [0.75, -1.2, -0.4], [0.65, -1.1, -1.4], [0.6, -1.15, -4.0], [0.4, -1.0, -6.9]],
};
const wanted = process.argv[3] ? process.argv[3].split(",") : ["right-upper", "right-lower", "left-upper", "left-lower"];
const smoothPath = (path, iters) => {
  let p = path.map((q) => [...q]);
  for (let it = 0; it < iters; it++) p = p.map((q, i) => (i === 0 || i === p.length - 1 ? q : q.map((v, k) => (p[i - 1][k] + 2 * v + p[i + 1][k]) / 4)));
  return p;
};
const evalSpline = (pick) => {
  const curve = new THREE.CatmullRomCurve3(pick.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  let mn = Infinity; const v = new THREE.Vector3();
  for (let s = 0; s <= 1; s += 0.002) { curve.getPointAt(s, v); mn = Math.min(mn, clearAt(v.x, v.y, v.z)); }
  return { curve, mn };
};
for (const key of wanted) {
  const [side, kind] = key.split("-");
  const sg = side === "right" ? -1 : 1;
  const pts = SPEC[kind].map((p) => (side === "right" ? mirror(p) : p));
  let full = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const seg = route(pts[s], pts[s + 1], sg);
    if (!seg) { console.log(key, "NO ROUTE between", pts[s], pts[s + 1]); full = null; break; }
    full = full.concat(s ? seg.slice(1) : seg);
  }
  if (!full) continue;
  const sm = smoothPath(full, 12);
  // fewest control points whose spline still keeps the clearance
  let best = null;
  for (const spacing of [1.8, 1.5, 1.25, 1.0, 0.8, 0.6]) {
    const pick = [sm[0]];
    let acc = 0;
    for (let q = 1; q < sm.length - 1; q++) { acc += Math.hypot(...sm[q].map((v, i) => v - sm[q - 1][i])); if (acc >= spacing) { pick.push(sm[q]); acc = 0; } }
    pick.push(sm[sm.length - 1]);
    const { curve, mn } = evalSpline(pick);
    best = { pick, curve, mn };
    if (mn >= MIN_CLEAR - 0.03) break;
  }
  // arc-length fraction where the stream passes the deviation (z from +0.8 to −2.4)
  let s0 = null, s1 = null; const v = new THREE.Vector3();
  for (let s = 0; s <= 1; s += 0.002) { best.curve.getPointAt(s, v); if (v.z <= 0.8 && s0 === null) s0 = s; if (v.z >= -2.4) s1 = s; }
  console.log(`${key}: ${best.pick.length} pts, spline min clearance ${best.mn.toFixed(3)}, narrowing ≈ [${s0?.toFixed(2)}, ${s1?.toFixed(2)}]`);
  console.log(JSON.stringify(best.pick.map((p) => p.map((x) => +x.toFixed(2)))));
}
