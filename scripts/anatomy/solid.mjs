// Turns a thin, perforated scan shell into a clean closed solid of constant thickness:
// iso-surface of the distance to the shell (surface nets). Holes smaller than the
// thickness close up, so a section through the bone reads as a clean solid cap.
import { makeDistance } from "./geom.mjs";
import { surfaceNets, gaussian } from "./sdf.mjs";
import { bbox } from "./mesh.mjs";

export function solidify(mesh, { radius = 0.09, cell = 0.04, pad = 0.2 } = {}) {
  const dist = makeDistance([mesh], { cell: 0.15 });
  const { min, max } = bbox(mesh);
  const lo = min.map((v) => v - pad), hi = max.map((v) => v + pad);
  return surfaceNets((x, y, z) => dist(x, y, z, radius + 0.4) - radius, lo, hi, [cell, cell, cell]);
}
