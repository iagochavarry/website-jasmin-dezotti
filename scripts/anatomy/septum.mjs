// Synthesises the nasal septum for the septoplasty model.
//
// BodyParts3D resolves the quadrangular cartilage and the vomer, but the
// perpendicular plate of the ethmoid is missing (only its rim survived the
// segmentation). We rebuild the septum as flush, watertight plates whose
// outlines come from the scan, then split it the way a septoplasty does:
//   - the L-strut (≥ 1 cm dorsal and caudal) that must be preserved,
//   - the deviated central cartilage and the bony spur that are resected.
// The septum is ONE continuous plate surface (normals computed on the whole) that is
// then cut into its pieces along smooth mask boundaries (splitByField), so the intact
// septum shows no seam; removing a piece leaves a clean open edge on the L-strut.
// Morph targets: "desvio" (deviation to the patient's left, +x) and, for the
// mucosa, "descolamento" (mucoperichondrial flap elevation).
//
// Axes: x = patient's left, y = up, z = anterior. Units: cm.
import {
  Grid2D, rasterizeMesh, pointInPolygon, largestRegion, fillHoles,
  signedDistance, gaussian, surfaceNets, plate, and, or, minus, edt,
} from "./sdf.mjs";
import { makeDistance } from "./geom.mjs";
import { bbox, taubin, merge as mergeMeshes, normals, splitByField, dropIslands, components, weld } from "./mesh.mjs";

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Perpendicular plate outline (z, y), traced against the scan: nasal bones
// and frontal spine in front, cribriform plate above, sphenoid rostrum behind,
// vomer below, septal cartilage in front-below.
const PPE_OUTLINE = [
  [0.66, 1.62], [0.35, 1.86], [-0.15, 2.42], [-0.65, 2.98], [-1.0, 3.3], [-1.45, 3.48],
  [-2.4, 3.55], [-3.2, 3.45], [-3.8, 2.9], [-4.4, 2.64], [-4.85, 2.5], [-4.9, 1.3],
  [-4.4, 1.0], [-3.9, 0.86], [-3.4, 0.9], [-2.9, 0.58], [-2.4, 0.28], [-1.9, 0.12],
  [-1.4, -0.05], [-0.4, -0.1], [0.66, 0.4],
];
// Posterior extension of the quadrangular cartilage to the classic oblique
// chondro-ethmoidal junction (keystone → sphenoidal process).
const CART_EXTENSION = [[0.64, 1.62], [-1.7, 0.02], [-1.7, -0.35], [0.64, -0.2]];

export const STRUT = 1.0;        // cm, minimum perpendicular L-strut width (dorsal)
export const STRUT_CAUDAL = 1.05;  // cm, minimum perpendicular caudal width
const MARGIN = 0.04;             // keeps the width ≥ limit after the outline is smoothed

