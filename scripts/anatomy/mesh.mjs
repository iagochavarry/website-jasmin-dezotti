// Small, dependency-free mesh toolkit used to turn BodyParts3D STL files into
// web-ready GLB models. Meshes are { pos: Float32Array, idx: Uint32Array }.
import fs from "node:fs";

/** Parse a binary STL and weld duplicated vertices. */
export function loadSTL(file, weldEps = 1e-4) {
  const b = fs.readFileSync(file);
  const n = b.readUInt32LE(80);
  const map = new Map();
  const pos = [];
  const idx = new Uint32Array(n * 3);
  const q = 1 / weldEps;
  for (let i = 0; i < n; i++) {
    const o = 84 + i * 50;
    for (let v = 0; v < 3; v++) {
      const x = b.readFloatLE(o + 12 + v * 12);
      const y = b.readFloatLE(o + 16 + v * 12);
      const z = b.readFloatLE(o + 20 + v * 12);
      const key = `${Math.round(x * q)},${Math.round(y * q)},${Math.round(z * q)}`;
      let id = map.get(key);
      if (id === undefined) {
        id = pos.length / 3;
        pos.push(x, y, z);
        map.set(key, id);
      }
      idx[i * 3 + v] = id;
    }
  }
  return dropDegenerate({ pos: Float32Array.from(pos), idx });
}

function dropDegenerate(m) {
  const out = [];
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t], b = m.idx[t + 1], c = m.idx[t + 2];
    if (a !== b && b !== c && a !== c) out.push(a, b, c);
  }
  return { pos: m.pos, idx: Uint32Array.from(out) };
}

/**
 * Per-vertex channels of a mesh: positions, optional normals and morph targets
 * (positions + optional normals). Used so that every operation that cuts or
 * re-indexes a mesh keeps all of them in sync.
 */
function channels(m) {
  const list = [{ get: () => m.pos, set: (a, o) => { o.pos = a; }, normal: false }];
  if (m.nrm) list.push({ get: () => m.nrm, set: (a, o) => { o.nrm = a; }, normal: true });
  (m.morphs ?? []).forEach((mt, i) => {
    list.push({ get: () => mt.pos, set: (a, o) => { (o.morphs ??= [])[i] = { ...(o.morphs[i] ?? { name: mt.name }), name: mt.name, pos: a }; }, normal: false });
    if (mt.nrm) list.push({ get: () => mt.nrm, set: (a, o) => { (o.morphs ??= [])[i] = { ...(o.morphs[i] ?? { name: mt.name }), name: mt.name, nrm: a }; }, normal: true });
  });
  return list;
}

/** Keep only the triangles for which `keep(triangleIndex)` is true, then compact. */
export function filterTriangles(m, keep) {
  const vmap = new Map();
  const order = [];
  const idx = [];
  for (let t = 0; t < m.idx.length / 3; t++) {
    if (!keep(t)) continue;
    for (let k = 0; k < 3; k++) {
      const v = m.idx[t * 3 + k];
      let nv = vmap.get(v);
      if (nv === undefined) { nv = order.length; order.push(v); vmap.set(v, nv); }
      idx.push(nv);
    }
  }
  const out = { idx: Uint32Array.from(idx) };
  for (const ch of channels(m)) {
    const src = ch.get(), a = new Float32Array(order.length * 3);
    for (let i = 0; i < order.length; i++) { a[i * 3] = src[order[i] * 3]; a[i * 3 + 1] = src[order[i] * 3 + 1]; a[i * 3 + 2] = src[order[i] * 3 + 2]; }
    ch.set(a, out);
  }
  return { pos: out.pos, idx: out.idx, ...(out.nrm ? { nrm: out.nrm } : {}), ...(out.morphs ? { morphs: out.morphs } : {}) };
}

/**
 * Split a mesh by the scalar field `f(x, y, z)`. Triangles crossing f = 0 are cut
 * with vertices interpolated along their edges (every channel: positions,
 * normals and morph targets), so the boundary is a clean line and both sides share
 * identical vertices. Returns { neg, pos } (f < 0 and f >= 0); either may be empty.
 */
