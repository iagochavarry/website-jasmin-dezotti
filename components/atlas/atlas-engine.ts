// Three.js engine for the 3D anatomy explorer. Framework-agnostic: the React viewer pushes a declarative
// state (cut, slider offset, visible structures, selection…) and receives picks back.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as meshopt from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CUTS, STRUCTURES } from "@/lib/atlas/head";
import type { CutDef, Layer, StructureDef, Vec3 } from "@/lib/atlas/types";
import { AtlasLabels, type LabelInput, type Rect } from "./atlas-labels";

// The decoder's typings re-export "meshoptimizer/decoder", which `moduleResolution: node` cannot resolve.
const { MeshoptDecoder } = meshopt as unknown as { MeshoptDecoder: Parameters<GLTFLoader["setMeshoptDecoder"]>[0] };

export interface AtlasState {
  cut: string;
  offset: number;
  visible: Record<string, boolean>;
  /** Structure ids highlighted (one structure, or all members of a group). */
  selected: string[];
  isolate: boolean;
  labels: boolean;
}

export interface AtlasEngineOptions {
  container: HTMLElement;
  labelLayer: HTMLElement;
  modelUrl: string;
  onProgress?: (fraction: number) => void;
  /** Called with the ids of the structures that exist in the loaded model. */
  onReady?: (present: string[]) => void;
  onError?: (error: unknown) => void;
  onSelect?: (id: string | null) => void;
  /** A point label (e.g. a meatus) was tapped. */
  onPointLabel?: (key: string) => void;
  /** Passed to GLTFLoader (cache-busted URL is built by the caller). */
}

const KIND_LOOK: Record<StructureDef["material"], { roughness: number; clearcoat: number; sheen: number; emissive?: string }> = {
  skin: { roughness: 0.55, clearcoat: 0, sheen: 0.2 },
  bone: { roughness: 0.74, clearcoat: 0.05, sheen: 0 },
  tooth: { roughness: 0.4, clearcoat: 0.3, sheen: 0 },
  cartilage: { roughness: 0.32, clearcoat: 0.4, sheen: 0.3 },
  mucosa: { roughness: 0.42, clearcoat: 0.5, sheen: 0 },
  sinus: { roughness: 0.38, clearcoat: 0.35, sheen: 0.15 },
  eye: { roughness: 0.22, clearcoat: 0.8, sheen: 0 },
};
/** Ghost look per layer: base opacity and extra opacity at grazing angles (fresnel rim). */
const GHOST: Record<Layer, [number, number]> = { inner: [0.14, 0.5], bone: [0.1, 0.62], skin: [0.05, 0.5] };
const LAYER_ORDER: Record<Layer, number> = { inner: 10, bone: 20, skin: 30 };
const PICK_PRIORITY: Record<Layer, number> = { inner: 0, bone: 2, skin: 3 };
const FAR = 60;

const STRUCT = new Map(STRUCTURES.map((s) => [s.id, s]));
const damp = (cur: number, target: number, rate: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-rate * dt));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const srgb = (c: THREE.Color) => {
  const o = c.clone().convertLinearToSRGB();
  return new THREE.Vector3(o.r, o.g, o.b);
};
const layerOf = (s: StructureDef): Layer => (s.material === "skin" ? "skin" : s.material === "bone" || s.material === "tooth" ? "bone" : "inner");
const AXIS = { x: 0, y: 1, z: 2 } as const;

interface Part {
  node: string;
  struct: StructureDef;
  layer: Layer;
  side: "dir" | "esq" | null;
  mesh: THREE.Mesh;
  pre: THREE.Mesh;
  mat: THREE.MeshPhysicalMaterial;
  u: Record<"uCap" | "uHue" | "uAlpha" | "uGhost" | "uGhostA" | "uHL" | "uDim", THREE.IUniform>;
  hull?: THREE.Mesh;
  alpha: number;
  ghost: number;
  hl: number;
  dim: number;
  box: THREE.Box3;
  world?: { pos: Float32Array; index: Uint32Array | null };
}