export function buildSeptum(src) {
  const g = new Grid2D(-7.1, 3.0, -2.1, 4.0, 0.02);
  const proj = (x, y, z) => [z, y];

  // ── Masks ──
  const cartScan = rasterizeMesh(g, src.septalCartilage, proj);
  let cart = fillHoles(g, or(cartScan, g.fill((u, v) => pointInPolygon(u, v, CART_EXTENSION))));
  cart = largestRegion(g, cart);
  let vomer = largestRegion(g, minus(fillHoles(g, rasterizeMesh(g, src.vomer, proj)), cart));
  const nasal = rasterizeMesh(g, slabOf(src.nasalBones, 0.25), proj);
  const frontal = rasterizeMesh(g, slabOf(src.frontal, 0.25), proj);
  let ppe = roundCorners(g, g.fill((u, v) => pointInPolygon(u, v, PPE_OUTLINE)), 0.3);
  ppe = largestRegion(g, minus(minus(minus(minus(ppe, cart), vomer), nasal), frontal));
  // the nasal-bone / frontal footprints are rasterised triangles: smooth the staircase they leave
  const smoothMask = (m, sigma) => Uint8Array.from(gaussian(g, Float32Array.from(m), sigma), (v) => (v > 0.5 ? 1 : 0));
  ppe = largestRegion(g, minus(minus(smoothMask(ppe, 5), cart), vomer));

  // ── Rest on the nasal floor: grow the vomer / cartilage base down to the floor profile ──
  const FLOOR_U_MAX = 0.45; // anterior to this there is no floor bone (free columella)
  for (let i = 0; i < g.nu; i++) {
    const u = g.u(i);
    if (u > FLOOR_U_MAX) continue;
    const mid = src.floorMid(u);
    if (!Number.isFinite(mid)) continue; // no floor bone under the midline (choanae)
    const floorY = mid - 0.05; // sink slightly into the crest
    let lo = -1;
    for (let j = 0; j < g.nv; j++) if (cart[j * g.nu + i] || vomer[j * g.nu + i] || ppe[j * g.nu + i]) { lo = j; break; }
    if (lo < 0 || g.v(lo) <= floorY) continue;
    const owner = cart[lo * g.nu + i] ? cart : vomer[lo * g.nu + i] ? vomer : null;
    if (!owner) continue;
    for (let j = Math.max(0, Math.floor((floorY - g.v0) / g.h)); j < lo; j++) owner[j * g.nu + i] = 1;
  }
  cart = largestRegion(g, cart);
  vomer = largestRegion(g, vomer);

  // ── L-strut: the cartilage must keep ≥ 1 cm (Euclidean ⇒ perpendicular) from the
  //    whole dorsal border (nasal dorsum + oblique chondro-ethmoidal edge up to the PPE)
  //    and ≥ 1.05 cm from the caudal border ──
  const dorsalSet = g.mask(), caudalSet = g.mask();
  const dorsalBorder = [], caudalBorder = [];
  for (let i = 0; i < g.nu; i++) {
    const u = g.u(i); if (u < -1.8 || u > 2.6) continue;
    for (let j = g.nv - 1; j >= 0; j--) if (cart[j * g.nu + i]) { dorsalSet[j * g.nu + i] = 1; dorsalBorder.push([u, g.v(j)]); break; }
  }
  for (let j = 0; j < g.nv; j++) {
    const v = g.v(j); if (v < -1.5) continue;
    for (let i = g.nu - 1; i >= 0; i--) if (cart[j * g.nu + i]) { caudalSet[j * g.nu + i] = 1; caudalBorder.push([g.u(i), v]); break; }
  }
  const dDorsal = edt(g, dorsalSet).map((d) => d * g.h);
  const dCaudal = edt(g, caudalSet).map((d) => d * g.h);
  // caudal line (used to place the Killian-type incision behind the caudal border)
  const caudalPts = [];
  for (let j = 0; j < g.nv; j++) {
    const v = g.v(j); if (v < -1.35 || v > -0.55) continue;
    for (let i = g.nu - 1; i >= 0; i--) if (cart[j * g.nu + i]) { caudalPts.push([g.u(i), v]); break; }
  }
  const caudal = fitLine(caudalPts.map(([u, v]) => [v, u])); // u = a + b v

  // ── Thickness and deviation fields ──
  // cartilage fraction (smooth) so the plate thickness is continuous across the junction
  const cartTotalSd = signedDistance(g, cart, 1.5);
  const base = (v) => smoothstep(-0.75, -1.45, v);
  const tCart = (v) => 0.2 + 0.07 * base(v);
  const tBone = (v) => 0.15 + 0.17 * base(v);
  const thickness = (u, v) => {
    const w = smoothstep(0.12, -0.12, g.sample(cartTotalSd, u, v, 1));
    return tBone(v) + (tCart(v) - tBone(v)) * w;
  };
  const halfT = (u, v) => 0.5 * thickness(u, v);

  // How far the septum can move left before touching the lateral wall.
  const room = g.field().fill(1);
  for (const m of [...src.leftWall, ...src.flapObstacles]) {
    for (let i = 0; i < m.pos.length; i += 3) {
      const x = m.pos[i], y = m.pos[i + 1], z = m.pos[i + 2];
      if (x < 0.12) continue;
      const ci = Math.round((z - g.u0) / g.h), cj = Math.round((y - g.v0) / g.h);
      for (let dj = -4; dj <= 4; dj++) for (let di = -4; di <= 4; di++) {
        const ii = ci + di, jj = cj + dj;
        if (ii < 0 || jj < 0 || ii >= g.nu || jj >= g.nv) continue;
        const k = jj * g.nu + ii;
        if (x < room[k]) room[k] = x;
      }
    }
  }
  const dev = g.field();
  for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) {
    const u = g.u(i), v = g.v(j);
    // C-shaped deviation of the cartilaginous/bony junction toward the left.
    let d = 0.46 * Math.exp(-((u + 0.35) ** 2) / (2 * 1.25 ** 2) - ((v - 0.15) ** 2) / (2 * 0.8 ** 2));
    // Spur along the chondro-vomerine junction.
    const t = Math.min(1, Math.max(0, (u - 0.2) / (-2.4 - 0.2)));
    const lv = -0.85 + t * (-0.2 + 0.85);
    d += 0.2 * Math.exp(-((v - lv) ** 2) / (2 * 0.14 ** 2)) * smoothstep(0.4, -0.3, u) * smoothstep(-3.2, -2.2, u);
    d *= smoothstep(2.9, 2.0, v);
    const limit = room[j * g.nu + i] - halfT(u, v) - 0.14;
    dev[j * g.nu + i] = Math.max(0, Math.min(d, limit));
  }
  const devS = gaussian(g, dev, 10);
  const D = (u, v) => g.sample(devS, u, v, 0);

  // Only the deviated part is removed; the L-strut and the high bony septum stay.
  const deviated = g.fill((u, v) => D(u, v) > 0.11);
  // Everything behind/below the two struts is resected down to the base (maxillary crest), so the
  // cartilage that stays reads as a clean "L": dorsal strut + caudal strut meeting at the septal angle.
  const resectCart = largestRegion(g, and(cart, g.fill((u, v) => {
    const k = Math.round((v - g.v0) / g.h) * g.nu + Math.round((u - g.u0) / g.h);
    return dDorsal[k] > STRUT + MARGIN && dCaudal[k] > STRUT_CAUDAL + MARGIN;
  })));
  const strut = minus(cart, resectCart);
  const resectBone = largestRegion(g, and(and(or(ppe, vomer), deviated), g.fill((u, v) => v < 1.4 && u < -0.2)));
  ppe = largestRegion(g, minus(ppe, resectBone));
  vomer = largestRegion(g, minus(vomer, resectBone));

  const septumMask = fillHoles(g, or(or(cart, ppe), or(vomer, resectBone)));

  // Partition the septum footprint into exactly five pieces: cells not claimed by any
  // piece (gaps left by the mask algebra) are absorbed by the nearest piece, so the field
  // split below can never leave shards.
  const label = new Uint8Array(g.nu * g.nv);
  let insideDone = false;
  // (opened with a small disc first, so thin tails/slivers vanish and never produce shards)
  [strut, resectCart, ppe, vomer, resectBone].map((m) => roundCorners(g, m, 0.07)).forEach((m, n) => { for (let k = 0; k < m.length; k++) if (m[k] && septumMask[k] && !label[k]) label[k] = n + 1; });
  // (inside the footprint until full; then 25 cells outward so rim vertices land robustly in their piece)
  let outward = 0;
  for (let pass = 0; pass < 600; pass++) {
    let open = 0;
    const next = Uint8Array.from(label);
    const reach = outward >= 25 ? false : true;
    for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) {
      const k = j * g.nu + i;
      if (label[k]) continue;
      if (!septumMask[k] && !(reach && pass > 0 && insideDone)) continue;
      let l = 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii >= 0 && jj >= 0 && ii < g.nu && jj < g.nv && label[jj * g.nu + ii]) { l = label[jj * g.nu + ii]; break; }
      }
      if (l) next[k] = l; else if (septumMask[k]) open++;
    }
    label.set(next);
    if (!open) { insideDone = true; outward++; if (outward > 25) break; }
  }
  // Small disconnected fragments of a piece are absorbed by the neighbouring piece.
  {
    const seen = new Uint8Array(label.length);
    for (let s0 = 0; s0 < label.length; s0++) {
      if (!label[s0] || seen[s0]) continue;
      const id = label[s0], stack = [s0], cells = [];
      seen[s0] = 1;
      while (stack.length) {
        const k = stack.pop(); cells.push(k);
        const i = k % g.nu, j = (k / g.nu) | 0;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ii = i + di, jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= g.nu || jj >= g.nv) continue;
          const kk = jj * g.nu + ii;
          if (!seen[kk] && label[kk] === id) { seen[kk] = 1; stack.push(kk); }
        }
      }
      if (cells.length > 3000 || !cells.some((k) => septumMask[k])) continue; // 0.12 cm²
      const votes = new Map();
      for (const k of cells) {
        const i = k % g.nu, j = (k / g.nu) | 0;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ii = i + di, jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= g.nu || jj >= g.nv) continue;
          const l = label[jj * g.nu + ii];
          if (l && l !== id) votes.set(l, (votes.get(l) ?? 0) + 1);
        }
      }
      let best = 0, bv = 0;
      for (const [l, v] of votes) if (v > bv) { best = l; bv = v; }
      if (best) for (const k of cells) label[k] = best;
    }
  }
  const region = (...ids) => label.map((l) => (ids.includes(l) ? 1 : 0));

  // ── ONE continuous plate for the whole septum, then split along smooth mask boundaries ──
  const plateMesh = (() => {
    const sd = signedDistance(g, septumMask, 1.2);
    const bb = maskBounds(g, septumMask);
    const f = (x, y, z) => plate(g.sample(sd, z, y, 1), Math.abs(x) - thickness(z, y) / 2, 0.06);
    let mesh = surfaceNets(f, [-0.26, bb.v0 - 0.1, bb.u0 - 0.1], [0.26, bb.v1 + 0.1, bb.u1 + 0.1], [0.035, 0.05, 0.05]);
    mesh = taubin(mesh, 4);
    const dev = Float32Array.from(mesh.pos);
    for (let i = 0; i < dev.length; i += 3) dev[i] += D(mesh.pos[i + 2], mesh.pos[i + 1]);
    // normals on the WHOLE plate (base and deviated shape) → no per-piece shading seams
    return {
      pos: mesh.pos, idx: mesh.idx, nrm: normals(mesh),
      morphs: [{ name: "desvio", pos: dev, nrm: normals({ pos: dev, idx: mesh.idx }) }],
    };
  })();
  const sdOf = (mask) => { const sd = signedDistance(g, mask, 3); return (x, y, z) => g.sample(sd, z, y, 1); };
  const cut = (mesh, mask) => splitByField(mesh, sdOf(mask)); // neg = inside mask
  const t1 = cut(plateMesh, region(1, 2));     // cartilage | bone
  const t2 = cut(t1.neg, region(2));           // resected cartilage | strut
  const t3 = cut(t1.pos, region(5));           // resected bone | rest
  const t4 = cut(t3.pos, region(4));           // vomer | perpendicular plate
  const named = (name, m) => ({ name, ...m });
  const pieces = [
    named("septo_cartilagem", t2.pos),
    named("septo_cartilagem_desvio", t2.neg),
    named("lamina_perpendicular", t4.pos),
    named("vomer", t4.neg),
    named("septo_osso_desvio", t3.neg),
  ];
  const parts = absorbFragments(pieces, 400);

  // ── Septal mucosa (mucoperichondrium / mucoperiosteum) ──
  const incisionU = (v) => caudal.a + caudal.b * v - 0.7; // Killian-type, ~7 mm behind the caudal border
  const mucosaMask = fillHoles(g, septumMask);
  const flapMask = and(mucosaMask, g.fill((u, v) => u < incisionU(v) - 0.03));
  const anteriorMask = and(mucosaMask, g.fill((u, v) => u > incisionU(v) + 0.03));
  const openMask = or(mucosaMask, g.fill((u, v) => u > incisionU(v) - 0.05 && v > -1.6 && v < 2.2));
  const liftOpen = signedDistance(g, openMask, 2);
  const liftClosed = signedDistance(g, mucosaMask, 2);
  const MUC = 0.035; // half thickness
  const mucosa = (mask, side, lift, name) => {
    const sd = signedDistance(g, mask, 1.2);
    const bb = maskBounds(g, mask);
    const xc = (z, y) => side * (halfT(z, y) + 0.025 + MUC);
    const f = (x, y, z) => plate(g.sample(sd, z, y, 1), Math.abs(x - xc(z, y)) - MUC, 0.03);
    const lo = side > 0 ? 0.05 : -0.36, hi = side > 0 ? 0.36 : -0.05;
    let mesh = surfaceNets(f, [lo, bb.v0 - 0.1, bb.u0 - 0.1], [hi, bb.v1 + 0.1, bb.u1 + 0.1], [0.014, 0.075, 0.075]);
    mesh = taubin(mesh, 3);
    const part = withDeviation(name, mesh, D);
    if (lift) {
      const lifted = Float32Array.from(mesh.pos);
      for (let i = 0; i < lifted.length; i += 3) lifted[i] += side * lift(mesh.pos[i + 2], mesh.pos[i + 1]);
      part.morphs.push({ name: "descolamento", pos: lifted });
    }
    return part;
  };
  // The flap is elevated over the septum but fades out well below the olfactory roof (y ≈ 2.4).
  const roofFade = (y) => smoothstep(2.4, 1.6, y);
  // Hinged, page-like opening: the flap lifts most at the incision edge and tapers (cosine) to zero at a
  // posterior hinge `HINGE` cm behind it, and fades out toward the floor and the olfactory roof. The lift is
  // also limited by the room left by everything on the left (turbinate, lateral cartilages, walls), so the
  // lifted flap never intersects them (checked in check.mjs).
  const LIFT_MAX = 0.75, HINGE = 3.4;
  const roomF = g.field().fill(1);
  for (const m of src.liftObstacles) {
    for (let i = 0; i < m.pos.length; i += 3) {
      const x = m.pos[i], y = m.pos[i + 1], z = m.pos[i + 2];
      if (x < 0.12) continue;
      const ci = Math.round((z - g.u0) / g.h), cj = Math.round((y - g.v0) / g.h);
      for (let dj = -5; dj <= 5; dj++) for (let di = -5; di <= 5; di++) {
        const ii = ci + di, jj = cj + dj;
        if (ii < 0 || jj < 0 || ii >= g.nu || jj >= g.nv) continue;
        const k = jj * g.nu + ii;
        if (x < roomF[k]) roomF[k] = x;
      }
    }
  }
  const FLAP_MARGIN = 0.09;
  const allowed = g.field();
  for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) {
    const u = g.u(i), v = g.v(j), k = j * g.nu + i;
    allowed[k] = Math.max(0, roomF[k] - (halfT(u, v) + 0.095 + D(u, v)) - FLAP_MARGIN);
  }
  // Rigorous bound: the 3-D distance from the flap's outer face to the nearest obstacle (any direction) minus
  // a margin is a lift that cannot reach it. Evaluated on a coarser grid and interpolated.
  {
    const dist = makeDistance(src.liftObstacles, { cell: 0.2 });
    const g2 = new Grid2D(g.u0, g.u0 + (g.nu - 1) * g.h, g.v0, g.v0 + (g.nv - 1) * g.h, 0.06);
    const bound = g2.field();
    for (let j = 0; j < g2.nv; j++) for (let i = 0; i < g2.nu; i++) {
      const u = g2.u(i), v = g2.v(j);
      const x0 = halfT(u, v) + 0.095 + D(u, v);
      bound[j * g2.nu + i] = Math.max(0, Math.min(1.5, dist(x0, v, u, 1.5)) - FLAP_MARGIN);
    }
    for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) {
      const k = j * g.nu + i;
      allowed[k] = Math.min(allowed[k], g2.sample(bound, g.u(i), g.v(j), 1.4));
    }
  }
  const profile = g.field();
  for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) {
    const u = g.u(i), v = g.v(j);
    const s = incisionU(v) - u;                       // distance behind the incision edge
    const hinge = s <= 0 ? 1 : s >= HINGE ? 0 : 0.5 * (1 + Math.cos((Math.PI * s) / HINGE));
    profile[j * g.nu + i] = LIFT_MAX * hinge * smoothstep(0, 0.6, -g.sample(liftOpen, u, v, 1)) * roofFade(v);
  }
  // clamp by the available room, smooth, clamp again (so smoothing can never push the flap into something)
  const lim = profile.map((p, k) => Math.min(p, allowed[k]));
  const limS = gaussian(g, lim, 12);
  const liftField = limS.map((p, k) => Math.min(p, allowed[k]));
  const flapLift = (z, y) => g.sample(liftField, z, y, 0);
  // Cartilage retraction envelope: the flap's lift dilated by 0.35 cm (so sloping cartilage never lags behind it),
  // lightly smoothed, plus a margin wherever the flap is lifted.
  const retractField = (() => {
    const R = Math.round(0.35 / g.h), tmp = g.field(), dil = g.field();
    for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) { let m = 0; for (let d = -R; d <= R; d++) { const ii = Math.min(g.nu - 1, Math.max(0, i + d)); m = Math.max(m, liftField[j * g.nu + ii]); } tmp[j * g.nu + i] = m; }
    for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) { let m = 0; for (let d = -R; d <= R; d++) { const jj = Math.min(g.nv - 1, Math.max(0, j + d)); m = Math.max(m, tmp[jj * g.nu + i]); } dil[j * g.nu + i] = m; }
    const sm = gaussian(g, dil, 8);
    return sm.map((v, k) => Math.max(v, liftField[k]) + 0.1 * smoothstep(0, 0.1, Math.max(v, liftField[k])));
  })();
  if (process.env.DBG_LIFT) for (const y of [-0.8, -0.3, 0.3, 0.9, 1.5]) console.log('lift y', y, [1.7, 1.2, 0.8, 0.4, 0, -0.5, -1, -1.5, -2, -3].map((z) => `${z}:${flapLift(z, y).toFixed(2)}/${g.sample(allowed, z, y, 0).toFixed(2)}/${g.sample(profile, z, y, 0).toFixed(2)}`).join(' '));
  const rightLift = (z, y) => 0.24 * smoothstep(0, 0.85, -g.sample(liftClosed, z, y, 1)) * roofFade(y);
  parts.push(
    mucosa(flapMask, +1, flapLift, "mucosa_septal_esq"),
    mucosa(anteriorMask, +1, null, "mucosa_septal_esq_anterior"),
    mucosa(mucosaMask, -1, rightLift, "mucosa_septal_dir"),
  );

  // ── Incision line on the left mucosa ──
  const pts = [];
  for (let v = -1.45; v <= 1.2; v += 0.05) {
    const u = incisionU(v);
    if (g.sample(mucosaMask, u, v, 0) < 0.5) continue;
    pts.push([halfT(u, v) + 0.025 + 2 * MUC + 0.01, v, u]);
  }
  parts.push(withDeviation("incisao", tube(pts, 0.038, 10), D));

  // ── Silicone splints (Doyle-type): flat, fully rounded plates, one on each side ──
  const splintFloor = (u) => { const m = src.floorMid(Math.min(u, FLOOR_U_MAX)); return Number.isFinite(m) ? m : -1.6; };
  const splintSd = (() => {
    const mask = g.fill((u, v) => roundBoxSd(u - -0.55, v - -0.82, 2.5, 0.5, 0.5) < 0 && v > splintFloor(u) + 0.04);
    return signedDistance(g, roundCorners(g, mask, 0.25), 1.2);
  })();
  const SPL = 0.045;
  const splintOffset = (z, y) => halfT(z, y) + 0.025 + 2 * MUC + 0.015 + SPL;
  const splintF = (x, y, z) => plate(g.sample(splintSd, z, y, 1), Math.abs(Math.abs(x) - splintOffset(z, y)) - SPL, 0.04);
  parts.push({ name: "splints", ...taubin(surfaceNets(splintF, [-0.5, -1.6, -3.2], [0.5, -0.1, 2.2], [0.015, 0.035, 0.035]), 4) });

  // ── Quilting sutures: neat, clearly visible stitches on both mucosal surfaces ──
  const STITCHES = [[1.05, -0.95], [0.65, 0.15], [0.15, -0.85], [-0.35, 0.3], [-0.9, -0.75], [-1.45, 0.25], [-2.0, -0.65]];
  const stitchMeshes = [];
  for (const side of [1, -1]) {
    for (const [z, y] of STITCHES) {
      const x = (zz, yy) => side * (halfT(zz, yy) + 0.025 + 2 * MUC + 0.02);
      const a = [z - 0.2, y - 0.1], b = [z + 0.2 * side, y + 0.1 * side];
      const N = 6;
      const pts = Array.from({ length: N + 1 }, (_, i) => {
        const t = i / N;
        const zz = a[0] + (b[0] - a[0]) * t, yy = a[1] + (b[1] - a[1]) * t;
        return [x(zz, yy) + side * 0.02 * Math.sin(Math.PI * t), yy, zz];
      });
      stitchMeshes.push(tube(pts, 0.03, 8));
    }
  }
  parts.push({ name: "suturas", ...mergeMeshes(stitchMeshes) });

  const info = {
    caudal, strut: STRUT, strutCaudal: STRUT_CAUDAL,
    dorsalBorder, caudalBorder,
    incision: pts,
    masks: { g, cart, strut, resectCart, ppe, vomer, resectBone },
    dDorsal, dCaudal, label, D, flapLift,
    /** lateral shift of the left lateral/alar cartilages (speculum retraction) that keeps them clear of the lifted flap */
    retract: (z, y) => g.sample(retractField, z, y, 0),
    halfT,
    bounds: bbox({ pos: Float32Array.from(parts.flatMap((p) => Array.from(p.pos))) }),
  };
  return { parts, info, D };
}

