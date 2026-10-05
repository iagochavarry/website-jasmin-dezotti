// Builds public/models/cabeca.glb from a REAL CT scan (NasalSeg, CC BY 4.0,
// Zhang et al., Sci Data 2024, doi 10.5281/zenodo.12177181) with BodyParts3D (CC BY-SA 2.1 JP) used only to
// partition the bone into named parts and to place the nasal cartilages / teeth.
//
//   uv run scripts/anatomy/ct/run-all.sh   (steps below; heavy, ~10 min, CT files live in the gitignored .cache/ct)
//   node scripts/anatomy/build-head.mjs         (this file: meshes -> decimate -> GLB; per-part bboxes + ostia -> .cache/ct/cabeca.json)
//   node scripts/anatomy/check-head.mjs         (closed / manifold / dimensions; `pnpm build:anatomy` runs both)
//
// Pipeline (scripts/anatomy/ct/*.py, python via `uv run`, subject P099 of NasalSeg):
//   01_orient    midsagittal plane from the bone's left-right symmetry (yaw, roll, shift), 02_resample: pitch from the nasal
//                floor, origin (x=0 midline, y=-1.75 cm nasal floor at the head of the inferior turbinate, anterior nasal
//                spine z=+0.4 cm), 0.5 mm isotropic grid in the scene frame (+x patient left, +y up, +z anterior)
//   03_register  BodyParts3D bones -> CT bone surface (trimmed similarity ICP, then per bone rigid ICP)
//   04_air       head mask, inside-head air, NasalSeg territories (maxillary, nasal cavity, nasopharynx)
//   05_sinus     frontal / ethmoid / sphenoid = watershed cells of the remaining connected air, split left/right
//   06_bone      bone threshold + 1 mm walls around every sinus, partition by the nearest registered BodyParts3D bone
//   07_teeth     BodyParts3D tooth rows fitted to the dense crowns
//   08_soft      septum (tissue between the two airways), conchae (tissue enclosed by the airway), by height
//   09_mesh      gaussian-smoothed indicators -> marching cubes -> Taubin (complementary parts share the same sigma, so
//                their surfaces cannot interpenetrate)
//   10_skin      heavily smoothed skin ghost (sigma 3.5 mm: de-identified), globes (sphere fit)
//   11_cart      nasal cartilages (BodyParts3D): similarity fit to the CT nose (inside the skin, upper edge under the nasal bones, alar
//                crura on the septum's anterior edge, domes ~3.5 mm behind the skin tip), subdivide + Taubin
// Round 2 (cleanup): bone is a closed envelope (CT bone + 1.5 mm walls around sinuses and airway, closed r = 2 mm, enclosed voids
// filled, true air and the globes cut out); every part keeps only its real components. LEGIBILITY CARVING (not CT truth): (a) a
// ~3 mm slot where inferior and middle concha touch, (b) conchae are kept >= 2.5 mm from the septum, (c) a 1 mm bone gap around
// every sinus mesh (kills z-fighting), (d) the maxillary ostium is the min-cost path through the medial wall (partial volume),
// (e) the frontal sinus floor tapers into a >= 1.6 mm channel below y = 28 mm. The superior concha is not exported (no clean
// shell on this CT); the UI should hide that row.
import fs from "node:fs";
import path from "node:path";
import { bbox, writeGLB } from "./mesh.mjs";
import * as L from "./head-lib.mjs";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { quantize, meshopt, prune } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

await MeshoptEncoder.ready;
const SUBJECT = process.env.CT_SUBJECT ?? "P099";
const DIR = path.join(L.ROOT, ".cache/ct/meshes");
const OUT = path.join(L.ROOT, "public/models/cabeca.glb");
const META = path.join(L.ROOT, ".cache/ct/cabeca.json");
const wasm = await L.manifold();