export class AtlasEngine {
  private opts: AtlasEngineOptions;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private parts: Part[] = [];
  private bySid = new Map<string, Part[]>();
  private clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), FAR);
  private planeAxis: "x" | "y" | "z" | null = null;
  private planeKeep: "neg" | "pos" = "neg";
  private planeO = FAR;
  private planeTarget = FAR;
  private state: AtlasState = { cut: "inteiro", offset: 0, visible: {}, selected: [], isolate: false, labels: true };
  private stateSet = false;
  private flight: { t0: number; dur: number; from: THREE.Spherical; to: THREE.Spherical; fromT: THREE.Vector3; toT: THREE.Vector3 } | null = null;
  private labels: AtlasLabels;
  private labelItems: LabelInput[] = [];
  private labelDirty = true;
  private lastLabelCompute = 0;
  private insets = { left: 0, right: 0, top: 0, bottom: 0 };
  private keepOutEls: () => Rect[] = () => [];
  private raf = 0;
  private running = false;
  private wake = 0;
  private last = 0;
  private disposed = false;
  private ready = false;
  private onScreen = true;
  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;
  private pointerDown: { x: number; y: number; t: number } | null = null;
  private reduced = false;
  private mq: MediaQueryList | null = null;
  private center = new THREE.Vector3(0, 1, -3);
  private insetsSet = false;

  constructor(opts: AtlasEngineOptions) {
    this.opts = opts;
    const { container } = opts;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.localClippingEnabled = true;
    this.renderer.domElement.style.touchAction = "none";
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(28, 1, 2, 300);
    this.camera.position.set(-20, 8, 42);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.minDistance = 9;
    this.controls.maxDistance = 90;
    this.controls.rotateSpeed = 0.75;
    this.controls.zoomSpeed = 0.8;
    this.controls.screenSpacePanning = true;
    this.controls.target.copy(this.center);
    this.controls.minDistance = 6;
    this.controls.addEventListener("start", () => { this.flight = null; this.invalidate(); });
    this.controls.addEventListener("change", () => { this.clampTarget(); this.invalidate(); });
    this.controls.addEventListener("end", () => { this.labelDirty = true; this.invalidate(); });

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xfff1e2, 2.0);
    key.position.set(14, 20, 24);
    const fill = new THREE.DirectionalLight(0xe8eeff, 0.6);
    fill.position.set(-20, 4, 14);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 0.9);
    rim.position.set(-12, 12, -26);
    this.scene.add(key, fill, rim, new THREE.HemisphereLight(0xfff8ee, 0x2f332a, 0.35));

    this.mq = window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;
    this.reduced = !!this.mq?.matches;

    this.labels = new AtlasLabels(opts.labelLayer, (key) => this.opts.onPointLabel?.(key));
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.intersection = new IntersectionObserver(([e]) => { this.onScreen = e.isIntersecting; if (this.onScreen) this.invalidate(); });
    this.intersection.observe(container);
    document.addEventListener("visibilitychange", this.onVisibility);
    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointerup", this.onPointerUp);
    this.resize();
    this.load();
    if (process.env.NODE_ENV !== "production") (window as unknown as { __atlas: AtlasEngine }).__atlas = this;
  }

  // ── Public API ──

  /** Declarative state push; diffs against the previous one. */
  setState(next: AtlasState, opts: { instant?: boolean } = {}) {
    const prev = this.state;
    const first = !this.stateSet;
    this.state = next;
    this.stateSet = true;
    const cutChanged = first || prev.cut !== next.cut;
    const cut = this.cut();
    if (cutChanged) {
      const p = cut.plane;
      if (p) {
        if (this.planeAxis !== p.axis || this.planeKeep !== p.keep) {
          this.planeAxis = p.axis;
          this.planeKeep = p.keep;
          this.planeO = p.keep === "neg" ? FAR : -FAR;
        }
        this.planeTarget = next.offset;
      } else {
        this.planeTarget = this.planeKeep === "neg" ? FAR : -FAR;
        if (first) this.planeO = this.planeTarget;
      }
      this.flyTo(cut.camera, !!opts.instant || first);
    } else if (cut.plane) {
      this.planeTarget = next.offset;
    }
    if (opts.instant || first) {
      this.planeO = this.planeTarget;
      if (this.ready) this.snapParts();
    }
    this.labelDirty = true;
    this.invalidate();
  }

  /**
   * Free area of the stage: the model is framed inside it (insets = panel, label gutters, info card).
   * Changing it re-frames smoothly, keeping the current orbit direction.
   */
  setInsets(insets: Partial<{ left: number; right: number; top: number; bottom: number }>, keepOut?: () => Rect[]) {
    const next = { left: 0, right: 0, top: 0, bottom: 0, ...insets };
    const same = (Object.keys(next) as (keyof typeof next)[]).every((k) => Math.abs(next[k] - this.insets[k]) < 1);
    this.insets = next;
    if (keepOut) this.keepOutEls = keepOut;
    if (same && this.insetsSet) return;
    const first = !this.insetsSet;
    this.insetsSet = true;
    this.applyViewOffset();
    if (first) this.resize(); else this.refit(false);
  }

  /** Touch behaviour of the canvas: "pan-y" lets a vertical swipe scroll the page (phones), "none" gives the model every gesture. */
  setTouchAction(mode: "none" | "pan-y") {
    this.renderer.domElement.style.touchAction = mode;
  }

  resetView() { this.flyTo(this.cut().camera, false); this.invalidate(); }

  /** Re-frame the current cut inside the free area; the orbit direction (or the flight in progress) is kept. */
  private refit(instant: boolean) {
    if (!this.ready || !this.stateSet) return;
    const dir = this.flight
      ? new THREE.Vector3().setFromSpherical(this.flight.to).normalize()
      : this.camera.position.clone().sub(this.controls.target).normalize();
    const cam = this.cut().camera;
    this.flyTo({ ...cam, dir: [dir.x, dir.y, dir.z] }, instant);
    this.labelDirty = true;
    this.invalidate();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    const el = this.renderer.domElement;
    el.removeEventListener("pointerdown", this.onPointerDown);
    el.removeEventListener("pointerup", this.onPointerUp);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
    });
    this.scene.environment?.dispose();
    this.labels.dispose();
    this.renderer.dispose();
    el.remove();
    const w = window as unknown as { __atlas?: AtlasEngine };
    if (w.__atlas === this) delete w.__atlas;
  }

  /** Dev helper: where a structure's label would be anchored right now. */
  debugInfo() {
    return { planeO: this.planeO, parts: this.parts.length, labels: this.labelItems.map((l) => ({ key: l.key, a: l.anchor.toArray() })) };
  }

  // ── Loading ──

  private load() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      this.opts.modelUrl,
      (gltf) => {
        if (this.disposed) return;
        const meshes: THREE.Mesh[] = [];
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
        for (const mesh of meshes) this.addPart(mesh);
        this.scene.add(gltf.scene);
        this.ready = true;
        const extras = gltf.asset?.extras as { center?: Vec3 } | undefined;
        void extras;
        this.snapParts();
        this.opts.onReady?.(Array.from(this.bySid.keys()));
        this.labelDirty = true;
        this.invalidate();
      },
      (e) => { if (e.total) this.opts.onProgress?.(e.loaded / e.total); },
      (err) => this.opts.onError?.(err),
    );
  }

  private addPart(mesh: THREE.Mesh) {
    let name = mesh.name;
    let struct = STRUCTURES.find((s) => s.parts.some((p) => new RegExp(p).test(name)));
    if (!struct && mesh.parent?.name) { name = mesh.parent.name; struct = STRUCTURES.find((s) => s.parts.some((p) => new RegExp(p).test(name))); }
    if (!struct) { mesh.visible = false; return; }
    const look = KIND_LOOK[struct.material];
    const layer = layerOf(struct);
    const base = new THREE.Color(struct.color);
    const gray = new THREE.Color(base.getHex()).lerp(new THREE.Color("#8a8a84"), 0.3);
    const capColor = struct.cap ? new THREE.Color(struct.cap) : struct.material === "sinus" ? base.clone().multiplyScalar(0.8) : gray.multiplyScalar(0.78);
    const u = {
      uCap: { value: srgb(capColor) },
      uHue: { value: srgb(base) },
      uAlpha: { value: 0 },
      uGhost: { value: layer === "inner" ? 0 : 1 },
      uGhostA: { value: new THREE.Vector2(GHOST[layer][0], GHOST[layer][1]) },
      uHL: { value: 0 },
      uDim: { value: 0 },
    };
    const mat = new THREE.MeshPhysicalMaterial({
      color: base,
      roughness: look.roughness,
      metalness: 0,
      clearcoat: look.clearcoat,
      clearcoatRoughness: 0.35,
      sheen: look.sheen,
      sheenColor: new THREE.Color(0xeaf7ff),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      clippingPlanes: [this.clip],
      // Sinuses fill cavities whose walls are shared with the bone: win the depth test on the coincident surface.
      polygonOffset: struct.material === "sinus",
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -2,
    });
    patch(mat, u);
    mat.customProgramCacheKey = () => "atlas-v1";
    mesh.material = mat;
    mesh.renderOrder = LAYER_ORDER[layer] + 1;
    mesh.visible = false;

    // Depth pre-pass twin: writes only depth, offset slightly away, so the colour pass keeps just the NEAREST surface.
    const preMat = new THREE.MeshBasicMaterial({
      colorWrite: false, depthWrite: true, transparent: true, side: THREE.DoubleSide, clippingPlanes: [this.clip],
      polygonOffset: true, polygonOffsetFactor: 1.5, polygonOffsetUnits: 4,
    });
    const pre = new THREE.Mesh(mesh.geometry, preMat);
    pre.position.copy(mesh.position); pre.quaternion.copy(mesh.quaternion); pre.scale.copy(mesh.scale);
    pre.renderOrder = LAYER_ORDER[layer];
    pre.visible = false;
    pre.matrixAutoUpdate = mesh.matrixAutoUpdate;
    mesh.parent!.add(pre);

    const box = new THREE.Box3().setFromObject(mesh);
    const side = /_dir$/.test(name) ? "dir" : /_esq$/.test(name) ? "esq" : null;
    const part: Part = { node: name, struct, layer, side, mesh, pre, mat, u, alpha: 0, ghost: u.uGhost.value, hl: 0, dim: 0, box };
    this.parts.push(part);
    const list = this.bySid.get(struct.id) ?? [];
    list.push(part);
    this.bySid.set(struct.id, list);
  }

  // ── State → targets ──

  private cut(): CutDef { return CUTS.find((c) => c.id === this.state.cut) ?? CUTS[0]; }

  private target(p: Part) {
    const s = this.state;
    const sid = p.struct.id;
    const cutActive = !!this.cut().plane;
    const any = s.selected.some((id) => this.bySid.has(id));
    const isSel = s.selected.includes(sid);
    const iso = s.isolate && any;
    let ghost = p.layer === "skin" ? 1 : p.layer === "bone" ? (cutActive ? 0 : 1) : 0;
    if (iso) ghost = isSel ? 0 : 1;
    return {
      alpha: s.visible[sid] ? p.struct.opacity ?? 1 : 0,
      ghost,
      hl: isSel ? 1 : 0,
      dim: any && !isSel && !iso ? 1 : 0,
    };
  }

  private snapParts() {
    for (const p of this.parts) {
      const t = this.target(p);
      p.alpha = t.alpha; p.ghost = t.ghost; p.hl = t.hl; p.dim = t.dim;
      this.applyPart(p);
    }
    this.applyPlane();
  }

  private applyPart(p: Part) {
    p.u.uAlpha.value = p.alpha;
    p.u.uGhost.value = p.ghost;
    p.u.uHL.value = p.hl;
    p.u.uDim.value = p.dim;
    const shown = p.alpha > 0.01;
    if (p.hl > 0.02 && !p.hull) p.hull = this.makeHull(p);
    if (p.hull) {
      p.hull.visible = shown && p.hl > 0.02;
      (p.hull.material as THREE.MeshBasicMaterial).opacity = Math.min(1, p.hl * p.alpha) * 0.95;
    }
    const solid = p.alpha > 0.985 && p.ghost < 0.02;
    p.mesh.visible = shown;
    p.pre.visible = shown && !solid;
    p.mat.depthWrite = solid;
  }

  /** Crisp outline in the part's hue: an inflated back-face copy that only shows around the silhouette. */
  private makeHull(p: Part) {
    const col = new THREE.Color(p.struct.color).lerp(new THREE.Color("#ffffff"), 0.12);
    const mat = new THREE.MeshBasicMaterial({
      color: col, side: THREE.BackSide, transparent: true, depthWrite: false, toneMapped: false, clippingPlanes: [this.clip],
    });
    p.mesh.updateWorldMatrix(true, false);
    const uW = { value: 0.075 / (p.mesh.matrixWorld.getMaxScaleOnAxis() || 1) };
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uW = uW;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uW;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\n  transformed += normalize(normal) * uW;");
    };
    mat.customProgramCacheKey = () => "atlas-hull-v1";
    const hull = new THREE.Mesh(p.mesh.geometry, mat);
    hull.position.copy(p.mesh.position); hull.quaternion.copy(p.mesh.quaternion); hull.scale.copy(p.mesh.scale);
    hull.renderOrder = LAYER_ORDER[p.layer] + 2;
    hull.frustumCulled = false;
    hull.visible = false;
    p.mesh.parent!.add(hull);
    return hull;
  }

  private applyPlane() {
    if (!this.planeAxis) { this.clip.normal.set(-1, 0, 0); this.clip.constant = FAR; return; }
    const e = new THREE.Vector3();
    e.setComponent(AXIS[this.planeAxis], 1);
    if (this.planeKeep === "neg") { this.clip.normal.copy(e).negate(); this.clip.constant = this.planeO; }
    else { this.clip.normal.copy(e); this.clip.constant = -this.planeO; }
  }

  // ── Frame ──

  /** Returns true while something is still animating. */
  private update(dt: number, now: number): boolean {
    let busy = false;
    const k = this.reduced ? 60 : 1;
    for (const p of this.parts) {
      const t = this.target(p);
      const a = damp(p.alpha, t.alpha, 7 * k, dt), g = damp(p.ghost, t.ghost, 4.5 * k, dt);
      const h = damp(p.hl, t.hl, 8 * k, dt), d = damp(p.dim, t.dim, 8 * k, dt);
      const moving = Math.abs(a - t.alpha) > 0.002 || Math.abs(g - t.ghost) > 0.002 || Math.abs(h - t.hl) > 0.002 || Math.abs(d - t.dim) > 0.002;
      p.alpha = moving ? a : t.alpha; p.ghost = moving ? g : t.ghost; p.hl = moving ? h : t.hl; p.dim = moving ? d : t.dim;
      busy ||= moving;
      this.applyPart(p);
    }
    const po = damp(this.planeO, this.planeTarget, 4.2 * k, dt);
    if (Math.abs(po - this.planeTarget) > 0.004) { this.planeO = po; busy = true; this.labelDirty = true; } else if (this.planeO !== this.planeTarget) { this.planeO = this.planeTarget; this.labelDirty = true; }
    this.applyPlane();

    if (this.flight) {
      const f = this.flight;
      const t = f.dur <= 0 ? 1 : Math.min(1, (now - f.t0) / f.dur);
      const e = ease(t);
      const sph = new THREE.Spherical(
        THREE.MathUtils.lerp(f.from.radius, f.to.radius, e),
        THREE.MathUtils.lerp(f.from.phi, f.to.phi, e),
        f.from.theta + shortest(f.to.theta - f.from.theta) * e,
      );
      const tgt = f.fromT.clone().lerp(f.toT, e);
      this.camera.position.setFromSpherical(sph).add(tgt);
      this.controls.target.copy(tgt);
      if (t >= 1) this.flight = null;
      busy = true;
    }
    this.controls.update();
    if (this.labelDirty && (now - this.lastLabelCompute > 90 || !busy)) this.computeLabels(now);
    else if (this.labelDirty) busy = true;
    return busy;
  }

  private frame = (now: number) => {
    this.raf = 0;
    if (this.disposed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    const busy = this.update(dt, now);
    this.camera.updateMatrixWorld();
    this.renderer.render(this.scene, this.camera);
    this.labels.update({
      camera: this.camera,
      width: this.opts.container.clientWidth,
      height: this.opts.container.clientHeight,
      items: this.labelItems,
      enabled: this.state.labels,
      selected: this.state.selected,
      flying: !!this.flight,
      keepOut: this.keepOutEls(),
      model: this.modelRect(),
      phone: window.innerWidth < 700,
      narrow: window.innerWidth < 900,
    });
    if (busy) this.wake = 4; else this.wake--;
    if (this.wake > 0 && this.canRun()) this.raf = requestAnimationFrame(this.frame);
    else this.running = false;
  };

  /** Screen-space bounds (CSS px) of the visible bones / inner structures: label columns sit outside it. */
  private modelRect(): Rect | null {
    const w = this.opts.container.clientWidth, h = this.opts.container.clientHeight;
    const [lo, hi] = this.focusBox(this.cut().camera);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const v = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? hi[0] : lo[0], i & 2 ? hi[1] : lo[1], i & 4 ? hi[2] : lo[2]).project(this.camera);
      const sx = (v.x * 0.5 + 0.5) * w, sy = (-v.y * 0.5 + 0.5) * h;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    return x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
  }

  private canRun() { return !this.disposed && this.onScreen && document.visibilityState === "visible"; }
  private onVisibility = () => { if (document.visibilityState === "visible") this.invalidate(); };

  /** Request a (few) more frames. The loop stops itself when nothing changes. */
  invalidate() {
    this.wake = Math.max(this.wake, 4);
    if (!this.running && this.canRun() && this.ready) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  // ── Camera ──

  /** Camera pose that frames `cam.focus` so it fills `cam.fill` of the free area of the stage (not under the panel). */
  /** Focus box in use: the face-only one when the free area is portrait. */
  private focusBox(cam: CutDef["camera"]): [Vec3, Vec3] {
    const w = this.opts.container.clientWidth - this.insets.left - this.insets.right;
    const h = this.opts.container.clientHeight - this.insets.top - this.insets.bottom;
    return cam.portraitFocus && w / Math.max(1, h) < 1.1 ? cam.portraitFocus : cam.focus;
  }

  private pose(cam: CutDef["camera"]) {
    const fb = this.focusBox(cam);
    const box = new THREE.Box3(new THREE.Vector3(...fb[0]), new THREE.Vector3(...fb[1]));
    const target = box.getCenter(new THREE.Vector3());
    const dir = new THREE.Vector3(...cam.dir).normalize();
    const w = Math.max(1, this.opts.container.clientWidth - this.insets.left - this.insets.right);
    const h = Math.max(1, this.opts.container.clientHeight - this.insets.top - this.insets.bottom);
    const fill = cam.fill ?? 0.8;
    const tmp = new THREE.PerspectiveCamera(this.camera.fov, w / h, 2, 300);
    if (cam.up) tmp.up.set(...cam.up);
    const corners = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
    const v = new THREE.Vector3();
    const extent = (d: number) => {
      tmp.position.copy(target).addScaledVector(dir, d);
      tmp.lookAt(target);
      tmp.updateMatrixWorld();
      tmp.updateProjectionMatrix();
      let m = 0;
      for (const c of corners) { v.copy(c).project(tmp); m = Math.max(m, Math.abs(v.x), Math.abs(v.y)); }
      return m;
    };
    let lo = 6, hi = 220;
    for (let i = 0; i < 28; i++) { const mid = (lo + hi) / 2; if (extent(mid) > fill) lo = mid; else hi = mid; }
    return { target, position: target.clone().addScaledVector(dir, hi) };
  }

  /** Screen-up of the orbit camera (OrbitControls caches it at construction, so refresh its frame by hand). */
  private setUp(up: Vec3) {
    const u = new THREE.Vector3(...up);
    if (this.camera.up.distanceTo(u) < 1e-6) return false;
    this.camera.up.copy(u);
    const c = this.controls as unknown as { _quat: THREE.Quaternion; _quatInverse: THREE.Quaternion };
    c._quat.setFromUnitVectors(u, new THREE.Vector3(0, 1, 0));
    c._quatInverse.copy(c._quat).invert();
    return true;
  }

  private flyTo(cam: CutDef["camera"], instant: boolean) {
    if (this.setUp(cam.up ?? [0, 1, 0])) { instant = true; this.flight = null; }
    const { target, position } = this.pose(cam);
    const toS = new THREE.Spherical().setFromVector3(position.clone().sub(target));
    if (instant || this.reduced) {
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      this.flight = null;
      return;
    }
    const fromT = this.controls.target.clone();
    const fromS = new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(fromT));
    this.flight = { t0: performance.now(), dur: 850, from: fromS, to: toS, fromT, toT: target };
  }

  private clampTarget() {
    const t = this.controls.target;
    const d = t.distanceTo(this.center);
    if (d > 12) {
      const shift = t.clone().sub(this.center).multiplyScalar(12 / d).add(this.center).sub(t);
      t.add(shift);
      this.camera.position.add(shift);
    }
  }

  private applyViewOffset() {
    const { clientWidth: w, clientHeight: h } = this.opts.container;
    if (!w || !h) return;
    const sx = (this.insets.left - this.insets.right) / 2, sy = (this.insets.top - this.insets.bottom) / 2;
    if (sx || sy) this.camera.setViewOffset(w, h, -sx, -sy, w, h); else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.opts.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.applyViewOffset();
    this.refit(true);
    this.labelDirty = true;
    this.invalidate();
    if (!this.running && this.ready) { this.camera.updateMatrixWorld(); this.renderer.render(this.scene, this.camera); }
  }

  // ── Picking ──

  private onPointerDown = (e: PointerEvent) => { this.pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() }; };

  private onPointerUp = (e: PointerEvent) => {
    const d = this.pointerDown;
    this.pointerDown = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || performance.now() - d.t > 500) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.opts.onSelect?.(this.pick(e.clientX - rect.left, e.clientY - rect.top, rect));
  };

  /** Structure under a point (CSS px in the canvas), ignoring the clipped-away half. */
  pick(x: number, y: number, rect = this.renderer.domElement.getBoundingClientRect()): string | null {
    this.camera.updateMatrixWorld();
    const ndc = new THREE.Vector2((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const iso = this.state.isolate && this.state.selected.length > 0;
    // While isolating, the ghosted context is not pickable.
    const cand = this.parts.filter((p) => p.mesh.visible && p.alpha > 0.4 && (!iso || this.state.selected.includes(p.struct.id)));
    const hits = ray.intersectObjects(cand.map((p) => p.mesh), false)
      .filter((h) => this.clip.distanceToPoint(h.point) >= -1e-4)
      .map((h) => ({ h, p: cand.find((c) => c.mesh === h.object)! }));
    if (!hits.length) return null;
    // Solid parts win over ghosts; among solids the nearest wins (sinus > bone on a shared wall).
    const solid = hits.filter(({ p }) => p.ghost < 0.5);
    const pool = solid.length ? solid : hits.filter(({ p }) => p.layer !== "skin").length ? hits.filter(({ p }) => p.layer !== "skin") : hits;
    pool.sort((a, b) => a.h.distance - b.h.distance);
    const near = pool[0].h.distance;
    const tie = pool.filter(({ h }) => h.distance - near < 0.04).sort((a, b) => PICK_PRIORITY[a.p.layer] - PICK_PRIORITY[b.p.layer]);
    return tie[0].p.struct.id;
  }

  // ── Labels ──

  private computeLabels(now: number) {
    this.labelDirty = false;
    this.lastLabelCompute = now;
    const s = this.state;
    const cut = this.cut();
    const items: LabelInput[] = [];
    const seen = new Set<string>();
    const add = (sid: string, side: "dir" | "esq" | undefined, text: string | undefined, column?: "left" | "right") => {
      const struct = STRUCT.get(sid);
      const parts = (this.bySid.get(sid) ?? []).filter((p) => !side || p.side === side || p.side === null);
      if (!struct || !parts.length || !s.visible[sid]) return;
      const key = `${sid}:${side ?? ""}`;
      if (seen.has(key)) return;
      const anchor = this.anchorFor(parts, cut);
      if (!anchor) return;
      seen.add(key);
      items.push({ key, structure: sid, text: text ?? struct.name, color: struct.color, anchor, column });
    };
    // The selected structure always gets a label (first, so it wins when space is scarce).
    for (const sid of s.selected) {
      const curated = cut.labels.find((l) => l.structure === sid);
      add(sid, curated?.side, curated?.text, curated?.column);
    }
    const phone = window.innerWidth < 700;
    for (const l of cut.labels) {
      if (phone && l.desktopOnly && !s.selected.includes(l.structure)) continue;
      if (l.point) {
        const pl = cut.plane;
        if (s.selected.length && !s.selected.includes(l.structure)) continue;
        if (pl && ((pl.keep === "neg" && l.point[AXIS[pl.axis]] > this.planeO) || (pl.keep === "pos" && l.point[AXIS[pl.axis]] < this.planeO))) continue;
        items.push({ key: `pt:${l.structure}`, structure: l.structure, text: l.text ?? l.structure, color: "#FFFFFF", anchor: new THREE.Vector3(...l.point), column: l.column, clickable: true });
        continue;
      }
      if (s.isolate && s.selected.length && !s.selected.includes(l.structure)) continue;
      add(l.structure, l.side, l.text, l.column);
    }
    this.labelItems = items;
  }

  private anchorFor(parts: Part[], cut: CutDef): THREE.Vector3 | null {
    const plane = cut.plane;
    if (plane && this.planeAxis) {
      const ax = AXIS[plane.axis];
      const sec = sectionAnchor(parts.map((p) => this.worldOf(p)), ax, this.planeO);
      if (sec) return sec;
      // Off the plane: only kept when the structure lies wholly on the kept side, anchored on the face looking at the cut.
      const kept = parts.filter((p) => (this.planeKeep === "neg" ? p.box.max.getComponent(ax) <= this.planeO : p.box.min.getComponent(ax) >= this.planeO));
      if (!kept.length) return null;
      const box = new THREE.Box3();
      kept.forEach((p) => box.union(p.box));
      const c = box.getCenter(new THREE.Vector3());
      c.setComponent(ax, this.planeKeep === "neg" ? box.max.getComponent(ax) : box.min.getComponent(ax));
      return this.occluded(c, kept) ? null : c;
    }
    const box = new THREE.Box3();
    parts.forEach((p) => box.union(p.box));
    return box.getCenter(new THREE.Vector3());
  }

  /** True when a solid part of ANOTHER structure sits between the camera and the point (anchor would point at the wrong thing). */
  private occluded(point: THREE.Vector3, own: Part[]) {
    this.camera.updateMatrixWorld();
    const origin = this.camera.position.clone();
    const dir = point.clone().sub(origin);
    const dist = dir.length();
    const ray = new THREE.Raycaster(origin, dir.normalize(), 0, Math.max(0, dist - 0.25));
    const ownSet = new Set(own.map((p) => p.mesh));
    const cand = this.parts.filter((p) => p.mesh.visible && p.alpha > 0.5 && p.ghost < 0.5 && !ownSet.has(p.mesh));
    return ray.intersectObjects(cand.map((p) => p.mesh), false).some((h) => this.clip.distanceToPoint(h.point) >= -1e-4);
  }

  private worldOf(p: Part) {
    if (p.world) return p.world;
    p.mesh.updateWorldMatrix(true, false);
    const g = p.mesh.geometry;
    const pos = g.getAttribute("position");
    const out = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(p.mesh.matrixWorld);
      out[i * 3] = v.x; out[i * 3 + 1] = v.y; out[i * 3 + 2] = v.z;
    }
    const idx = g.getIndex();
    p.world = { pos: out, index: idx ? (Uint32Array.from(idx.array as ArrayLike<number>)) : null };
    return p.world;
  }
}