export function splitByField(m, f) {
  const nv = m.pos.length / 3;
  const val = new Float64Array(nv);
  for (let v = 0; v < nv; v++) val[v] = f(m.pos[v * 3], m.pos[v * 3 + 1], m.pos[v * 3 + 2]);
  const chs = channels(m);
  const srcs = chs.map((c) => c.get());
  const cutCache = new Map(); // edge key → [array of channel values]
  const cutVals = (a, b) => {
    if (a > b) [a, b] = [b, a];
    const key = a * nv + b;
    let r = cutCache.get(key);
    if (!r) {
      const t = val[a] / (val[a] - val[b]);
      r = srcs.map((s, c) => {
        const o = [0, 0, 0];
        for (let k = 0; k < 3; k++) o[k] = s[a * 3 + k] + t * (s[b * 3 + k] - s[a * 3 + k]);
        if (chs[c].normal) { const l = Math.hypot(...o) || 1; o[0] /= l; o[1] /= l; o[2] /= l; }
        return o;
      });
      cutCache.set(key, r);
    }
    return r;
  };
  const makeSide = () => ({ vmap: new Map(), cmap: new Map(), data: srcs.map(() => []), idx: [] });
  const sides = { neg: makeSide(), pos: makeSide() };
  const vert = (S, ref) => {
    // ref: original vertex index (number) or [a, b] cut edge
    if (typeof ref === "number") {
      let id = S.vmap.get(ref);
      if (id === undefined) {
        id = S.data[0].length / 3;
        S.vmap.set(ref, id);
        srcs.forEach((s, c) => S.data[c].push(s[ref * 3], s[ref * 3 + 1], s[ref * 3 + 2]));
      }
      return id;
    }
    const [a, b] = ref[0] < ref[1] ? ref : [ref[1], ref[0]];
    const key = a * nv + b;
    let id = S.cmap.get(key);
    if (id === undefined) {
      id = S.data[0].length / 3;
      S.cmap.set(key, id);
      cutVals(a, b).forEach((o, c) => S.data[c].push(o[0], o[1], o[2]));
    }
    return id;
  };
  const emit = (S, poly) => {
    const ids = poly.map((r) => vert(S, r));
    if (ids.length === 3) S.idx.push(ids[0], ids[1], ids[2]);
    else {
      // quad: split along the shorter diagonal
      const P = S.data[0], d = (i, j) => Math.hypot(P[ids[i] * 3] - P[ids[j] * 3], P[ids[i] * 3 + 1] - P[ids[j] * 3 + 1], P[ids[i] * 3 + 2] - P[ids[j] * 3 + 2]);
      if (d(0, 2) <= d(1, 3)) S.idx.push(ids[0], ids[1], ids[2], ids[0], ids[2], ids[3]);
      else S.idx.push(ids[0], ids[1], ids[3], ids[1], ids[2], ids[3]);
    }
  };
  for (let t = 0; t < m.idx.length; t += 3) {
    const tri = [m.idx[t], m.idx[t + 1], m.idx[t + 2]];
    const neg = tri.map((v) => val[v] < 0);
    const n = neg.filter(Boolean).length;
    if (n === 3) { emit(sides.neg, tri); continue; }
    if (n === 0) { emit(sides.pos, tri); continue; }
    // walk the polygon, producing the polygon of each side
    const polyN = [], polyP = [];
    for (let k = 0; k < 3; k++) {
      const a = tri[k], b = tri[(k + 1) % 3];
      (neg[k] ? polyN : polyP).push(a);
      if (neg[k] !== neg[(k + 1) % 3]) { polyN.push([a, b]); polyP.push([a, b]); }
    }
    emit(sides.neg, polyN); emit(sides.pos, polyP);
  }
  const build = (S) => {
    const out = { idx: Uint32Array.from(S.idx) };
    chs.forEach((c, i) => c.set(Float32Array.from(S.data[i]), out));
    return { pos: out.pos, idx: out.idx, ...(out.nrm ? { nrm: out.nrm } : {}), ...(out.morphs ? { morphs: out.morphs } : {}) };
  };
  return { neg: build(sides.neg), pos: build(sides.pos) };
}

