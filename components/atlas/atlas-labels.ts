import * as THREE from "three";

/** `panel`: a full-height side panel; labels keep to the free side instead of dodging it. */
export interface Rect { x: number; y: number; w: number; h: number; panel?: boolean }

export interface LabelInput {
  key: string;
  structure: string;
  text: string;
  color: string;
  anchor: THREE.Vector3;
  column?: "left" | "right";
  /** Tappable pill (opens the info card of a point label). */
  clickable?: boolean;
}

export interface LabelFrame {
  camera: THREE.Camera;
  /** Stage size in CSS px. */
  width: number;
  height: number;
  items: LabelInput[];
  /** Master switch ("Nomes"). When off only the selected structure keeps its label. */
  enabled: boolean;
  /** Structure ids currently selected (always labelled, never dropped by a leader crossing). */
  selected: string[];
  /** Camera flight in progress: everything fades out. */
  flying: boolean;
  /** UI rectangles (stage coordinates) the pills must stay clear of. */
  keepOut: Rect[];
  /** Screen bounds of the model: pills are placed outside it when there is room. */
  model: Rect | null;
  phone: boolean;
  /** Stacked layout (phones, tablet portrait): the model spans the stage width, so pills hug the stage edges. */
  narrow: boolean;
}

interface Item {
  key: string;
  root: HTMLDivElement;
  dot: HTMLSpanElement;
  line: HTMLSpanElement;
  pill: HTMLSpanElement;
  text: string;
  pw: number;
  ph: number;
  shown: boolean;
  ax: number;
  ay: number;
  right: boolean;
  x: number;
  y: number;
}

const GAP = 6;
const MAX_DESKTOP = 6;
const MAX_PHONE = 3;

/**
 * 3D → 2D annotations: a coloured dot on the anchor, a thin leader and a pill pushed out to the left or right.
 * Pills never overlap each other or the UI keep-out rectangles, and stay inside the stage.
 */
export class AtlasLabels {
  private pool = new Map<string, Item>();
  private measuredKey = "";

  constructor(private layer: HTMLElement, private onClick?: (key: string) => void) {}

  dispose() {
    this.pool.forEach((i) => i.root.remove());
    this.pool.clear();
  }

  private get(inp: LabelInput): Item {
    let it = this.pool.get(inp.key);
    if (!it) {
      const root = document.createElement("div");
      root.className = "atlas-label";
      root.innerHTML = `<span class="atlas-label-line"></span><span class="atlas-label-dot"></span><span class="atlas-label-text"></span>`;
      const [line, dot, pill] = Array.from(root.children) as HTMLSpanElement[];
      pill.textContent = inp.text;
      if (inp.clickable) {
        pill.classList.add("is-click");
        pill.addEventListener("click", () => this.onClick?.(inp.key));
      }
      dot.style.setProperty("--c", inp.color);
      this.layer.appendChild(root);
      it = { key: inp.key, root, dot, line, pill, text: inp.text, pw: 0, ph: 0, shown: false, ax: 0, ay: 0, right: true, x: 0, y: 0 };
      this.pool.set(inp.key, it);
      this.measuredKey = "";
    } else if (it.text !== inp.text) {
      // Same structure, different wording in another cut (e.g. "Septo · osso" vs "Lâmina perpendicular").
      it.text = inp.text;
      it.pill.textContent = inp.text;
      this.measuredKey = "";
    }
    return it;
  }