const shortest = (d: number) => { while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

/**
 * Anchor on the cross-section of some meshes with the plane axis = off: the "deepest" interior point of the
 * section polygons (far from the outline, close to the centroid). Falls back to the outline point nearest the
 * centroid for sections thinner than the search grid (septum).
 */
function sectionAnchor(geoms: { pos: Float32Array; index: Uint32Array | null }[], ax: number, off: number): THREE.Vector3 | null {
  const u = (ax + 1) % 3, v = (ax + 2) % 3;
  const segs: number[] = [];
  const pt = [0, 0, 0, 0, 0, 0];
  for (const { pos, index } of geoms) {
    const n = index ? index.length : pos.length / 9 * 3;
    for (let t = 0; t < n; t += 3) {
      const i0 = index ? index[t] : t, i1 = index ? index[t + 1] : t + 1, i2 = index ? index[t + 2] : t + 2;
      const d0 = pos[i0 * 3 + ax] - off, d1 = pos[i1 * 3 + ax] - off, d2 = pos[i2 * 3 + ax] - off;
      if ((d0 > 0 && d1 > 0 && d2 > 0) || (d0 <= 0 && d1 <= 0 && d2 <= 0)) continue;
      let k = 0;
      const edge = (ia: number, da: number, ib: number, db: number) => {
        if ((da > 0) === (db > 0)) return;
        const f = da / (da - db);
        pt[k * 2] = pos[ia * 3 + u] + (pos[ib * 3 + u] - pos[ia * 3 + u]) * f;
        pt[k * 2 + 1] = pos[ia * 3 + v] + (pos[ib * 3 + v] - pos[ia * 3 + v]) * f;
        k++;
      };
      edge(i0, d0, i1, d1); edge(i1, d1, i2, d2); edge(i2, d2, i0, d0);
      if (k === 2) segs.push(pt[0], pt[1], pt[2], pt[3]);
    }
  }
  const n = segs.length / 4;
  if (n < 3) return null;
  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity, cu = 0, cv = 0, wsum = 0;
  for (let i = 0; i < n; i++) {
    const [a, b, c, d] = [segs[i * 4], segs[i * 4 + 1], segs[i * 4 + 2], segs[i * 4 + 3]];
    minU = Math.min(minU, a, c); maxU = Math.max(maxU, a, c); minV = Math.min(minV, b, d); maxV = Math.max(maxV, b, d);
    const len = Math.hypot(c - a, d - b);
    cu += (a + c) / 2 * len; cv += (b + d) / 2 * len; wsum += len;
  }
  if (wsum <= 0) return null;
  cu /= wsum; cv /= wsum;
  const stride = Math.max(1, Math.floor(n / 500));
  const G = 28;
  let best = -Infinity, bu = 0, bv = 0;
  for (let gy = 0; gy < G; gy++) {
    const py = minV + ((gy + 0.5) / G) * (maxV - minV);
    for (let gx = 0; gx < G; gx++) {
      const px = minU + ((gx + 0.5) / G) * (maxU - minU);
      let inside = false;
      for (let i = 0; i < n; i++) {
        const x1 = segs[i * 4], y1 = segs[i * 4 + 1], x2 = segs[i * 4 + 2], y2 = segs[i * 4 + 3];
        if ((y1 > py) !== (y2 > py) && x1 + ((py - y1) * (x2 - x1)) / (y2 - y1) > px) inside = !inside;
      }
      if (!inside) continue;
      let dmin = Infinity;
      for (let i = 0; i < n; i += stride) {
        const x1 = segs[i * 4], y1 = segs[i * 4 + 1], x2 = segs[i * 4 + 2], y2 = segs[i * 4 + 3];
        const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
        const tt = l2 > 0 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2)) : 0;
        const d = Math.hypot(px - (x1 + tt * dx), py - (y1 + tt * dy));
        if (d < dmin) dmin = d;
      }
      const score = dmin - 0.25 * Math.hypot(px - cu, py - cv);
      if (score > best) { best = score; bu = px; bv = py; }
    }
  }
  if (best === -Infinity) {
    let bd = Infinity;
    for (let i = 0; i < n; i++) {
      const mu = (segs[i * 4] + segs[i * 4 + 2]) / 2, mv = (segs[i * 4 + 1] + segs[i * 4 + 3]) / 2;
      const d = Math.hypot(mu - cu, mv - cv);
      if (d < bd) { bd = d; bu = mu; bv = mv; }
    }
  }
  const out = new THREE.Vector3();
  out.setComponent(ax, off); out.setComponent(u, bu); out.setComponent(v, bv);
  return out;
}