/** Signed distance to a rounded box centred at the origin (half sizes hu, hv, corner radius r). */
function roundBoxSd(u, v, hu, hv, r) {
  const qu = Math.abs(u) - hu + r, qv = Math.abs(v) - hv + r;
  return Math.hypot(Math.max(qu, 0), Math.max(qv, 0)) + Math.min(Math.max(qu, qv), 0) - r;
}

// ── helpers ──
/**
 * Tiny disconnected fragments of a piece (where a mask is thinner than the field
 * resolution) are handed to the neighbouring piece that shares their cut vertices,
 * so no part has shards and the plate stays gap-free.
 */
function absorbFragments(pieces, minTris) {
  const keyOf = (p, i) => `${p[i * 3]},${p[i * 3 + 1]},${p[i * 3 + 2]}`;
  const out = pieces.map((p) => ({ ...p }));
  const keep = out.map((p) => {
    const cs = components(p).sort((a, b) => b.idx.length - a.idx.length);
    return { main: cs.filter((c, i) => i === 0 || c.idx.length / 3 >= minTris), frag: cs.filter((c, i) => i > 0 && c.idx.length / 3 < minTris) };
  });
  const adds = out.map(() => []);
  keep.forEach((k, i) => {
    for (const f of k.frag) {
      const keys = new Set();
      for (let v = 0; v < f.pos.length / 3; v++) keys.add(keyOf(f.pos, v));
      let best = -1, bs = 0;
      out.forEach((q, j) => {
        if (j === i) return;
        let n = 0;
        for (let v = 0; v < q.pos.length / 3; v++) if (keys.has(keyOf(q.pos, v))) n++;
        if (n > bs) { bs = n; best = j; }
      });
      if (best >= 0) adds[best].push(f); // otherwise it is dropped (isolated sliver)
    }
  });
  return out.map((p, i) => {
    const m = keep[i].main.length === 1 ? keep[i].main[0] : mergeMeshes(keep[i].main);
    const all = adds[i].length ? weld(mergeMeshes([m, ...adds[i]])) : m;
    return { name: p.name, ...all };
  });
}