/** Keep the part of the mesh on the negative side of f (clean cut at f = 0). */
export const cropField = (m, f) => splitByField(m, f).neg;

/**
 * Clean crop by planes: each plane is { n: [nx, ny, nz], d } and keeps n·p < d.
 * Applied one after the other so every cut is a straight line.
 */
export function cropPlanes(m, planes) {
  let cur = m;
  for (const { n, d } of planes) {
    const l = Math.hypot(...n);
    cur = cropField(cur, (x, y, z) => (n[0] * x + n[1] * y + n[2] * z) / l - d / l);
  }
  return cur;
}
/** Axis-aligned box crop (min/max per axis; omit a bound with ±Infinity) using planes. */
export function cropBox(m, min, max) {
  const planes = [];
  for (let a = 0; a < 3; a++) {
    const n = [0, 0, 0];
    if (Number.isFinite(max[a])) { n[a] = 1; planes.push({ n: [...n], d: max[a] }); }
    if (Number.isFinite(min[a])) { n[a] = -1; planes.push({ n: [...n], d: -min[a] }); }
  }
  return cropPlanes(m, planes);
}

/** Drop connected components with fewer than `minTris` triangles (shards / islands). */
export function dropIslands(m, minTris = 200) {
  const parts = components(m);
  const keep = parts.filter((c) => c.idx.length / 3 >= minTris);
  return keep.length === 1 ? keep[0] : merge(keep);
}

/** Keep triangles whose centroid satisfies `inside(x, y, z)`. */
export function crop(m, inside) {
  return filterTriangles(m, (t) => {
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < 3; k++) {
      const v = m.idx[t * 3 + k];
      x += m.pos[v * 3]; y += m.pos[v * 3 + 1]; z += m.pos[v * 3 + 2];
    }
    return inside(x / 3, y / 3, z / 3);
  });
}

/** Split a mesh into its connected components, largest first. */
export function components(m) {
  const nv = m.pos.length / 3;
  const parent = new Int32Array(nv).map((_, i) => i);
  const find = (a) => {
    while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; }
    return a;
  };
  for (let i = 0; i < m.idx.length; i += 3) {
    const a = find(m.idx[i]), b = find(m.idx[i + 1]), c = find(m.idx[i + 2]);
    parent[a] = c; parent[b] = c;
  }
  const byRoot = new Map();
  for (let t = 0; t < m.idx.length / 3; t++) {
    const r = find(m.idx[t * 3]);
    if (!byRoot.has(r)) byRoot.set(r, new Set());
    byRoot.get(r).add(t);
  }
  return [...byRoot.values()]
    .sort((a, b) => b.size - a.size)
    .map((set) => filterTriangles(m, (t) => set.has(t)));
}

export function merge(meshes) {
  const cat = (get) => {
    const arrs = meshes.map(get);
    if (arrs.some((a) => !a)) return null;
    const out = new Float32Array(arrs.reduce((s, a) => s + a.length, 0));
    let o = 0;
    for (const a of arrs) { out.set(a, o); o += a.length; }
    return out;
  };
  const ni = meshes.reduce((s, m) => s + m.idx.length, 0);
  const idx = new Uint32Array(ni);
  let pv = 0, pi = 0;
  for (const m of meshes) {
    for (let i = 0; i < m.idx.length; i++) idx[pi + i] = m.idx[i] + pv / 3;
    pv += m.pos.length;
    pi += m.idx.length;
  }
  const out = { pos: cat((m) => m.pos), idx };
  const nrm = cat((m) => m.nrm);
  if (nrm) out.nrm = nrm;
  const names = meshes[0].morphs?.map((mt) => mt.name) ?? [];
  if (names.length && meshes.every((m) => names.every((n) => m.morphs?.some((mt) => mt.name === n)))) {
    out.morphs = names.map((name) => {
      const get = (m) => m.morphs.find((mt) => mt.name === name);
      const mp = cat((m) => get(m).pos), mn = cat((m) => get(m).nrm);
      return { name, pos: mp, ...(mn ? { nrm: mn } : {}) };
    });
  }
  return out;
}

