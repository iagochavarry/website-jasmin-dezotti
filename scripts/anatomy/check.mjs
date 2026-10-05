// Build-time invariants for the septoplasty model. Prints every measurement and
// returns the list of failures; build-nose.mjs exits non-zero if there are any.
import { components } from "./mesh.mjs";
import { makeDistance } from "./geom.mjs";
import * as THREE from "three";
import { septoplastia } from "../../lib/anatomy/procedures/septoplastia.ts";

export const LIMITS = {
  strutDorsal: 1.0,            // cm, perpendicular L-strut width
  strutCaudal: 1.0,            // cm (build target is 1.05)
  gapBaseLeft: [0.18, 0.30],   // cm, left inferior turbinate ↔ septal mucosa, septum straight
  gapBaseRight: [0.18, 0.34],
  gapDeviatedLeft: [0.02, 0.10], // deviated septum nearly touches the turbinate
  floorContact: 0.10,          // cm, |septum bottom − floor crest| for z −5…−1
  shardTris: 60,               // smaller disconnected islands are shards
  minBoneY: -2.0,              // alveolar process / teeth reach −2.4 … −2.95
  airflowClearance: 0.12,      // cm
  anchorDistance: 0.25,        // cm (report only)
};

const stateMeshes = (parts, state) =>
  parts.map((p) => ({ name: p.name, idx: p.idx, pos: state === "desvio" ? p.morphs?.find((m) => m.name === "desvio")?.pos ?? p.pos : p.pos }));