// triangle budget, tolerance (cm)
const BUDGET = {
  pele: [26000, 0.04],
  osso_frontal: [14000, 0.03], osso_parietal: [4500, 0.06], osso_occipital: [4000, 0.06],
  osso_temporal_dir: [3000, 0.05], osso_temporal_esq: [3000, 0.05], osso_esfenoide: [9000, 0.03], osso_etmoide: [10000, 0.02],
  maxila_dir: [11000, 0.025], maxila_esq: [11000, 0.025], osso_zigomatico_dir: [3000, 0.03], osso_zigomatico_esq: [3000, 0.03],
  osso_palatino_dir: [2000, 0.02], osso_palatino_esq: [2000, 0.02], mandibula: [7000, 0.04],
  osso_nasal_dir: [1000, 0.015], osso_nasal_esq: [1000, 0.015], osso_lacrimal_dir: [1500, 0.015], osso_lacrimal_esq: [1500, 0.015],
  dentes_superiores: [9000, 0.02], dentes_inferiores: [7000, 0.02],
  septo_cartilagem: [2500, 0.02], septo_lamina_perpendicular: [3000, 0.02], vomer: [3000, 0.02],
  concha_inferior_dir: [4000, 0.015], concha_inferior_esq: [3500, 0.015], concha_media_dir: [2500, 0.015], concha_media_esq: [2200, 0.015],
  cartilagem_lateral_dir: [1500, 0.015], cartilagem_lateral_esq: [1500, 0.015], cartilagem_alar_dir: [1500, 0.015], cartilagem_alar_esq: [1500, 0.015],
  seio_maxilar_dir: [3500, 0.015], seio_maxilar_esq: [3500, 0.015], seio_frontal_dir: [2200, 0.015], seio_frontal_esq: [2200, 0.015],
  seio_etmoidal_dir: [6000, 0.012], seio_etmoidal_esq: [5000, 0.012], seio_esfenoidal_dir: [3000, 0.015], seio_esfenoidal_esq: [3000, 0.015],
  olho_dir: [1500, 0.01], olho_esq: [1500, 0.01],
};
const readBin = (f) => {
  const b = fs.readFileSync(f);
  const nv = b.readUInt32LE(0), nf = b.readUInt32LE(4);
  const pos = new Float32Array(b.buffer.slice(b.byteOffset + 8, b.byteOffset + 8 + nv * 12));
  const idx = new Uint32Array(b.buffer.slice(b.byteOffset + 8 + nv * 12, b.byteOffset + 8 + nv * 12 + nf * 12));
  return { pos, idx };
};
const parts = new Map();
const missing = [];
for (const [id, [tris, tol]] of Object.entries(BUDGET)) {
  const f = path.join(DIR, `${SUBJECT}_${id}.bin`);
  if (!fs.existsSync(f)) { missing.push(id); continue; }
  let m = readBin(f);
  const t0 = m.idx.length / 3;
  if (!L.topo(m).ok) m = L.repairManifold(m);
  const t = L.topo(m);
  if (!t.ok) console.log(`  WARN ${id}: not manifold`, JSON.stringify(t));
  m = t.ok ? L.decimate(m, tris, tol, wasm) : m;
  parts.set(id, m);
  console.log(`${id.padEnd(28)} ${String(t0).padStart(7)} -> ${String(m.idx.length / 3).padStart(6)} tris  ${L.volume(m).toFixed(2)} mL`);
}
if (missing.length) console.log("MISSING parts:", missing.join(", "));

// the BodyParts3D tooth rows reach into the sinus floor: carve them with the maxillary sinuses (+ a hair)
for (const id of ["dentes_superiores"]) {
  const cut = ["cut_maxilar_dir", "cut_maxilar_esq"].map((k) => readBin(path.join(DIR, `${SUBJECT}_${k}.bin`)));
  try { parts.set(id, L.dropShards(L.boolean(wasm, "subtract", parts.get(id), cut), 0.01)); }
  catch (e) { console.log("  WARN teeth carve failed:", e.message); }
}

// bone never pokes through a turbinate or crosses a sinus: subtract the (0.5 mm grown) cutters written by 09_mesh.py from every bone part
{
  const uniq = fs.readdirSync(DIR).filter((f) => f.startsWith(`${SUBJECT}_cut_`) && !f.includes("cut_maxilar_") && f.endsWith(".bin")).map((f) => ({ f, m: readBin(path.join(DIR, f)) }));
  for (const [id, m] of [...parts]) {
    if (!/^(osso_|maxila_)/.test(id)) continue;
    const b = bbox(m);
    const hit = uniq.filter(({ m: c }) => { const q = bbox(c); return q.min.every((v, k) => v < b.max[k]) && q.max.every((v, k) => v > b.min[k]); }).map((c) => c.m);
    if (!hit.length) continue;
    try { const r = L.dropShards(L.boolean(wasm, "subtract", m, hit), 0.01); parts.set(id, r); console.log(`  carve ${id}: -${hit.length} cutters, ${(L.volume(m) - L.volume(r)).toFixed(3)} mL`); }
    catch (e) { console.log("  WARN carve", id, e.message); }
  }
}
const list = [...parts].map(([name, m]) => ({ name, ...m }));
const meta = {};
for (const p of list) { const b = bbox(p); meta[p.name] = { min: b.min, max: b.max, center: b.min.map((v, k) => (v + b.max[k]) / 2), tris: p.idx.length / 3 }; }
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const rawSize = writeGLB(OUT, list.map((p) => ({ ...p })));
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(OUT);
doc.getRoot().getAsset().extras = { parts: meta, units: "cm", axes: "+x patient left, +y up, +z anterior", source: `NasalSeg ${SUBJECT} (CC BY 4.0) + BodyParts3D (CC BY-SA 2.1 JP)` };
await doc.transform(prune(), quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: "high" }));
await io.write(OUT, doc);
try {
  const ost = JSON.parse(fs.readFileSync(path.join(L.ROOT, `.cache/ct/ostium_${SUBJECT}.json`), "utf8")), fr = JSON.parse(fs.readFileSync(path.join(L.ROOT, `.cache/ct/frame_${SUBJECT}.json`), "utf8"));
  const o = {}; for (const [k, v] of Object.entries(ost)) o[k] = { mouth: [(v.mouth[0] + fr.x_shift_mm) / 10, v.mouth[1] / 10, v.mouth[2] / 10], start: [(v.start[0] + fr.x_shift_mm) / 10, v.start[1] / 10, v.start[2] / 10] };
  meta._ostium = o; console.log("ostium mouths (cm)", JSON.stringify(o));
} catch (e) { console.log("no ostium info", e.message); }
fs.writeFileSync(META, JSON.stringify(meta, null, 1));
console.log(`${path.relative(L.ROOT, OUT)}: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB (raw ${(rawSize / 1024).toFixed(0)} KB), ${parts.size} parts, ${list.reduce((s, p) => s + p.idx.length / 3, 0)} tris`);