function slabOf(m, w) {
  const keep = [];
  for (let t = 0; t < m.idx.length; t += 3) {
    let cx = 0;
    for (let k = 0; k < 3; k++) cx += m.pos[m.idx[t + k] * 3];
    if (Math.abs(cx / 3) < w) keep.push(m.idx[t], m.idx[t + 1], m.idx[t + 2]);
  }
  return { pos: m.pos, idx: Uint32Array.from(keep) };
}

/** Morphological opening with a disc: rounds convex corners to radius r. */
function roundCorners(g, m, r) {
  const sd = signedDistance(g, m, 0);
  const eroded = sd.map((d) => (d < -r ? 1 : 0));
  const back = signedDistance(g, Uint8Array.from(eroded), 0);
  return Uint8Array.from(back.map((d) => (d < r ? 1 : 0)));
}

function maskBounds(g, m) {
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (let j = 0; j < g.nv; j++) for (let i = 0; i < g.nu; i++) if (m[j * g.nu + i]) {
    u0 = Math.min(u0, g.u(i)); u1 = Math.max(u1, g.u(i)); v0 = Math.min(v0, g.v(j)); v1 = Math.max(v1, g.v(j));
  }
  return { u0, u1, v0, v1 };
}

function fitLine(pts) {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0;
  for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; }
  const b = sxy / sxx;
  return { a: my - b * mx, b };
}