/** Weld vertices that share position (and normal): reconnects pieces merged without welding. */
export function weld(m) {
  const map = new Map(), remap = new Uint32Array(m.pos.length / 3), order = [];
  for (let v = 0; v < remap.length; v++) {
    const k = `${m.pos[v * 3]},${m.pos[v * 3 + 1]},${m.pos[v * 3 + 2]}` + (m.nrm ? `|${m.nrm[v * 3]},${m.nrm[v * 3 + 1]},${m.nrm[v * 3 + 2]}` : "");
    let id = map.get(k);
    if (id === undefined) { id = order.length; map.set(k, id); order.push(v); }
    remap[v] = id;
  }
  const idx = Uint32Array.from(m.idx, (v) => remap[v]);
  const out = { idx };
  for (const ch of channels(m)) {
    const src = ch.get(), a = new Float32Array(order.length * 3);
    order.forEach((v, i) => { a[i * 3] = src[v * 3]; a[i * 3 + 1] = src[v * 3 + 1]; a[i * 3 + 2] = src[v * 3 + 2]; });
    ch.set(a, out);
  }
  // drop triangles collapsed by welding
  const keep = [];
  for (let t = 0; t < idx.length; t += 3) if (idx[t] !== idx[t + 1] && idx[t + 1] !== idx[t + 2] && idx[t] !== idx[t + 2]) keep.push(idx[t], idx[t + 1], idx[t + 2]);
  return { pos: out.pos, idx: Uint32Array.from(keep), ...(out.nrm ? { nrm: out.nrm } : {}), ...(out.morphs ? { morphs: out.morphs } : {}) };
}

export function bbox(m) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < m.pos.length; i++) {
    const k = i % 3;
    if (m.pos[i] < mn[k]) mn[k] = m.pos[i];
    if (m.pos[i] > mx[k]) mx[k] = m.pos[i];
  }
  return { min: mn, max: mx };
}

function neighbours(m) {
  const nv = m.pos.length / 3;
  const sets = Array.from({ length: nv }, () => new Set());
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t], b = m.idx[t + 1], c = m.idx[t + 2];
    sets[a].add(b); sets[a].add(c);
    sets[b].add(a); sets[b].add(c);
    sets[c].add(a); sets[c].add(b);
  }
  return sets.map((s) => Uint32Array.from(s));
}

/**
 * Smooth the OPEN BORDER of a mesh (scan edges are ragged at the 0.5 mm scale) with
 * Taubin λ|μ steps along the border polyline only; straight cuts stay straight.
 * Interior vertices follow a few rings out so triangles are not distorted.
 */
