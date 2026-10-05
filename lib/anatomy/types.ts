// Declarative description of a 3D anatomy / surgery walkthrough.
// A procedure = a model (GLB), the layers a patient can toggle, metadata for
// every part (tap to identify) and an ordered list of steps. Each step is a
// target state; the engine animates between states.

export type Vec3 = [number, number, number];

export type MaterialKind =
  | "skin"
  | "bone"
  | "cartilage"
  | "mucosa"
  | "incision"
  | "silicone"
  | "suture"
  | "air";

export interface PartDef {
  /** Regex matched against GLB node names. */
  match: RegExp;
  name: string;
  description: string;
  layer: string;
  material: MaterialKind;
  /** Participates in the sagittal cut (removal of the patient's left side). */
  sagittalCut?: boolean;
  /** Overrides the material's base colour (hex); the cut-cap colour is derived from it. */
  tint?: string;
  /** Hidden unless a step's `partOpacity` shows it (splints, sutures…). */
  optional?: boolean;
}

export interface LayerDef {
  id: string;
  label: string;
  /** Swatch colour shown in the layer toggle. */
  swatch: string;
}

export interface LabelDef {
  id: string;
  text: string;
  anchor: Vec3;
  /** Hide the label when this layer is switched off. */
  layer?: string;
  /** Preferred side for the label text relative to its anchor. */
  side?: "left" | "right";
}

export interface PieceState {
  /** 0 = in place, 1 = removed through the nostril. */
  out: number;
  /** Visual scale when reinserted (remodelled cartilage). */
  scale?: number;
}

export interface AirflowPath {
  side: "left" | "right";
  points: Vec3[];
  /** Arc-length fraction [start, end] narrowed by the deviation (flow slows there). */
  narrowing?: [number, number];
}

export interface StepDef {
  id: string;
  /** Short label for the step rail. */
  short: string;
  title: string;
  body: string;
  camera: { position: Vec3; target: Vec3 };
  /** Distance multiplier on portrait screens (<1 = closer), for steps whose subject is narrow. */
  portraitZoom?: number;
  /** Show the 3D airflow particles when the "ar" layer is on (default true). */
  particles?: boolean;
  /** Opacity per layer id for this step (0 = hidden). Missing = 0. */
  layers: Record<string, number>;
  morphs?: Record<string, number>;
  /** Cut planes: sagittal keeps x < value (removes the patient's left side), coronal keeps z < value,
   *  coronalBack keeps z > value (together they leave a thin coronal slab). */
  cut?: { sagittal?: number; coronal?: number; coronalBack?: number };
  pieces?: Record<string, PieceState>;
  /** Per-part opacity (node-name regex source → multiplier). Also reveals optional parts. */
  partOpacity?: Record<string, number>;
  /** Parts (node-name regex source) that pulse to draw attention. */
  highlight?: string[];
  labels?: string[];
}

export interface ProcedureDef {
  slug: string;
  model: string;
  layers: LayerDef[];
  parts: PartDef[];
  labels: LabelDef[];
  airflow: AirflowPath[];
  /** Morph target that obstructs the left airflow (flow = 1 - 0.8 × weight). */
  obstructionMorph?: string;
  steps: StepDef[];
}