function withDeviation(name, mesh, D) {
  const dev = Float32Array.from(mesh.pos);
  for (let i = 0; i < dev.length; i += 3) dev[i] += D(mesh.pos[i + 2], mesh.pos[i + 1]);
  return { name, pos: mesh.pos, idx: mesh.idx, morphs: [{ name: "desvio", pos: dev }] };
}

/** Simple tube along a polyline (points are [x, y, z]). */
function tube(pts, r, sides) {
  const pos = [], idx = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    let tx = q[0] - o[0], ty = q[1] - o[1], tz = q[2] - o[2];
    const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
    // normal: x axis projected off the tangent, binormal = t × n
    let nx = 1 - tx * tx, ny = -tx * ty, nz = -tx * tz;
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2, c = Math.cos(a) * r, d = Math.sin(a) * r;
      pos.push(p[0] + nx * c + bx * d, p[1] + ny * c + by * d, p[2] + nz * c + bz * d);
    }
  }
  for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < sides; s++) {
    const a = i * sides + s, b = i * sides + ((s + 1) % sides), c = a + sides, d = b + sides;
    idx.push(a, b, c, b, d, c);
  }
  // caps
  const cap = (ring, flip) => {
    const center = pos.length / 3;
    const p = pts[ring === 0 ? 0 : pts.length - 1];
    pos.push(p[0], p[1], p[2]);
    for (let s = 0; s < sides; s++) {
      const a = ring * sides + s, b = ring * sides + ((s + 1) % sides);
      if (flip) idx.push(center, a, b); else idx.push(center, b, a);
    }
  };
  cap(0, false); cap(pts.length - 1, true);
  return { pos: Float32Array.from(pos), idx: Uint32Array.from(idx) };
}
