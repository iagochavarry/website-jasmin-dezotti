import * as THREE from "three";
import type { LabelDef } from "@/lib/anatomy/types";

/** LabelDef plus an optional preferred column; wire `side` in the procedure data when an anchor reads better on one side. */
type LabelSpec = LabelDef & { side?: "left" | "right" };

export interface LabelFrame {
  camera: THREE.Camera;
  /** Stage size in CSS px. */
  width: number;
  height: number;
  /** Label ids listed by the current step. */
  stepLabels: string[];
  /** Master switch (tools button) and camera-flight flag: both fade everything out. */
  visible: boolean;
  flying: boolean;
  layerOn: Record<string, boolean>;
}

interface Item {
  spec: LabelSpec;
  root: HTMLDivElement;
  dot: HTMLSpanElement;
  line: HTMLSpanElement;
  pill: HTMLSpanElement;
  pw: number;
  ph: number;
  shown: boolean;
  // per-frame scratch
  ax: number;
  ay: number;
  right: boolean;
  x: number;
  y: number;
}

const PAD = 8;
const GAP = 6;

/**
 * 3D → 2D annotations: a dot on the anchor, a 1px leader line, and a pill pushed out into a
 * left/right column. Pills are relaxed vertically so they never overlap and are clamped inside
 * the stage, away from the tool buttons (top right) and the phone stage bar (bottom).
 */
export class LabelSystem {
  private items: Item[] = [];
  private v = new THREE.Vector3();
  private sizeKey = "";
  private active: Item[] = [];

  constructor(private layer: HTMLElement, labels: LabelDef[]) {
    for (const spec of labels as LabelSpec[]) {
      const root = document.createElement("div");
      root.className = "anat-label";
      root.innerHTML = `<span class="anat-label-line"></span><span class="anat-label-dot"></span><span class="anat-label-text"></span>`;
      const [line, dot, pill] = Array.from(root.children) as HTMLSpanElement[];
      pill.textContent = spec.text;
      layer.appendChild(root);
      this.items.push({ spec, root, dot, line, pill, pw: 0, ph: 0, shown: false, ax: 0, ay: 0, right: true, x: 0, y: 0 });
    }
  }

  dispose() { this.items.forEach((i) => i.root.remove()); this.items = []; }

  update(f: LabelFrame) {
    const { width: w, height: h } = f;
    if (!w || !h) return;
    const narrow = window.innerWidth <= 900;
    const phone = window.innerWidth <= 700;

    // Pill sizes only change with the stage / breakpoint: measure once, not per frame.
    const key = `${w}x${h}x${phone ? 2 : narrow ? 1 : 0}`;
    if (key !== this.sizeKey) {
      this.sizeKey = key;
      for (const it of this.items) { it.pw = it.pill.offsetWidth; it.ph = it.pill.offsetHeight; }
    }

    const active = this.active;
    active.length = 0;
    const ids = f.stepLabels;
    const cx = w / 2;
    for (const it of this.items) {
      const { spec } = it;
      const wanted = f.visible && !f.flying && ids.includes(spec.id) && (!spec.layer || f.layerOn[spec.layer]);
      let show = false;
      if (wanted) {
        this.v.set(...spec.anchor).project(f.camera);
        show = this.v.z < 1 && Math.abs(this.v.x) < 0.97 && Math.abs(this.v.y) < 0.97;
        if (show) {
          it.ax = (this.v.x * 0.5 + 0.5) * w;
          it.ay = (-this.v.y * 0.5 + 0.5) * h;
          it.right = spec.side ? spec.side === "right" : it.ax >= cx;
          active.push(it);
        }
      }
      if (show !== it.shown) { it.shown = show; it.root.classList.toggle("is-on", show); }
    }
    if (!active.length) return;

    // Keep-out zones: tool buttons (top right) and the phone stage bar (bottom).
    const toolsX = w - (phone ? 56 : 66), toolsY = phone ? 138 : 164;
    const top = PAD, bottom = h - PAD - (narrow ? 60 : 0);
    const out = phone ? 26 : 34;

    for (const it of active) {
      const { pw, ph } = it;
      const place = (right: boolean) => {
        const x = Math.max(PAD, Math.min(w - PAD - pw, right ? it.ax + out : it.ax - out - pw));
        // Horizontal clearance between the dot and the pill (negative = the pill covers the dot).
        const gap = x > it.ax ? x - it.ax : x + pw < it.ax ? it.ax - (x + pw) : -1;
        return { x, gap };
      };
      let pick = place(it.right);
      if (pick.gap < 14) {
        const alt = place(!it.right);
        if (alt.gap > pick.gap) { pick = alt; it.right = !it.right; }
      }
      it.x = pick.x;
      it.y = it.ay - ph / 2;
    }

    // Vertical relaxation: place top to bottom, pushing down past anything overlapping in x…
    active.sort((a, b) => a.y - b.y);
    const minY = (it: Item) => (it.x + it.pw > toolsX ? toolsY : top);
    for (let i = 0; i < active.length; i++) {
      const it = active[i];
      it.y = Math.max(it.y, minY(it));
      for (let j = 0; j < i; j++) {
        const o = active[j];
        if (it.x < o.x + o.pw + GAP && o.x < it.x + it.pw + GAP && it.y < o.y + o.ph + GAP) it.y = o.y + o.ph + GAP;
      }
    }
    // …then pull anything that overflowed the bottom back up.
    for (let i = active.length - 1; i >= 0; i--) {
      const it = active[i];
      it.y = Math.min(it.y, bottom - it.ph);
      for (let j = i + 1; j < active.length; j++) {
        const o = active[j];
        if (it.x < o.x + o.pw + GAP && o.x < it.x + it.pw + GAP && it.y + it.ph + GAP > o.y) it.y = o.y - it.ph - GAP;
      }
      it.y = Math.max(it.y, minY(it));
    }

    for (const it of active) {
      const py = it.y + it.ph / 2;
      // Leader runs from the dot to the nearest pill edge.
      const ex = it.ax < it.x ? it.x : it.ax > it.x + it.pw ? it.x + it.pw : it.ax;
      const dx = ex - it.ax, dy = py - it.ay;
      const len = Math.hypot(dx, dy);
      it.dot.style.transform = `translate3d(${it.ax.toFixed(1)}px, ${it.ay.toFixed(1)}px, 0)`;
      it.line.style.width = `${len.toFixed(1)}px`;
      it.line.style.transform = `translate3d(${it.ax.toFixed(1)}px, ${it.ay.toFixed(1)}px, 0) rotate(${Math.atan2(dy, dx).toFixed(4)}rad)`;
      it.pill.style.transform = `translate3d(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px, 0)`;
    }
  }
}
