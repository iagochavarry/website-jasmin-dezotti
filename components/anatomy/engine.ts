// Three.js engine for step-by-step anatomy / surgery walkthroughs.
// Framework-agnostic: the React viewer drives it through a small API.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as meshopt from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { LabelSystem } from "./labels";
import type { MaterialKind, PartDef, ProcedureDef, StepDef, Vec3 } from "@/lib/anatomy/types";

// The decoder's typings re-export "meshoptimizer/decoder", which this project's
// `moduleResolution: node` cannot resolve; the runtime export is fine.
const { MeshoptDecoder } = meshopt as unknown as { MeshoptDecoder: Parameters<GLTFLoader["setMeshoptDecoder"]>[0] };

export interface PickInfo {
  name: string;
  description: string;
}

export interface EngineOptions {
  container: HTMLElement;
  labelLayer: HTMLElement;
  procedure: ProcedureDef;
  onProgress?: (fraction: number) => void;
  onReady?: () => void;
  onError?: (error: unknown) => void;
  onPick?: (info: PickInfo | null) => void;
  onLayersChange?: (layers: Record<string, boolean>) => void;
}

// Colours are sRGB. `cap` is the flat colour of a cut surface (back faces).
const LOOK: Record<MaterialKind, { color: string; cap: string; roughness: number; clearcoat?: number; sheen?: number; emissive?: string }> = {
  skin: { color: "#E7B292", cap: "#B98A74", roughness: 0.55 },
  bone: { color: "#EADCBE", cap: "#B3AA98", roughness: 0.74, clearcoat: 0.06 },
  cartilage: { color: "#C5DCDC", cap: "#8FADB3", roughness: 0.3, clearcoat: 0.45, sheen: 0.3 },
  mucosa: { color: "#D58A86", cap: "#A06B6C", roughness: 0.42, clearcoat: 0.5 },
  incision: { color: "#B3131E", cap: "#7A0C14", roughness: 0.4, emissive: "#6A0A10" },
  silicone: { color: "#D6EEF5", cap: "#A9D4E2", roughness: 0.18, clearcoat: 1 },
  suture: { color: "#5C3F92", cap: "#3F2A66", roughness: 0.4 },
  air: { color: "#7CC4F2", cap: "#5E9FCB", roughness: 0.9, emissive: "#2B73A6" },
};
const HIGHLIGHT = new THREE.Color("#FFD2A8");
const PICK = new THREE.Color("#FFFFFF");
const AMBER = new THREE.Color("#E7A23C");
const SKIN_FALLBACK = 0.35;

interface Part {
  name: string;
  def: PartDef;
  mesh: THREE.Mesh;
  pivot: THREE.Group;
  material: THREE.MeshPhysicalMaterial;
  opacity: number;
  highlight: number;
  center: THREE.Vector3;
  base: THREE.Color;
  out: number;
  scale: number;
}

const damp = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Raw sRGB components, for values written after tone mapping (cut caps). */
const srgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const scratch = new THREE.Color();

