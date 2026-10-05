// Invariants + dimensions of public/models/cabeca.glb:  node scripts/anatomy/check-head.mjs
// every part closed/manifold/outward, no interpenetration of the sinuses with anything, septum/concha gaps, sinus table, size.
import fs from "node:fs";
import path from "node:path";
import * as L from "./head-lib.mjs";
import { bbox } from "./mesh.mjs";

const FILE = path.join(L.ROOT, "public/models/cabeca.glb");
const IDS = `pele osso_frontal osso_parietal osso_occipital osso_temporal_dir osso_temporal_esq osso_esfenoide osso_etmoide osso_nasal_dir osso_nasal_esq
maxila_dir maxila_esq osso_zigomatico_dir osso_zigomatico_esq osso_lacrimal_dir osso_lacrimal_esq osso_palatino_dir osso_palatino_esq mandibula dentes_superiores dentes_inferiores
vomer septo_lamina_perpendicular septo_cartilagem concha_inferior_dir concha_inferior_esq concha_media_dir concha_media_esq
cartilagem_lateral_dir cartilagem_lateral_esq cartilagem_alar_dir cartilagem_alar_esq seio_frontal_dir seio_frontal_esq seio_etmoidal_dir seio_etmoidal_esq seio_maxilar_dir seio_maxilar_esq
seio_esfenoidal_dir seio_esfenoidal_esq olho_dir olho_esq`.split(/\s+/);
export async function runChecks() {
  const wasm = await L.manifold();
  const parts = new Map(Object.entries(await L.readParts(FILE)));
  const fails = [];
  const size = fs.statSync(FILE).size;
  console.log(`size ${(size / 1024).toFixed(0)} KB, ${parts.size} parts, ${[...parts.values()].reduce((s, p) => s + p.idx.length / 3, 0)} tris`);
  if (size > 2.5 * 1024 * 1024) fails.push(`GLB ${(size / 1048576).toFixed(2)} MB > 2.5 MB`);
  for (const id of IDS) if (!parts.has(id)) fails.push(`missing part ${id}`);
  console.log("\npart                         tris   volume mL  closed/manifold  bbox (cm)");
  for (const [id, m] of parts) {
    const t = L.topo(m), v = L.volume(m), b = bbox(m);
    if (!t.ok) fails.push(`${id}: not closed/manifold ${JSON.stringify(t)}`);
    if (v <= 0) fails.push(`${id}: non-positive volume ${v}`);
    console.log(`${id.padEnd(28)} ${String(m.idx.length / 3).padStart(6)} ${v.toFixed(2).padStart(10)}  ${t.ok ? "ok" : "FAIL"}          [${b.min.map((x) => x.toFixed(1))}] [${b.max.map((x) => x.toFixed(1))}]`);
  }
  // sinus table
  console.log("\nsinus                     mL     AP(z) cm   H(y) cm   W(x) cm");
  for (const [id, m] of parts) if (id.startsWith("seio_")) {
    const b = bbox(m);
    console.log(`${id.padEnd(24)} ${L.volume(m).toFixed(1).padStart(6)}  ${(b.max[2] - b.min[2]).toFixed(1).padStart(8)}  ${(b.max[1] - b.min[1]).toFixed(1).padStart(8)}  ${(b.max[0] - b.min[0]).toFixed(1).padStart(8)}`);
  }
  for (const id of ["seio_maxilar_dir", "seio_maxilar_esq"]) { const v = L.volume(parts.get(id)); if (v < 10 || v > 25) fails.push(`${id} ${v.toFixed(1)} mL outside 10-25`); }
  for (const id of ["olho_dir", "olho_esq"]) { const b = bbox(parts.get(id)); const d = b.max[0] - b.min[0]; console.log(`${id} diameter ${d.toFixed(2)} cm`); if (d < 2.1 || d > 2.7) fails.push(`${id} diameter ${d}`); }
  // interpenetration (volume of the intersection, mL)
  const overlap = (a, b) => {
    const ba = bbox(parts.get(a)), bb = bbox(parts.get(b));
    if (ba.min.some((v, k) => v > bb.max[k] + 0.01) || bb.min.some((v, k) => v > ba.max[k] + 0.01)) return 0;
    try { return L.volume(L.boolean(wasm, "intersect", parts.get(a), [parts.get(b)])); } catch (e) { return NaN; }
  };
  const sin = [...parts.keys()].filter((k) => k.startsWith("seio_"));
  const others = [...parts.keys()].filter((k) => !k.startsWith("seio_") && k !== "pele");
  console.log("\nintersections (mL > 0.002):");
  let any = false;
  const pairs = [];
  for (const s of sin) { for (const o of others) pairs.push([s, o]); }
  for (let i = 0; i < sin.length; i++) for (let j = i + 1; j < sin.length; j++) pairs.push([sin[i], sin[j]]);
  const soft = [...parts.keys()].filter((k) => /^(septo|vomer|concha|cartilagem)/.test(k));
  for (let i = 0; i < soft.length; i++) for (let j = i + 1; j < soft.length; j++) if (!(soft[i].startsWith("concha_inferior") && soft[j].startsWith("concha_media")) ) pairs.push([soft[i], soft[j]]);
  for (const [a, b] of pairs) {
    const v = overlap(a, b);
    if (!(v > 0.002) && !Number.isNaN(v)) continue;
    any = true; console.log(`  ${a} x ${b}: ${v.toFixed(4)} mL`);
    const sinusInvolved = a.startsWith("seio_") || b.startsWith("seio_");
    const allowed = /^(cartilagem|dentes)/.test(a) || /^(cartilagem|dentes)/.test(b);
    if (sinusInvolved && !(allowed && v < 0.02) && !(v < 0.005)) fails.push(`${a} intersects ${b} by ${v.toFixed(3)} mL`);
    if (!sinusInvolved && /^(concha|septo)/.test(a) && /^(concha|septo|vomer)/.test(b) && v > 0.02) fails.push(`${a} intersects ${b} by ${v.toFixed(3)} mL`);
  }
  if (!any) console.log("  none");
  // minimum gaps by surface sampling
  function sample(m, step = 0.05) {
    const pts = []; const p = m.pos;
    for (let t = 0; t < m.idx.length; t += 3) {
      const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
      const e = Math.max(Math.hypot(p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]), Math.hypot(p[c] - p[a], p[c + 1] - p[a + 1], p[c + 2] - p[a + 2]));
      const n = Math.max(1, Math.ceil(e / step));
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) { const u = i / n, v = j / n, w = 1 - u - v; pts.push([0, 1, 2].map((k) => p[a + k] * w + p[b + k] * u + p[c + k] * v)); }
    }
    return pts;
  }
  function minDist(A, B) {
    const cell = 0.2, key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
    const grid = new Map();
    for (const q of B) { const k = key(...q); (grid.get(k) ?? grid.set(k, []).get(k)).push(q); }
    let best = Infinity;
    for (const a of A) {
      const [cx, cy, cz] = [Math.floor(a[0] / cell), Math.floor(a[1] / cell), Math.floor(a[2] / cell)];
      for (let r = 1; r <= 6; r++) {
        let found = false;
        for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) for (let dz = -r; dz <= r; dz++) {
          if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue;
          for (const q of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) { const d = Math.hypot(a[0] - q[0], a[1] - q[1], a[2] - q[2]); if (d < best) { best = d; found = true; } }
        }
        if (found && best < r * cell) break;
      }
    }
    return best;
  }
  // bone vertices inside a concha or sinus mesh (voxel signed distance, 0.1-0.15 mm grid): nothing may be deeper than 0.05 mm
  console.log("\nbone vertex depth inside concha/sinus meshes (mm, max):");
  const bones = [...parts.keys()].filter((k) => /^(osso_|maxila_|mandibula|dentes)/.test(k));
  for (const tid of [...parts.keys()].filter((k) => /^(concha_|seio_)/.test(k) && !k.startsWith("seio_etmoidal"))) {
    const tm = parts.get(tid), tb = bbox(tm), hh = tid.startsWith("concha") ? 0.01 : 0.015;
    const g = new L.Vox(tb.min.map((v) => v - 0.05), tb.max.map((v) => v + 0.05), hh);
    const f = L.sdf(g, L.voxelize(g, tm));
    let worst = 0, who = "";
    for (const bid of bones) {
      const bm = parts.get(bid), bb = bbox(bm);
      if (bb.min.some((v, k) => v > tb.max[k]) || bb.max.some((v, k) => v < tb.min[k])) continue;
      for (let i = 0; i < bm.pos.length; i += 3) {
        const x = bm.pos[i], y = bm.pos[i + 1], z = bm.pos[i + 2];
        if (x < g.min[0] || y < g.min[1] || z < g.min[2] || x > g.x(g.nx - 1) || y > g.y(g.ny - 1) || z > g.z(g.nz - 1)) continue;
        const d = -g.sample(f, x, y, z);
        if (d > worst) { worst = d; who = bid; }
      }
    }
    console.log(`  ${tid.padEnd(22)} ${(worst * 10).toFixed(3)} ${who}`);
    if (worst * 10 > 0.05 + 0.5 * hh * 10) fails.push(`bone ${who} vertex ${(worst * 10).toFixed(2)} mm inside ${tid} (> 0.05)`);
  }
  for (const sd of ["dir", "esq"]) {
    const d = minDist(sample(parts.get(`olho_${sd}`), 0.1), sample(parts.get(`seio_maxilar_${sd}`), 0.1)) * 10;
    console.log(`  globe ${sd} to maxillary sinus: ${d.toFixed(1)} mm`); if (d < 2) fails.push(`globe ${sd} only ${d.toFixed(1)} mm from the maxillary sinus`);
  }
  console.log("\ngaps (mm):");
  const sept = [...sample(parts.get("septo_lamina_perpendicular")), ...sample(parts.get("septo_cartilagem")), ...sample(parts.get("vomer"))];
  for (const sd of ["dir", "esq"]) {
    for (const c of ["inferior", "media"]) {
      const d = minDist(sample(parts.get(`concha_${c}_${sd}`)), sept) * 10;
      console.log(`  concha_${c}_${sd} to septum: ${d.toFixed(2)}`);
      if (d < 1.5) fails.push(`concha_${c}_${sd} is ${d.toFixed(2)} mm from the septum (< 1.5)`);
    }
    const d = minDist(sample(parts.get(`concha_inferior_${sd}`)), sample(parts.get(`concha_media_${sd}`))) * 10;
    console.log(`  concha_inferior_${sd} to concha_media_${sd} (middle meatus): ${d.toFixed(2)}`);
  }
  return { fails };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const { fails } = await runChecks();
  if (fails.length) { console.error(`\n${fails.length} check(s) FAILED:\n - ${fails.join("\n - ")}`); process.exit(1); }
  console.log("\nall checks pass");
}
