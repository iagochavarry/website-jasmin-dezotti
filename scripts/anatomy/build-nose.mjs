// Builds public/models/nariz.glb from BodyParts3D (CC BY-SA 2.1 JP).
//
//   node scripts/anatomy/build-nose.mjs
//
// Source STLs are downloaded once into .cache/bodyparts3d (gitignored).
// Output axes (Three.js): +x = patient's left, +y = up, +z = anterior. Units: cm.
import fs from "node:fs";
import path from "node:path";
import { loadSTL, crop, components, taubin, subdivide, mapVertices, merge, bbox, writeGLB, splitByField, cropBox, cropPlanes, dropIslands, smoothBoundary } from "./mesh.mjs";
import { buildSeptum } from "./septum.mjs";
import { buildFloor, floorSlab } from "./floor.mjs";
import { cropField } from "./mesh.mjs";
import { solidify } from "./solid.mjs";
import { runChecks } from "./check.mjs";
import { buildSlice, meshSlice } from "./slice.mjs";
import { wallProfile, reshapeConcha } from "./concha.mjs";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { quantize, meshopt, prune } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

/**
 * Reduce a part to `ratio` of its triangles (meshoptimizer). Vertices are only
 * dropped, never moved, so morph targets are remapped alongside.
 */
function simplify(m, ratio, error = 0.01) {
  const [idx] = MeshoptSimplifier.simplify(m.idx, m.pos, 3, Math.floor((m.idx.length * ratio) / 3) * 3, error, ["LockBorder"]);
  const remap = new Int32Array(m.pos.length / 3).fill(-1);
  const order = [];
  const out = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) {
    const v = idx[i];
    if (remap[v] < 0) { remap[v] = order.length; order.push(v); }
    out[i] = remap[v];
  }
  const pick = (arr) => { const a = new Float32Array(order.length * 3); order.forEach((v, i) => a.set(arr.subarray(v * 3, v * 3 + 3), i * 3)); return a; };
  return {
    ...m, pos: pick(m.pos), idx: out,
    ...(m.nrm ? { nrm: pick(m.nrm) } : {}),
    morphs: m.morphs?.map((mt) => ({ name: mt.name, pos: pick(mt.pos), ...(mt.nrm ? { nrm: pick(mt.nrm) } : {}) })),
  };
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const CACHE = path.join(ROOT, ".cache/bodyparts3d");
const OUT = path.join(ROOT, "public/models/nariz.glb");
const MIRROR = "https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl";

// BodyParts3D: x = patient's left(+)/right(-), y = posterior(+), z = up. mm.
const ORIGIN = { y: -185, z: 1505 };
const toScene = (x, y, z) => [x * 0.1, (z - ORIGIN.z) * 0.1, -(y - ORIGIN.y) * 0.1];