export function runChecks({ parts, septum, floor, slice }) {
  const fails = [];
  const L = LIMITS;
  const line = (ok, label, value, note = "") => {
    console.log(`${ok ? "  ok  " : " FAIL "} ${label.padEnd(46)} ${value}${note ? "  " + note : ""}`);
    if (!ok) fails.push(`${label}: ${value} ${note}`);
  };
  const byName = (n) => parts.find((p) => p.name === n);
  console.log("\n── model invariants ──");

  // 1. L-strut width (perpendicular, sagittal plane): cut edge of the strut vs dorsal / caudal borders
  {
    const strut = byName("septo_cartilagem"), resect = byName("septo_cartilagem_desvio");
    const key = (p, i) => `${p[i * 3]},${p[i * 3 + 1]},${p[i * 3 + 2]}`;
    const rs = new Set();
    for (let i = 0; i < resect.pos.length / 3; i++) rs.add(key(resect.pos, i));
    let dMin = Infinity, cMin = Infinity, n = 0;
    for (let i = 0; i < strut.pos.length / 3; i++) {
      if (!rs.has(key(strut.pos, i))) continue;
      n++;
      const z = strut.pos[i * 3 + 2], y = strut.pos[i * 3 + 1];
      for (const [u, v] of septum.dorsalBorder) dMin = Math.min(dMin, Math.hypot(u - z, v - y));
      for (const [u, v] of septum.caudalBorder) cMin = Math.min(cMin, Math.hypot(u - z, v - y));
    }
    line(n > 20 && dMin >= L.strutDorsal, "L-strut dorsal width (min, cm)", dMin.toFixed(3), `≥ ${L.strutDorsal}  (${n} cut-edge vertices)`);
    line(cMin >= L.strutCaudal, "L-strut caudal width (min, cm)", cMin.toFixed(3), `≥ ${L.strutCaudal}`);
  }

  // 1b. what is left of the cartilage is only the two struts: no cartilage outside the 1–1.5 cm bands
  {
    const { g, strut } = septum.masks, { dDorsal, dCaudal } = septum;
    let outside = 0, total = 0;
    for (let k = 0; k < strut.length; k++) if (strut[k]) { total++; if (dDorsal[k] > 1.5 && dCaudal[k] > 1.5) outside++; }
    const area = (outside * g.h * g.h), share = outside / total;
    line(share < 0.02, "cartilage left outside the L bands (cm², share)", `${area.toFixed(3)} (${(share * 100).toFixed(1)} %)`, "< 2 % of the remaining cartilage");
  }

  // 2. turbinate ↔ septal mucosa gaps
  {
    const sides = {
      left: { concha: byName("concha_inferior_esq"), mucosa: ["mucosa_septal_esq", "mucosa_septal_esq_anterior"].map(byName) },
      right: { concha: byName("concha_inferior_dir"), mucosa: [byName("mucosa_septal_dir")] },
    };
    const gap = (side, state) => {
      const { concha, mucosa } = sides[side];
      const dist = makeDistance(stateMeshes(mucosa, state), { cell: 0.15 });
      let m = Infinity;
      for (let i = 0; i < concha.pos.length; i += 3) m = Math.min(m, dist(concha.pos[i], concha.pos[i + 1], concha.pos[i + 2], 0.6));
      return m;
    };
    const gl = gap("left", "base"), gr = gap("right", "base"), gd = gap("left", "desvio");
    line(gl >= L.gapBaseLeft[0] && gl <= L.gapBaseLeft[1], "left turbinate gap, septum straight (cm)", gl.toFixed(3), `∈ [${L.gapBaseLeft}]`);
    line(gr >= L.gapBaseRight[0] && gr <= L.gapBaseRight[1], "right turbinate gap (cm)", gr.toFixed(3), `∈ [${L.gapBaseRight}]`);
    line(gd >= L.gapDeviatedLeft[0] && gd <= L.gapDeviatedLeft[1], "left turbinate gap, septum deviated (cm)", gd.toFixed(3), `∈ [${L.gapDeviatedLeft}]`);
  }

  // 3. septum rests on the floor along z −5 … −1
  {
    const plates = ["septo_cartilagem", "septo_cartilagem_desvio", "lamina_perpendicular", "vomer", "septo_osso_desvio"].map(byName);
    let worst = 0, worstZ = 0, n = 0, valid = 0;
    for (let z = -5; z <= -1 + 1e-9; z += 0.1) {
      n++;
      const mid = floor.mid(z);
      if (!Number.isFinite(mid)) continue;
      let bottom = Infinity;
      for (const p of plates) for (let i = 0; i < p.pos.length; i += 3) if (Math.abs(p.pos[i + 2] - z) < 0.05 && Math.abs(p.pos[i]) < 0.3) bottom = Math.min(bottom, p.pos[i + 1]);
      valid++;
      const d = Math.abs(bottom - mid);
      if (!(d <= worst)) { worst = d; worstZ = z; }
    }
    line(valid / n >= 0.9 && worst <= L.floorContact, "septum bottom vs floor crest (max |Δ|, cm)", worst.toFixed(3), `≤ ${L.floorContact} (worst z ${worstZ.toFixed(1)}; floor under ${valid}/${n} samples)`);
  }

  // 3b. the mucosal flap is lifted over the septum only: it fades out below the olfactory roof (y ≈ 2.4)
  {
    let roof = 0, body = 0;
    for (const name of ["mucosa_septal_esq", "mucosa_septal_dir"]) {
      const p = byName(name), lift = p.morphs.find((m) => m.name === "descolamento").pos;
      for (let i = 0; i < p.pos.length; i += 3) {
        const d = Math.abs(lift[i] - p.pos[i]);
        if (p.pos[i + 1] > 2.45) roof = Math.max(roof, d); else body = Math.max(body, d);
      }
    }
    line(roof <= 0.02 && body > 0.2, "flap lift above y 2.45 / below (max, cm)", `${roof.toFixed(3)} / ${body.toFixed(2)}`, "≤ 0.02 above the roof line, still lifts the septum");
  }

  // 3c. the lifted flap (desvio + descolamento) never touches the septum, turbinate, lateral cartilages or walls
  {
    const flap = byName("mucosa_septal_esq");
    const lifted = { idx: flap.idx, pos: Float32Array.from(flap.pos, (v, i) => v + (flap.morphs[0].pos[i] - v) + (flap.morphs[1].pos[i] - v)) };
    const names = /^(concha_inferior_esq|cartilagem_lateral_superior_esq|cartilagem_alar_esq|maxila_esq|palatino_esq|etmoide|osso_nasal_esq|septo_|lamina_perpendicular|vomer)/;
    // obstacle positions with every morph applied (desvio for the septum, descolamento for the retracted cartilages)
    const dev = (p) => ({ idx: p.idx, pos: Float32Array.from(p.pos, (v, i) => v + (p.morphs ?? []).reduce((s, m) => s + (m.pos[i] - p.pos[i]), 0)) });
    const dist = makeDistance(parts.filter((p) => names.test(p.name)).map(dev), { cell: 0.2 });
    // (the flap's lower edge rests in the floor and its dorsal edge runs under the cartilage junction in every
    // state; those contacts are not caused by the lift, so only contacts created by the lift are counted)
    let min = Infinity, at = null;
    for (let i = 0; i < lifted.pos.length; i += 3) {
      const moved = Math.abs(flap.morphs[1].pos[i] - flap.pos[i]);
      if (moved < 0.01 || lifted.pos[i + 1] < -1.3) continue;
      const d = dist(lifted.pos[i], lifted.pos[i + 1], lifted.pos[i + 2], 0.5);
      const d0 = dist(flap.pos[i] + (flap.morphs[0].pos[i] - flap.pos[i]), flap.pos[i + 1], flap.pos[i + 2], 0.5);
      if (d0 < 0.02 && d >= d0 - 0.005) continue; // already touching before the lift (junction under the cartilage / nasal bones)
      if (process.env.DBG_FLAP && d < 0.02) console.log('flap vtx', [lifted.pos[i], lifted.pos[i+1], lifted.pos[i+2]].map((v)=>v.toFixed(3)), 'd', d.toFixed(3), 'd0', d0.toFixed(3), 'moved', moved.toFixed(3));
      if (d < min) { min = d; at = [lifted.pos[i], lifted.pos[i + 1], lifted.pos[i + 2]].map((v) => +v.toFixed(2)); }
    }
    line(min >= 0.02, "lifted flap clearance to septum/turbinate/cartilages (cm)", min.toFixed(3), `≥ 0.02 for every vertex the lift moves; closest at ${at}`);
  }

  // 4. shards: no part has a tiny disconnected island
  {
    let worst = null;
    for (const p of parts) {
      const cs = components({ pos: p.pos, idx: p.idx });
      const small = cs.filter((c) => c.idx.length / 3 < L.shardTris);
      if (small.length && (!worst || small.length > worst.n)) worst = { name: p.name, n: small.length, tris: small.map((c) => c.idx.length / 3) };
    }
    line(!worst, `no islands < ${L.shardTris} triangles`, worst ? `${worst.name}: ${worst.tris.join(",")}` : "none");
  }

  // 5. no alveolar process / teeth
  {
    let minY = Infinity, who = "";
    for (const p of parts) if (/^(maxila|palatino)/.test(p.name)) for (let i = 1; i < p.pos.length; i += 3) if (p.pos[i] < minY) { minY = p.pos[i]; who = p.name; }
    line(minY >= L.minBoneY, "lowest maxilla / palatine point y (cm)", minY.toFixed(2), `≥ ${L.minBoneY} (${who})`);
  }

  // 6. airflow clearance in both states
  {
    // (skin is a translucent ghost and the scan has the nostrils pinched shut, so it is not an obstacle)
    const solid = parts.filter((p) => !/^(incisao|splints|suturas|pele)$|^corte_/.test(p.name));
    for (const state of ["desvio", "base"]) {
      const dist = makeDistance(stateMeshes(solid, state), { cell: 0.25 });
      const res = septoplastia.airflow.map((a, si) => {
        const curve = new THREE.CatmullRomCurve3(a.points.map((q) => new THREE.Vector3(...q)), false, "centripetal");
        let min = Infinity, at = null;
        const p = new THREE.Vector3();
        for (let s = 0; s <= 1.0001; s += 0.0025) {
          curve.getPointAt(Math.min(1, s), p);
          const d = dist(p.x, p.y, p.z, 0.6);
          if (process.env.DBG_FLAP && d < 0.02) console.log('flap vtx', [lifted.pos[i], lifted.pos[i+1], lifted.pos[i+2]].map((v)=>v.toFixed(3)), 'd', d.toFixed(3), 'd0', d0.toFixed(3), 'moved', moved.toFixed(3));
      if (d < min) { min = d; at = [p.x, p.y, p.z].map((v) => +v.toFixed(2)); }
        }
        return { si, side: a.side, min, at };
      });
      const worst = res.reduce((a, b) => (b.min < a.min ? b : a));
      line(worst.min >= L.airflowClearance, `airflow clearance, ${state === "desvio" ? "deviated" : "straight"} (min, cm)`, worst.min.toFixed(3),
        `≥ ${L.airflowClearance}; per stream ${res.map((r) => r.min.toFixed(2)).join("/")}; worst stream ${worst.si} at ${worst.at}`);
    }
    const ends = septoplastia.airflow.every((a) => a.points[0][2] >= 2 && a.points[a.points.length - 1][2] <= -6.5);
    line(ends, "airflow enters at the nostrils, exits at the choanae", ends ? "yes" : "no");
    const narrow = septoplastia.airflow.filter((a) => a.side === "left").every((a) => a.narrowing);
    line(narrow, "left streams keep their `narrowing`", narrow ? "yes" : "no");
  }

  // 6b. coronal slice (corte_*): watertight solids, front face at z0, airway widths, turbinates attached
  {
    const cortes = parts.filter((p) => p.name.startsWith("corte_"));
    let open = 0, worst = "";
    for (const p of cortes) {
      const nv = p.pos.length / 3, cnt = new Map();
      for (let t = 0; t < p.idx.length; t += 3) for (let k = 0; k < 3; k++) { const a = p.idx[t + k], b = p.idx[t + (k + 1) % 3]; const e = a < b ? a * nv + b : b * nv + a; cnt.set(e, (cnt.get(e) ?? 0) + 1); }
      let o = 0; for (const c of cnt.values()) if (c === 1) o++;
      if (o) { open += o; worst = p.name; }
    }
    line(cortes.length >= 9 && open === 0, `slice solids watertight (${cortes.length} nodes, open edges)`, String(open), worst);
    let zmax = -Infinity; for (let i = 2; i < byName("corte_osso").pos.length; i += 3) zmax = Math.max(zmax, byName("corte_osso").pos[i]);
    line(Math.abs(zmax - slice.z0) < 1e-3, "slice front face z (cm)", `${zmax.toFixed(4)} (z0 ${slice.z0})`);
    const { straight: s, deviated: d } = slice.widths;
    const f = (v) => v.toFixed(2);
    line(slice.z0 >= -2.6 && slice.z0 <= -2.4, "slice z0 (cm)", f(slice.z0), "−2.6 … −2.4: inferior turbinate largest, spur beside it");
    line(s.L.min >= 0.18 && s.L.min <= 0.30 && d.L.min >= 0.04 && d.L.min <= 0.12, "left common-meatus gap z0, straight → deviated (cm)", `${f(s.L.min)} → ${f(d.L.min)}`, "straight 0.18–0.30, deviated 0.04–0.12");
    line(s.R.min >= 0.22 && s.R.min <= 0.34 && d.R.min >= s.R.min - 0.01, "right common-meatus gap z0, straight → deviated (cm)", `${f(s.R.min)} → ${f(d.R.min)}`, "straight 0.22–0.34, never narrower when deviated");
    line(s.L.min <= s.R.min + 0.01, "left gap not wider than right (straight)", `${f(s.L.min)} ≤ ${f(s.R.min)}`);
    line(s.L.cleft >= 0.18 && s.L.cleft <= 0.42 && s.R.cleft >= 0.18 && s.R.cleft <= 0.42, "olfactory cleft width y > 2.45 (L / R, cm)", `${f(s.L.cleft)} / ${f(s.R.cleft)}`, "2–4 mm (0.18–0.42 incl. lining)");
    const G = slice.geom, wh = (b) => [b.x1 - b.x0, b.y1 - b.y0];
    const [lw, lh] = wh(G.infL), [rw, rh] = wh(G.infR);
    line(lw >= 0.8 && lw <= 1.05 && rw >= 0.8 && rw <= 1.05 && lh >= 1.1 && lh <= 1.45 && rh >= 1.1 && rh <= 1.45, "inferior turbinates w × h (L | R, cm)", `${f(lw)}×${f(lh)} | ${f(rw)}×${f(rh)}`, "≈ 0.85–1.0 × 1.2–1.4");
    line(G.area.infL <= G.area.infR * 1.05, "left inferior turbinate not larger than right (cm²)", `${f(G.area.infL)} vs ${f(G.area.infR)}`);
    const [mlw, mlh] = wh(G.midL), [mrw, mrh] = wh(G.midR);
    line(mlw >= 0.4 && mlw <= 0.78 && mrw >= 0.4 && mrw <= 0.78 && mlh >= 0.9 && mlh <= 1.2 && mrh >= 0.9 && mrh <= 1.2 && G.midL.y0 >= 1.1 && G.midL.y1 <= 2.4 && G.midR.y1 <= 2.4, "middle turbinates w × h (L | R, cm)", `${f(mlw)}×${f(mlh)} | ${f(mrw)}×${f(mrh)}`, "body ≈ 0.45 × 1.0 at y 1.2–2.3, plus its neck into the wall");
    line(G.meatus.L >= 0.3 && G.meatus.R >= 0.3, "inferior meatus clearance under the turbinates (L / R, cm)", `${f(G.meatus.L)} / ${f(G.meatus.R)}`, "≥ 0.3");
    const { g, tL, tR, mL, mR, lining, bone } = slice;
    const attached = (t) => { let n = 0; for (let j = 2; j < g.nv - 2; j++) for (let i = 2; i < g.nu - 2; i++) { const k = j * g.nu + i; if (!t[k]) continue; for (const [di, dj] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) { const kk = (j + dj) * g.nu + i + di; if (lining[kk] || bone[kk]) { n++; break; } } } return n; };
    const att = [tL, tR, mL, mR].map(attached);
    line(att.every((n) => n >= 10), "turbinates attached to the lateral wall (contact cells inf L/R, mid L/R)", att.join(" / "), "≥ 10 each");
  }

  // 7. label anchors (report only)
  {
    const layerOf = (name) => septoplastia.parts.find((d) => d.match.test(name))?.layer;
    const states = ["base", "desvio"].map((s) => stateMeshes(parts, s));
    const bad = [];
    for (const lab of septoplastia.labels) {
      if (!lab.layer) continue;
      let best = { d: Infinity, p: null };
      for (const st of states) {
        const meshes = st.filter((m) => layerOf(m.name) === lab.layer);
        const dist = makeDistance(meshes, { cell: 0.3 });
        const d = dist(...lab.anchor, 1.5);
        if (d < best.d) best = { d, p: dist.point.map((v) => +v.toFixed(2)) };
      }
      if (best.d > L.anchorDistance) bad.push({ id: lab.id, layer: lab.layer, anchor: lab.anchor, d: best.d, p: best.p });
    }
    console.log(`  info  label anchors farther than ${L.anchorDistance} cm from a mesh of their layer: ${bad.length ? "" : "none"}`);
    for (const b of bad) console.log(`        ${b.id.padEnd(18)} [${b.layer}] anchor ${JSON.stringify(b.anchor)}  ${b.d.toFixed(2)} cm  → nearest point ${JSON.stringify(b.p)}`);
  }
  return fails;
}