export class AnatomyEngine {
  private opts: EngineOptions;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private parts: Part[] = [];
  private sagittal = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 100);
  private coronal = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);
  private coronalBack = new THREE.Plane(new THREE.Vector3(0, 0, 1), 100);
  private stepIndex = 0;
  private stepMatch: { opacity: [RegExp, number][]; highlight: RegExp[] } = { opacity: [], highlight: [] };
  private layerOn: Record<string, boolean> = {};
  private morph: Record<string, number> = {};
  private camGoal: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private labelsVisible = true;
  private labels: LabelSystem;
  private airflow: Airflow | null = null;
  private picked: Part | null = null;
  private timer = new THREE.Timer();
  private raf = 0;
  private running = false;
  private disposed = false;
  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;
  private onScreen = true;
  private pointerDown: { x: number; y: number; t: number } | null = null;

  constructor(opts: EngineOptions) {
    this.opts = opts;
    const { container } = opts;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.localClippingEnabled = true;
    this.renderer.domElement.style.touchAction = "none";
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 40;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.8;
    this.controls.screenSpacePanning = true;
    this.controls.addEventListener("start", () => { this.camGoal = null; });

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.4;
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xfff1e2, 2.1);
    key.position.set(7, 10, 9);
    const fill = new THREE.DirectionalLight(0xe8eeff, 0.55);
    fill.position.set(-9, 2, 6);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 0.9);
    rim.position.set(-6, 5, -12);
    this.scene.add(key, fill, rim, new THREE.HemisphereLight(0xfff8ee, 0x2f332a, 0.35));

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.intersection = new IntersectionObserver(([e]) => { this.onScreen = e.isIntersecting; this.updateRunning(); });
    this.intersection.observe(container);
    document.addEventListener("visibilitychange", this.updateRunning);

    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", this.handlePointerDown);
    el.addEventListener("pointerup", this.handlePointerUp);

    this.labels = new LabelSystem(opts.labelLayer, opts.procedure.labels);
    this.resize();
    this.load();
    if (process.env.NODE_ENV !== "production") (window as unknown as { __anatomy: AnatomyEngine }).__anatomy = this;
  }

  // ── Public API ──

  get steps(): StepDef[] { return this.opts.procedure.steps; }

  setStep(index: number, { instant = false } = {}) {
    this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, index));
    const step = this.steps[this.stepIndex];
    this.stepMatch = {
      opacity: Object.entries(step.partOpacity ?? {}).map(([re, v]) => [new RegExp(re), v]),
      highlight: (step.highlight ?? []).map((re) => new RegExp(re)),
    };
    for (const layer of this.opts.procedure.layers) this.layerOn[layer.id] = (step.layers[layer.id] ?? 0) > 0;
    this.opts.onLayersChange?.({ ...this.layerOn });
    this.flyTo({ ...step.camera, portraitZoom: step.portraitZoom }, instant);
    this.setPicked(null);
    if (instant) this.update(10);
  }

  setLayer(id: string, on: boolean) {
    this.layerOn[id] = on;
    this.opts.onLayersChange?.({ ...this.layerOn });
  }

  setLabelsVisible(on: boolean) { this.labelsVisible = on; }

  resetView() { this.flyTo({ ...this.steps[this.stepIndex].camera, portraitZoom: this.steps[this.stepIndex].portraitZoom }, false); }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    document.removeEventListener("visibilitychange", this.updateRunning);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
    });
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labels.dispose();
  }

  // ── Loading ──

  private load() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      this.opts.procedure.model,
      (gltf) => {
        if (this.disposed) return;
        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
        gltf.scene.updateMatrixWorld(true);
        for (const mesh of meshes) this.addPart(mesh);
        this.scene.add(gltf.scene);
        this.airflow = new Airflow(this.opts.procedure, [this.coronal, this.coronalBack]);
        this.scene.add(this.airflow.points);
        this.setStep(this.stepIndex, { instant: true });
        this.opts.onReady?.();
        this.updateRunning();
      },
      (e) => { if (e.total) this.opts.onProgress?.(e.loaded / e.total); },
      (err) => this.opts.onError?.(err),
    );
  }

  private addPart(mesh: THREE.Mesh) {
    const def = this.opts.procedure.parts.find((p) => p.match.test(mesh.name));
    if (!def) { mesh.visible = false; return; }
    const look = LOOK[def.material];
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(look.color),
      roughness: look.roughness,
      metalness: 0,
      clearcoat: look.clearcoat ?? 0,
      clearcoatRoughness: 0.35,
      sheen: look.sheen ?? 0,
      sheenColor: new THREE.Color(0xeaf7ff),
      emissive: new THREE.Color(look.emissive ?? "#000000"),
      side: def.material === "skin" ? THREE.FrontSide : THREE.DoubleSide,
      clippingPlanes: def.sagittalCut ? [this.sagittal, this.coronal, this.coronalBack] : [this.coronal, this.coronalBack],
    });
    let cap = srgb(look.cap);
    if (def.tint) {
      material.color.set(def.tint);
      const c = srgb(def.tint);
      const l = c.x * 0.3 + c.y * 0.59 + c.z * 0.11;
      cap = c.clone().lerp(new THREE.Vector3(l, l, l), 0.35).multiplyScalar(0.74);
    }
    material.userData.uHL = { value: 0 };
    if (def.material === "skin") patchSkin(material);
    else patchCap(material, cap);
    mesh.material = material;
    mesh.renderOrder = def.material === "skin" ? 10 : def.material === "silicone" ? 5 : def.material === "air" ? 3 : 0;

    // Pivot group so piece animations don't fight the (quantised) node transform.
    const pivot = new THREE.Group();
    mesh.parent!.add(pivot);
    pivot.add(mesh);
    const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
    this.parts.push({ name: mesh.name, def, mesh, pivot, material, opacity: 0, highlight: 0, center, base: material.color.clone(), out: 0, scale: 1 });
  }

  // ── Per-frame update ──

  private update(dt: number) {
    const step = this.steps[this.stepIndex];
    const t = this.timer.getElapsed();

    // Morphs
    const morphGoal = step.morphs ?? {};
    for (const name of Array.from(new Set(Object.keys(this.morph).concat(Object.keys(morphGoal))))) {
      this.morph[name] = damp(this.morph[name] ?? 0, morphGoal[name] ?? 0, 2.4, dt);
    }

    // Cuts (animated sweep)
    this.sagittal.constant = damp(this.sagittal.constant, step.cut?.sagittal ?? 12, 3, dt);
    this.coronal.constant = damp(this.coronal.constant, step.cut?.coronal ?? 12, 3, dt);
    this.coronalBack.constant = damp(this.coronalBack.constant, step.cut?.coronalBack !== undefined ? -step.cut.coronalBack : 12, 3, dt);

    for (const part of this.parts) {
      const layerGoal = step.layers[part.def.layer] ?? 0;
      let goal = this.layerOn[part.def.layer] ? (layerGoal > 0 ? layerGoal : part.def.material === "skin" ? SKIN_FALLBACK : 1) : 0;
      let explicit: number | undefined;
      for (const [re, v] of this.stepMatch.opacity) if (re.test(part.name)) explicit = v;
      if (explicit !== undefined) goal *= explicit;
      else if (part.def.optional) goal = 0;

      // Removable pieces
      const piece = step.pieces?.[part.name];
      part.out = damp(part.out, piece?.out ?? 0, 1.5, dt);
      part.scale = damp(part.scale, piece?.scale ?? 1, 2, dt);
      goal *= 1 - smooth(Math.min(1, Math.max(0, (part.out - 0.45) / 0.35)));
      part.opacity = damp(part.opacity, goal, 5, dt);

      const hl = this.stepMatch.highlight.some((re) => re.test(part.name)) ? 1 : 0;
      part.highlight = damp(part.highlight, hl, 4, dt);

      this.applyPart(part, t);
    }

    const obstruction = this.opts.procedure.obstructionMorph ? this.morph[this.opts.procedure.obstructionMorph] ?? 0 : 0;
    const airOn = this.layerOn.ar && step.particles !== false ? 1 : 0;
    this.airflow?.update(dt, 1 - 0.8 * obstruction, 1, airOn);

    // Camera fly-to
    if (this.camGoal) {
      this.camera.position.lerp(this.camGoal.position, 1 - Math.exp(-3.2 * dt));
      this.controls.target.lerp(this.camGoal.target, 1 - Math.exp(-3.2 * dt));
      if (this.camera.position.distanceTo(this.camGoal.position) < 0.04) this.camGoal = null;
    }
    this.controls.update();
    this.labels.update({
      camera: this.camera, width: this.opts.container.clientWidth, height: this.opts.container.clientHeight,
      stepLabels: step.labels ?? [], visible: this.labelsVisible, flying: !!this.camGoal, layerOn: this.layerOn,
    });
  }

  private applyPart(part: Part, t: number) {
    const { material: m, mesh } = part;
    const o = part.opacity;
    mesh.visible = o > 0.01;
    const transparent = part.def.material === "skin" || o < 0.995;
    m.transparent = transparent;
    m.opacity = o;
    m.depthWrite = !transparent || part.def.material === "silicone";
    const side = part.def.material === "skin" || transparent ? THREE.FrontSide : THREE.DoubleSide;
    if (m.side !== side) { m.side = side; m.needsUpdate = true; }

    if (mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
      for (const [name, idx] of Object.entries(mesh.morphTargetDictionary)) mesh.morphTargetInfluences[idx] = this.morph[name] ?? 0;
    }

    // Emissive pulse for highlight / picked.
    scratch.set(LOOK[part.def.material].emissive ?? "#000000");
    // Subtle: a fresnel rim glow (in the shader) plus a very light emissive lift; tissue colour stays put.
    const pulse = part.highlight * (0.55 + 0.45 * Math.sin(t * 2.6));
    scratch.lerp(HIGHLIGHT, Math.min(1, pulse * 0.05));
    if (this.picked === part) scratch.lerp(PICK, 0.14);
    m.emissive.copy(scratch);
    m.userData.uHL.value = pulse + (this.picked === part ? 0.5 : 0);

    // Piece removal path: lift laterally out of the mucosal tunnel, then out through the nostril.
    const k = part.out;
    // Pieces being removed turn warm amber so the eye follows them out.
    m.color.copy(part.base).lerp(AMBER, 0.38 * smooth(Math.min(1, k * 3)));
    const lat = smooth(Math.min(1, k / 0.4));
    const exit = smooth(Math.max(0, (k - 0.3) / 0.7));
    part.pivot.position.set(1.1 * lat, -2.6 * exit, 4.4 * exit);
    part.pivot.rotation.set(0, 0, 0.5 * exit);
    const s = part.scale;
    part.pivot.scale.setScalar(s);
    part.pivot.position.addScaledVector(part.center, 1 - s);
  }

  // ── Camera ──

  private flyTo(cam: { position: Vec3; target: Vec3; portraitZoom?: number }, instant: boolean) {
    const target = new THREE.Vector3(...cam.target);
    const position = new THREE.Vector3(...cam.position);
    // Portrait screens need more distance to fit the same anatomy horizontally.
    const aspect = this.camera.aspect || 1;
    const fit = aspect < 1.25 ? Math.pow(1.25 / aspect, 0.62) * (cam.portraitZoom ?? 1) : 1;
    position.sub(target).multiplyScalar(fit).add(target);
    if (instant) {
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      this.camGoal = null;
    } else {
      this.camGoal = { position, target };
    }
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.opts.container;
    if (!w || !h) return;
    const previous = this.camera.aspect;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.parts.length && Math.abs(previous - this.camera.aspect) > 0.2) this.flyTo({ ...this.steps[this.stepIndex].camera, portraitZoom: this.steps[this.stepIndex].portraitZoom }, true);
    this.renderer.render(this.scene, this.camera);
  }

  // ── Loop ──

  private updateRunning = () => {
    const shouldRun = !this.disposed && this.onScreen && document.visibilityState === "visible" && this.parts.length > 0;
    if (shouldRun && !this.running) {
      this.running = true;
      this.timer.reset();
      const loop = (now: number) => {
        if (!this.running) return;
        this.timer.update(now);
        const dt = Math.min(0.05, this.timer.getDelta());
        this.update(dt);
        this.renderer.render(this.scene, this.camera);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  };

  // ── Picking ──

  private handlePointerDown = (e: PointerEvent) => {
    this.pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  private handlePointerUp = (e: PointerEvent) => {
    const d = this.pointerDown;
    this.pointerDown = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || performance.now() - d.t > 450) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const candidates = this.parts.filter((p) => p.mesh.visible && p.opacity > 0.4 && p.def.material !== "skin");
    const hits = ray.intersectObjects(candidates.map((p) => p.mesh), false)
      .filter((hit) => this.sagittal.distanceToPoint(hit.point) >= 0 || !this.partOf(hit.object)?.def.sagittalCut)
      .filter((hit) => this.coronal.distanceToPoint(hit.point) >= 0 && this.coronalBack.distanceToPoint(hit.point) >= 0);
    this.setPicked(hits.length ? this.partOf(hits[0].object) ?? null : null);
  };

  private partOf(o: THREE.Object3D) { return this.parts.find((p) => p.mesh === o); }

  private setPicked(part: Part | null) {
    this.picked = part;
    this.opts.onPick?.(part ? { name: part.def.name, description: part.def.description } : null);
  }
}

// ── Shader patches ──

function patchCap(material: THREE.MeshPhysicalMaterial, cap: THREE.Vector3) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCap = { value: cap };
    shader.uniforms.uHL = material.userData.uHL;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uCap;\nuniform float uHL;")
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
  if (!gl_FrontFacing) {
    // Cut face: darker, desaturated tissue colour with a faint shading taken from the light.
    float lum = dot(gl_FragColor.rgb, vec3(0.3, 0.59, 0.11));
    gl_FragColor.rgb = uCap * clamp(0.8 + 0.5 * lum, 0.74, 1.08);
  } else if (uHL > 0.001) {
    float f = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.2);
    gl_FragColor.rgb += vec3(1.0, 0.82, 0.62) * f * uHL * 0.38;
  }`,
      );
  };
  material.customProgramCacheKey = () => "anat-cap4";
}

// Translucent skin: stronger at grazing angles (silhouette), fading out towards the crop edge.
function patchSkin(material: THREE.MeshPhysicalMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorld;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\n  vWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorld;")
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
  float facing = abs(dot(normalize(normal), normalize(vViewPosition)));
  float rim = pow(1.0 - facing, 2.2);
  vec3 q = (vWorld - vec3(0.0, 0.7, 0.6)) / vec3(2.1, 3.9, 3.2);
  float fade = 1.0 - smoothstep(0.88, 1.0, length(q));
  gl_FragColor.a = clamp(gl_FragColor.a * (0.12 + 1.9 * rim), 0.0, 0.62) * fade;`,
      );
  };
  material.customProgramCacheKey = () => "anat-skin";
}