export function smoothBoundary(m, iterations = 12, rings = 3) {
  const nv = m.pos.length / 3;
  const edgeCount = new Map();
  const key = (a, b) => (a < b ? a * nv + b : b * nv + a);
  for (let t = 0; t < m.idx.length; t += 3) for (let k = 0; k < 3; k++) {
    const e = key(m.idx[t + k], m.idx[t + (k + 1) % 3]);
    edgeCount.set(e, (edgeCount.get(e) ?? 0) + 1);
  }
  const bnb = Array.from({ length: nv }, () => []);
  const isB = new Uint8Array(nv);
  for (const [e, c] of edgeCount) if (c === 1) {
    const a = Math.floor(e / nv), b = e % nv;
    bnb[a].push(b); bnb[b].push(a); isB[a] = isB[b] = 1;
  }
  const border = [];
  for (let v = 0; v < nv; v++) if (isB[v] && bnb[v].length === 2) border.push(v);
  if (!border.length) return m;
  let p = Float32Array.from(m.pos);
  const orig = Float32Array.from(m.pos);
  const step = (f) => {
    const q = Float32Array.from(p);
    for (const v of border) {
      const [a, b] = bnb[v];
      for (let k = 0; k < 3; k++) q[v * 3 + k] = p[v * 3 + k] + f * ((p[a * 3 + k] + p[b * 3 + k]) / 2 - p[v * 3 + k]);
    }
    p = q;
  };
  for (let i = 0; i < iterations; i++) { step(0.5); step(-0.53); }
  // propagate the border displacement into the interior, fading over `rings` rings
  const nb = neighbours(m);
  const disp = new Float32Array(nv * 3), w = new Float32Array(nv);
  for (const v of border) { for (let k = 0; k < 3; k++) disp[v * 3 + k] = p[v * 3 + k] - orig[v * 3 + k]; w[v] = 1; }
  let frontier = border;
  const seen = new Uint8Array(nv); for (const v of border) seen[v] = 1;
  for (let r = 1; r <= rings; r++) {
    const next = [];
    for (const v of frontier) for (const u of nb[v]) if (!seen[u]) { seen[u] = 1; next.push(u); }
    for (const u of next) {
      let s0 = 0, n = 0, d = [0, 0, 0];
      for (const x of nb[u]) if (w[x] > 0 && seen[x]) { n++; d[0] += disp[x * 3]; d[1] += disp[x * 3 + 1]; d[2] += disp[x * 3 + 2]; }
      if (n) { const f = 1 - r / (rings + 1); for (let k = 0; k < 3; k++) disp[u * 3 + k] = (d[k] / n) * f; w[u] = f; }
    }
    frontier = next;
  }
  const pos = Float32Array.from(m.pos);
  for (let v = 0; v < nv; v++) if (w[v] > 0) for (let k = 0; k < 3; k++) pos[v * 3 + k] += disp[v * 3 + k];
  return { ...m, pos };
}

/** Taubin λ|μ smoothing: removes faceting without shrinking the part. */
export function taubin(m, iterations = 10, lambda = 0.5, mu = -0.53) {
  const nb = neighbours(m);
  let p = Float32Array.from(m.pos);
  const step = (factor) => {
    const q = new Float32Array(p.length);
    for (let v = 0; v < nb.length; v++) {
      const n = nb[v];
      if (n.length === 0) { q.set(p.subarray(v * 3, v * 3 + 3), v * 3); continue; }
      let x = 0, y = 0, z = 0;
      for (const u of n) { x += p[u * 3]; y += p[u * 3 + 1]; z += p[u * 3 + 2]; }
      x /= n.length; y /= n.length; z /= n.length;
      q[v * 3] = p[v * 3] + factor * (x - p[v * 3]);
      q[v * 3 + 1] = p[v * 3 + 1] + factor * (y - p[v * 3 + 1]);
      q[v * 3 + 2] = p[v * 3 + 2] + factor * (z - p[v * 3 + 2]);
    }
    p = q;
  };
  for (let i = 0; i < iterations; i++) { step(lambda); step(mu); }
  return { pos: p, idx: m.idx };
}

/** Loop-style subdivision (midpoint split + Taubin relaxation keeps it simple). */
export function subdivide(m) {
  const edge = new Map();
  const pos = Array.from(m.pos);
  const mid = (a, b) => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    let id = edge.get(key);
    if (id === undefined) {
      id = pos.length / 3;
      pos.push((pos[a * 3] + pos[b * 3]) / 2, (pos[a * 3 + 1] + pos[b * 3 + 1]) / 2, (pos[a * 3 + 2] + pos[b * 3 + 2]) / 2);
      edge.set(key, id);
    }
    return id;
  };
  const idx = [];
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t], b = m.idx[t + 1], c = m.idx[t + 2];
    const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
    idx.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
  }
  return { pos: Float32Array.from(pos), idx: Uint32Array.from(idx) };
}