async function stl(fma) {
  const file = path.join(CACHE, `FMA${fma}.stl`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(CACHE, { recursive: true });
    const res = await fetch(`${MIRROR}/FMA${fma}.stl`);
    if (!res.ok) throw new Error(`download FMA${fma}: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return mapVertices(loadSTL(file), toScene);
}

const parts = [];
const add = (name, mesh, extras) => {
  parts.push({ name, ...mesh, ...(extras ? { extras } : {}) });
  const { min, max } = bbox(mesh);
  const morphs = mesh.morphs?.length ? ` morphs: ${mesh.morphs.map((m) => m.name).join(",")}` : "";
  console.log(name.padEnd(28), String(mesh.idx.length / 3).padStart(7), "tris", min.map((v) => v.toFixed(2)).join(","), "→", max.map((v) => v.toFixed(2)).join(",") + morphs);
};
const center = (m) => { const b = bbox(m); return b.min.map((v, k) => (v + b.max[k]) / 2); };

// ── Cartilages: one STL, five connected pieces ──
const cart = components(await stl(71704)).filter((c) => c.idx.length > 30);
const septalCartilage = cart.find((m) => Math.abs(center(m)[0]) < 0.2);
const lateral = cart.filter((m) => m !== septalCartilage);
const smoothCart = (m) => taubin(subdivide(m), 12);
const flapObstacles = [], retractable = [];
for (const m of lateral) {
  const [x, y] = center(m);
  const kind = y > 0 ? "cartilagem_lateral_superior" : "cartilagem_alar";
  const sm = smoothCart(m);
  if (x > 0) { flapObstacles.push(sm); retractable.push({ name: `${kind}_esq`, mesh: sm }); }
  else add(`${kind}_dir`, sm);
}

// ── Bones ──
// Every crop is a clean planar cut (splitByField), never a dropped triangle, and
// the leftover shards are removed afterwards. Smoothing happens BEFORE the final
// cut so the cut edge stays straight.
const SHARD = 150; // triangles
const nasalR = await stl(53647), nasalL = await stl(53648);
const vomerScan = await stl(9710);
const ethmoid = await stl(52740);
const conchaR = await stl(54737), conchaL = await stl(54738);

// Frontal: only the nasal root (nasion), cut by a rounded-rectangle field so the
// boundary is smooth, then shards dropped.
const frontalFull = await stl(52734);
const roundBox = (x, y, z, cx, cy, hx, hy, r) => {
  const qx = Math.abs(x - cx) - hx + r, qy = Math.abs(y - cy) - hy + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
const frontal = dropIslands(
  cropField(cropBox(frontalFull, [-Infinity, -Infinity, -1.7], [Infinity, Infinity, Infinity]), (x, y, z) => roundBox(x, y, z, 0, 3.55, 1.45, 1.05, 0.5)),
  SHARD,
);

// Maxilla + palatine: no alveolar process / teeth. Every shell is cut a hair below the
// floor's upper surface (smooth field from the measured floor) and a closed slab is
// added underneath (floor.mjs). The lateral part (zygoma, orbit, sinus) is cut at
// |x| = WALL_X so the lateral nasal wall reads as a clean section.
const WALL_X = 1.75, FLOOR_MIN = -1.95, BONE_MIN = -1.75;
const maxPrep = (m) => taubin(cropBox(m, [-4, -3.4, -Infinity], [4, Infinity, Infinity]), 4);
const maxRraw = maxPrep(await stl(53649)), maxLraw = maxPrep(await stl(53650));
const palRraw = taubin(await stl(53655), 4), palLraw = taubin(await stl(53656), 4);
const floor = buildFloor([maxRraw, maxLraw, palRraw, palLraw]);
const boneCut = (m, side) => dropIslands(cropField(
  cropBox(m, [side < 0 ? -WALL_X : -Infinity, -Infinity, -5.0], [side > 0 ? WALL_X : Infinity, Infinity, Infinity]),
  (x, y, z) => Math.max(floor.at(x, z) - 0.14, BONE_MIN) - y,
), SHARD);
const maxR = boneCut(maxRraw, -1), maxL = boneCut(maxLraw, 1);
const palR = boneCut(palRraw, -1), palL = boneCut(palLraw, 1);
const slab = taubin(floorSlab(floor, { xMax: WALL_X, thick: 0.5, yMin: FLOOR_MIN, cover: [maxR, maxL, palR, palL] }), 3);
const ethCut = (() => {
  // Replace the midline rim of the ethmoid by the synthesised perpendicular plate
  // (cut with planes, not by dropping triangles) and trim the lateral part.
  const e = cropBox(ethmoid, [-1.7, -Infinity, -Infinity], [1.7, Infinity, Infinity]);
  const a = splitByField(e, (x) => 0.5 - x);          // x > 0.5 → neg
  const rest = splitByField(a.pos, (x) => x + 0.5);   // x < -0.5 → neg
  const mid = splitByField(rest.pos, (x, y) => 3.4 - y); // |x| < 0.5, y > 3.4 → neg
  return dropIslands(merge([a.neg, rest.neg, mid.neg]), SHARD);
})();

const edge = (m) => smoothBoundary(m, 14, 3);
const nasalSolid = (m) => taubin(solidify(taubin(subdivide(m), 12), { radius: 0.09 }), 6);
add("osso_nasal_dir", simplify(nasalSolid(nasalR), 0.3, 0.003));
const nasalLsolid = nasalSolid(nasalL);
add("osso_nasal_esq", simplify(nasalLsolid, 0.3, 0.003));
add("etmoide", edge(taubin(ethCut, 3)));
add("maxila_dir", simplify(edge(maxR), 0.55));
add("maxila_esq", simplify(edge(maxL), 0.55));
add("palatino_dir", simplify(edge(palR), 0.6));
add("palatino_esq", simplify(edge(palL), 0.6));
add("maxila_assoalho", simplify(slab, 0.2, 0.004));
// Turbinates: squeezed/lifted off the floor and attached to the lateral wall.
const wallL = wallProfile(+1, [maxL, palL, ethCut]), wallR = wallProfile(-1, [maxR, palR, ethCut]);
const conchaRs = taubin(subdivide(reshapeConcha(conchaR, -1, wallR, { squeeze: 0, lift: 0.25 })), 6);
const conchaLs = taubin(subdivide(reshapeConcha(conchaL, +1, wallL, { squeeze: 0.19, lift: 0.18 })), 6);
add("concha_inferior_dir", conchaRs);
add("concha_inferior_esq", conchaLs);

// ── Septum (synthesised, with deviation / flap morph targets) ──
const septum = buildSeptum({
  septalCartilage,
  vomer: vomerScan,
  nasalBones: merge([nasalR, nasalL]),
  frontal,
  leftWall: [conchaLs, maxL, palL, crop(ethCut, (x) => x > 0.3)],
  floorMid: floor.mid,
  flapObstacles: [conchaLs, maxL, palL, ethCut, nasalLsolid, ...flapObstacles], // limit the deviation D
  liftObstacles: [conchaLs, maxL, palL, ethCut, nasalLsolid],                    // limit the flap lift (the left cartilages retract instead)
});
for (const p of septum.parts) {
  // (parts with morph targets keep a dense enough mesh for the displacement to stay smooth)
  if (p.name === "splints") add(p.name, simplify(p, 0.12, 0.02));
  else add(p.name, p.idx.length > 6000 ? simplify(p, p.name.startsWith("mucosa") ? 0.4 : 0.4, 0.0012) : p);
}

// Left lateral/alar cartilages retract laterally with the flap (morph `descolamento`, as under a speculum),
// by the flap's own lift + a small margin, so the lifted flap never meets them.
for (const { name, mesh } of retractable) {
  const lifted = Float32Array.from(mesh.pos);
  for (let i = 0; i < lifted.length; i += 3) lifted[i] += septum.info.retract(mesh.pos[i + 2], mesh.pos[i + 1]);
  add(name, { ...mesh, morphs: [{ name: "descolamento", pos: lifted }] });
}

// ── Coronal slice (corte_*) ──
if (process.env.SLICE_SCAN) {
  for (let z = -1.2; z >= -3.41; z -= 0.2) {
    const s = buildSlice({ floor, maxL, maxR, palL, palR, conchaL: conchaLs, conchaR: conchaRs, septum: { masks: septum.info.masks, label: septum.info.label, D: septum.D, halfT: septum.info.halfT } }, { z0: z });
    const a = (m) => (m.reduce((q, v) => q + v, 0) * 0.0004).toFixed(2);
    const w = s.widths;
    console.log("SCAN z", z.toFixed(1), "turbL", a(s.tL), "turbR", a(s.tR), "left gap straight/dev", w.straight.L.min.toFixed(2), w.deviated.L.min.toFixed(2), "right", w.straight.R.min.toFixed(2), w.deviated.R.min.toFixed(2), "cart", a(s.sCart), "bone", a(s.sBone));
  }
}
const slice = buildSlice({ floor, maxL, maxR, palL, palR, conchaL: conchaLs, conchaR: conchaRs, septum: { masks: septum.info.masks, label: septum.info.label, D: septum.D, halfT: septum.info.halfT } }, process.env.SLICE_Z0 ? { z0: +process.env.SLICE_Z0 } : {});
for (const p of meshSlice(slice, (m) => merge(components(m).map((c) => (c.idx.length > 1500 ? simplify(c, 0.2, 0.005) : c))))) add(p.name, p);

// ── Skin: clean crop around the nose (used as a translucent ghost) ──
const skinLoose = cropBox(await stl(7163), [-6, -4.5, -4.5], [6, 7.5, Infinity]);
const skin = dropIslands(cropBox(taubin(skinLoose, 6), [-4.5, -3.5, -3.5], [4.5, 6, Infinity]), 500);
add("pele", simplify(skin, 0.6, 0.005));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const raw = writeGLB(OUT, parts);
if (process.env.ANATOMY_RAW) fs.copyFileSync(OUT, process.env.ANATOMY_RAW);

// Quantise + meshopt-compress (decoded in the browser by three's MeshoptDecoder).
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(OUT);
await doc.transform(prune(), quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: "high" }));
await io.write(OUT, doc);
const tris = parts.reduce((s, p) => s + p.idx.length / 3, 0);
console.log(`\n${path.relative(ROOT, OUT)}: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB (raw ${(raw / 1024).toFixed(0)} KB), ${parts.length} parts, ${tris} triangles`);
const fails = runChecks({ parts, septum: septum.info, floor, slice });
if (fails.length) {
  console.error(`\n${fails.length} model invariant(s) FAILED:\n - ${fails.join("\n - ")}`);
  process.exit(1);
}
console.log("\nall model invariants hold");