// ── Shader patch ──

function patch(material: THREE.MeshPhysicalMaterial, u: Part["u"]) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uCap;\nuniform vec3 uHue;\nuniform float uAlpha;\nuniform float uGhost;\nuniform vec2 uGhostA;\nuniform float uHL;\nuniform float uDim;")
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
  {
    vec3 col = gl_FragColor.rgb;
    float lum = dot(col, vec3(0.3, 0.59, 0.11));
    float a;
    if (!gl_FrontFacing) {
      // Cut face: flat, slightly darker and calmer tissue colour with a faint hint of the lighting.
      col = uCap * clamp(0.82 + 0.45 * lum, 0.76, 1.06);
      col = mix(col, uHue, 0.22 * uHL);
      a = mix(1.0, 0.07, uGhost);
    } else {
      float f = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition)));
      float rim = pow(f, 2.2);
      float ga = clamp(uGhostA.x + uGhostA.y * rim + uHL * 0.25, 0.0, 0.85);
      a = mix(1.0, ga, uGhost);
      col += vec3(0.86, 0.92, 1.0) * rim * uGhost * 0.4;
      // Selection: a soft rim in the part's own hue; the body colour is left alone.
      col += uHue * pow(f, 3.0) * uHL * 0.55;
    }
    col = mix(col, vec3(lum), uDim * 0.6) * (1.0 - 0.42 * uDim);
    gl_FragColor = vec4(col, a * uAlpha * (1.0 - 0.45 * uDim * uGhost));
  }`,
      );
  };
}