/** Area-weighted vertex normals. */
export function normals(m) {
  const n = new Float32Array(m.pos.length);
  const p = m.pos;
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [a, b, c]) { n[i] += nx; n[i + 1] += ny; n[i + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

/** Apply `fn(x, y, z) => [x, y, z]` to every vertex. */
export function mapVertices(m, fn) {
  const pos = new Float32Array(m.pos.length);
  for (let i = 0; i < m.pos.length; i += 3) {
    const [x, y, z] = fn(m.pos[i], m.pos[i + 1], m.pos[i + 2]);
    pos[i] = x; pos[i + 1] = y; pos[i + 2] = z;
  }
  return { pos, idx: m.idx };
}

/** Flip triangle winding (needed after a mirroring transform). */
export function flip(m) {
  const idx = Uint32Array.from(m.idx);
  for (let t = 0; t < idx.length; t += 3) { const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s; }
  return { pos: m.pos, idx };
}

/**
 * Write a minimal glTF 2.0 binary with one node per part.
 * parts: [{ name, pos, idx, extras? }]
 */
export function writeGLB(file, parts) {
  const chunks = [];
  let offset = 0;
  const bufferViews = [], accessors = [], meshes = [], nodes = [];
  const push = (typed, target) => {
    const buf = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
    const pad = (4 - (buf.length % 4)) % 4;
    chunks.push(buf, Buffer.alloc(pad));
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, target });
    offset += buf.length + pad;
    return bufferViews.length - 1;
  };
  for (const part of parts) {
    const nrm = part.nrm ?? normals(part);
    const { min, max } = bbox(part);
    const count = part.pos.length / 3;
    const pv = push(part.pos, 34962);
    accessors.push({ bufferView: pv, componentType: 5126, count, type: "VEC3", min, max });
    const posAcc = accessors.length - 1;
    const nvw = push(nrm, 34962);
    accessors.push({ bufferView: nvw, componentType: 5126, count, type: "VEC3" });
    const nrmAcc = accessors.length - 1;
    const small = count < 65536;
    const iv = push(small ? Uint16Array.from(part.idx) : part.idx, 34963);
    accessors.push({ bufferView: iv, componentType: small ? 5123 : 5125, count: part.idx.length, type: "SCALAR" });
    const idxAcc = accessors.length - 1;
    // Morph targets are stored as deltas from the base shape (glTF spec).
    const targets = (part.morphs ?? []).map((mt) => {
      const mn = mt.nrm ?? normals({ pos: mt.pos, idx: part.idx });
      const dp = new Float32Array(mt.pos.length), dn = new Float32Array(mt.pos.length);
      for (let i = 0; i < dp.length; i++) { dp[i] = mt.pos[i] - part.pos[i]; dn[i] = mn[i] - nrm[i]; }
      const b = bbox({ pos: dp });
      accessors.push({ bufferView: push(dp, 34962), componentType: 5126, count, type: "VEC3", min: b.min, max: b.max });
      const pa = accessors.length - 1;
      accessors.push({ bufferView: push(dn, 34962), componentType: 5126, count, type: "VEC3" });
      return { POSITION: pa, NORMAL: accessors.length - 1 };
    });
    const prim = { attributes: { POSITION: posAcc, NORMAL: nrmAcc }, indices: idxAcc };
    const mesh = { name: part.name, primitives: [prim] };
    if (targets.length) {
      prim.targets = targets;
      mesh.weights = targets.map(() => 0);
      mesh.extras = { targetNames: part.morphs.map((mt) => mt.name) };
    }
    meshes.push(mesh);
    nodes.push({ name: part.name, mesh: meshes.length - 1, ...(part.extras ? { extras: part.extras } : {}) });
  }
  const bin = Buffer.concat(chunks);
  const gltf = {
    asset: { version: "2.0", generator: "jasmin-anatomy-builder", copyright: "BodyParts3D, © 2008 Life Science Integrated Database Center (DBCLS), CC BY-SA 2.1 JP" },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes, meshes, accessors, bufferViews,
    buffers: [{ byteLength: bin.length }],
  };
  let json = Buffer.from(JSON.stringify(gltf));
  json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
  fs.writeFileSync(file, Buffer.concat([header, jh, json, bh, bin]));
  return 12 + 16 + json.length + bin.length;
}