// ── Airflow particles ──

class Airflow {
  points: THREE.Points;
  private streams: { curve: THREE.CatmullRomCurve3; side: "left" | "right"; narrowing?: [number, number] }[];
  private particles: { stream: number; s: number; speed: number; jitter: THREE.Vector3; seed: number }[] = [];
  private tail = 6;
  private alpha = 0;

  constructor(procedure: ProcedureDef, planes: THREE.Plane[]) {
    this.streams = procedure.airflow.map((p) => ({
      curve: new THREE.CatmullRomCurve3(p.points.map((q) => new THREE.Vector3(...q)), false, "centripetal"),
      side: p.side,
      narrowing: p.narrowing,
    }));
    const perStream = 90;
    this.streams.forEach((_, stream) => {
      for (let i = 0; i < perStream; i++) {
        this.particles.push({
          stream,
          s: Math.random(),
          speed: 0.85 + Math.random() * 0.3,
          jitter: new THREE.Vector3((Math.random() - 0.5) * 0.16, (Math.random() - 0.5) * 0.22, 0),
          seed: Math.random(),
        });
      }
    });
    const n = this.particles.length * this.tail;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 4), 4));
    const material = new THREE.PointsMaterial({
      size: 0.4,
      map: dotTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      clippingPlanes: planes,
    });
    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 20;
  }

  /** flow: relative airflow per side (0..1); visible: 0/1 layer switch. */
  update(dt: number, leftFlow: number, rightFlow: number, visible: number) {
    this.alpha = damp(this.alpha, visible, 4, dt);
    this.points.visible = this.alpha > 0.01;
    if (!this.points.visible) return;
    const pos = this.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const col = this.points.geometry.getAttribute("color") as THREE.BufferAttribute;
    const p = new THREE.Vector3();
    let k = 0;
    for (const particle of this.particles) {
      const stream = this.streams[particle.stream];
      const flow = stream.side === "left" ? leftFlow : rightFlow;
      const active = particle.seed < 0.2 + 0.8 * flow ? 1 : 0;
      let speed = 0.16 * particle.speed * (0.35 + 0.65 * flow);
      if (stream.narrowing && particle.s > stream.narrowing[0] && particle.s < stream.narrowing[1]) speed *= 0.3 + 0.7 * flow;
      particle.s = (particle.s + speed * dt) % 1;
      for (let j = 0; j < this.tail; j++) {
        const s = Math.max(0, particle.s - j * 0.01);
        stream.curve.getPointAt(s, p).add(particle.jitter);
        pos.setXYZ(k, p.x, p.y, p.z);
        const edge = Math.min(1, s / 0.08, (1 - s) / 0.1);
        const a = this.alpha * active * edge * (1 - j / this.tail);
        col.setXYZW(k, 0.62 * a, 0.9 * a, 1.0 * a, a);
        k++;
      }
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