  update(f: LabelFrame) {
    const { width: w, height: h } = f;
    if (!w || !h) return;
    const v = new THREE.Vector3();
    const phone = f.phone;
    const edge = phone || f.narrow;
    const PAD = phone ? 8 : 12;
    const max = phone ? MAX_PHONE : MAX_DESKTOP;

    // Which labels are wanted this frame.
    const wanted: { it: Item; inp: LabelInput }[] = [];
    if (!f.flying) {
      for (const inp of f.items) {
        const isSel = f.selected.includes(inp.structure);
        if (!f.enabled && !isSel) continue;
        if (phone && f.selected.length && !isSel) continue; // card open on a phone: only the selected structure keeps a pill
        if (wanted.length >= max && !isSel) continue;
        if (phone && wanted.some((x) => x.inp.structure === inp.structure)) continue; // one pill per structure on phones
        wanted.push({ it: this.get(inp), inp });
      }
    }
    const wantedSet = new Set(wanted.map((x) => x.it));

    // Measure pills (only when the set or the stage changes).
    const mk = `${w}x${h}x${phone}:${wanted.map((x) => x.it.key).join(",")}`;
    if (mk !== this.measuredKey) {
      this.measuredKey = mk;
      for (const it of Array.from(this.pool.values())) { it.pw = it.pill.offsetWidth; it.ph = it.pill.offsetHeight; }
    }

    // Edge panels become horizontal bounds; small UI (tool buttons, info card) become obstacles.
    let minX = PAD, maxX = w - PAD;
    const obstacles: Rect[] = [];
    for (const r of f.keepOut) {
      if (r.w <= 0 || r.h <= 0) continue;
      if (r.panel && r.x + r.w < w * 0.5) minX = Math.max(minX, r.x + r.w + PAD);
      else if (r.panel) maxX = Math.min(maxX, r.x - PAD);
      else obstacles.push(r);
    }
    const cx = (minX + maxX) / 2;

    const active: Item[] = [];
    for (const { it, inp } of wanted) {
      v.copy(inp.anchor).project(f.camera);
      const ok = v.z < 1 && Math.abs(v.x) < 0.98 && Math.abs(v.y) < 0.98;
      it.ax = (v.x * 0.5 + 0.5) * w;
      it.ay = (-v.y * 0.5 + 0.5) * h;
      if (!ok) continue;
      it.right = inp.column ? inp.column === "right" : it.ax >= cx;
      active.push(it);
    }
    const out = phone ? 22 : 36;
    const mdl = f.model;
    for (const it of active) {
      // Pills live in columns just outside the framed model (never on top of the anatomy) whenever there is room.
      const colX = (right: boolean) => (edge ? (right ? maxX - it.pw : minX) : mdl ? (right ? mdl.x + mdl.w + 12 : mdl.x - 12 - it.pw) : null);
      const blocked = (x: number) => obstacles.some((o) => x < o.x + o.w + GAP && x + it.pw > o.x - GAP && it.ay + it.ph / 2 + GAP > o.y && it.ay - it.ph / 2 - GAP < o.y + o.h);
      const fits = (x: number | null) => x !== null && x >= minX && x + it.pw <= maxX && !blocked(x) && !(edge && it.ax > x - 12 && it.ax < x + it.pw + 12);
      const place = (right: boolean) => {
        const cx0 = colX(right);
        if (fits(cx0)) return { x: cx0 as number, gap: 99, column: true };
        // Narrow stages: an edge pill often spans its own dot. Keep it in the edge column and lift it
        // above the dot (gap < 0) instead of falling back to a pill on top of the anatomy.
        if (edge && cx0 !== null && cx0 >= minX && cx0 + it.pw <= maxX && !blocked(cx0)) return { x: cx0, gap: -1, column: true };
        let want = right ? it.ax + out : it.ax - out - it.pw;
        const x = Math.max(minX, Math.min(maxX - it.pw, want));
        const gap = x > it.ax ? x - it.ax : x + it.pw < it.ax ? it.ax - (x + it.pw) : -1;
        return { x, gap, column: false };
      };
      let pick = place(it.right);
      if (!pick.column) {
        const alt = place(!it.right);
        if (alt.column || alt.gap > pick.gap) { pick = alt; it.right = !it.right; }
      }
      it.x = pick.x;
      it.y = pick.gap < 0 ? it.ay - it.ph - 14 : it.ay - it.ph / 2;
    }

    // Vertical relaxation against other pills and obstacles, top to bottom, then bottom-up for overflow.
    const hit = (a: { x: number; y: number; w: number; h: number }, b: Rect) =>
      a.x < b.x + b.w + GAP && b.x < a.x + a.w + GAP && a.y < b.y + b.h + GAP && b.y < a.y + a.h + GAP;
    const box = (it: Item) => ({ x: it.x, y: it.y, w: it.pw, h: it.ph });
    const top = PAD, bottom = h - PAD;
    active.sort((a, b) => a.y - b.y);
    for (let i = 0; i < active.length; i++) {
      const it = active[i];
      it.y = Math.max(it.y, top);
      for (let pass = 0; pass < 6; pass++) {
        let moved = false;
        for (const o of obstacles) if (hit(box(it), o)) { it.y = o.y + o.h + GAP; moved = true; }
        for (let j = 0; j < i; j++) {
          const o = active[j];
          if (hit(box(it), { x: o.x, y: o.y, w: o.pw, h: o.ph })) { it.y = o.y + o.ph + GAP; moved = true; }
        }
        if (!moved) break;
      }
    }
    for (let i = active.length - 1; i >= 0; i--) {
      const it = active[i];
      if (it.y + it.ph > bottom) {
        it.y = bottom - it.ph;
        for (let pass = 0; pass < 6; pass++) {
          let moved = false;
          for (const o of obstacles) if (hit(box(it), o)) { it.y = o.y - it.ph - GAP; moved = true; }
          for (let j = i + 1; j < active.length; j++) {
            const o = active[j];
            if (hit(box(it), { x: o.x, y: o.y, w: o.pw, h: o.ph })) { it.y = o.y - it.ph - GAP; moved = true; }
          }
          if (!moved) break;
        }
      }
    }
    // Anything that still collides or left the stage is dropped rather than drawn on top of something.
    const placed: Item[] = [];
    for (const it of active) {
      const bad = it.y < top - 1 || it.y + it.ph > bottom + 1
        || obstacles.some((o) => hit(box(it), o))
        || placed.some((o) => hit(box(it), { x: o.x, y: o.y, w: o.pw, h: o.ph }));
      if (!bad) placed.push(it);
    }
    // Leaders must not cross UI cards / buttons, and dots must not sit under them. The selected label has priority.
    const crosses = (it: Item) => {
      const py = it.y + it.ph / 2;
      const ex = it.ax < it.x ? it.x : it.ax > it.x + it.pw ? it.x + it.pw : it.ax;
      for (const o of obstacles) {
        for (let k = 0; k <= 24; k++) {
          const t = k / 24, px = it.ax + (ex - it.ax) * t, qy = it.ay + (py - it.ay) * t;
          if (px > o.x - 2 && px < o.x + o.w + 2 && qy > o.y - 2 && qy < o.y + o.h + 2) return true;
        }
      }
      return false;
    };
    for (let i = placed.length - 1; i >= 0; i--) {
      const inp = wanted.find((x) => x.it === placed[i])!.inp;
      if (!f.selected.includes(inp.structure) && crosses(placed[i])) placed.splice(i, 1);
    }
    // A pill must never cover another label's dot (the selected one keeps priority).
    for (let i = placed.length - 1; i >= 0; i--) {
      const it = placed[i];
      if (f.selected.includes(wanted.find((x) => x.it === it)!.inp.structure)) continue;
      if (placed.some((o) => o !== it && o.ax > it.x - 8 && o.ax < it.x + it.pw + 8 && o.ay > it.y - 8 && o.ay < it.y + it.ph + 8)) placed.splice(i, 1);
    }
    const placedSet = new Set(placed);

    for (const it of Array.from(this.pool.values())) {
      const show = placedSet.has(it);
      if (show !== it.shown) { it.shown = show; it.root.classList.toggle("is-on", show); }
    }
    for (const it of placed) {
      const py = it.y + it.ph / 2;
      const ex = it.ax < it.x ? it.x : it.ax > it.x + it.pw ? it.x + it.pw : it.ax;
      const dx = ex - it.ax, dy = py - it.ay;
      const len = Math.hypot(dx, dy);
      it.dot.style.transform = `translate3d(${it.ax.toFixed(1)}px, ${it.ay.toFixed(1)}px, 0)`;
      it.line.style.width = `${len.toFixed(1)}px`;
      it.line.style.transform = `translate3d(${it.ax.toFixed(1)}px, ${it.ay.toFixed(1)}px, 0) rotate(${Math.atan2(dy, dx).toFixed(4)}rad)`;
      it.pill.style.transform = `translate3d(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px, 0)`;
    }
    void wantedSet;
  }
}
