// Data model for the 3D anatomy explorer (/anatomia).
// Everything the doctor may want to correct (names, texts, colours, cuts, labels) lives in lib/atlas/head.ts.

export type Vec3 = [number, number, number];

/** Render class: decides lighting and the colour of the flat cut face (cap). */
export type MaterialKind = "skin" | "bone" | "tooth" | "cartilage" | "mucosa" | "sinus" | "eye";

/** Which translucent layer a structure belongs to when it is drawn as a ghost. */
export type Layer = "inner" | "bone" | "skin";

export interface GroupDef {
  id: string;
  name: string;
  /** Colour of the dot shown on the group card (defaults to the first member's colour). */
  color?: string;
  /** Short explanation of the group as a whole (shown when the group name is tapped). */
  text: string;
  /** Small note shown under the group in the list. */
  note?: string;
  /** Expanded in the structures list on first load. */
  open?: boolean;
}

export interface StructureDef {
  id: string;
  group: string;
  /** Regexes (source strings) matched against GLB node names; all matching nodes belong to this structure. */
  parts: string[];
  material: MaterialKind;
  /** Dot / label / mesh colour (sRGB hex). */
  color: string;
  /** Colour of the flat cut face (defaults to a darker, calmer version of `color`). Shared by bones so sections read as one solid. */
  cap?: string;
  /** Lay name, as the doctor would say it to a patient. */
  name: string;
  /** Technical name (optional). */
  technical?: string;
  /** 1-3 short sentences, pt-BR. */
  text: string;
  /** Opacity multiplier (default 1); below 1 the part is translucent. */
  opacity?: number;
}

export interface CutLabel {
  /** Structure id, or for a point label (e.g. a meatus) any unique id together with `point`. */
  structure: string;
  /** Fixed anchor in model cm: a label for an air space, not a mesh. */
  point?: Vec3;
  /** Card text for a point label. */
  info?: string;
  /** Restrict the anchor to one side: "dir" = patient's right (x < 0), "esq" = left (x > 0). */
  side?: "dir" | "esq";
  /** Override the pill text (defaults to the structure's lay name). */
  text?: string;
  /** Preferred pill column. */
  column?: "left" | "right";
  /** Skipped on phones, where a narrow stage only has room for two or three pills. */
  desktopOnly?: boolean;
}

export interface CutDef {
  id: string;
  /** Full name (aria-label). */
  name: string;
  /** Short, friendly button label. */
  short: string;
  /** One line shown under the cut buttons; starts with the technical name. */
  hint: string;
  /** Plane: keeps the points whose coordinate on `axis` is <= offset (keep "neg") or >= offset ("pos"). */
  plane: { axis: "x" | "y" | "z"; keep: "neg" | "pos"; offset: number; min: number; max: number; minLabel: string; maxLabel: string } | null;
  /**
   * Camera framing: look at the centre of `focus` (a box in model cm) from direction `dir`; the engine picks the
   * distance so the box fills `fill` of the free area of the stage (works for any aspect ratio / panel).
   */
  camera: { dir: Vec3; focus: [Vec3, Vec3]; fill?: number; /** Face-only focus box used when the free stage area is portrait (phones, tablet portrait). */ portraitFocus?: [Vec3, Vec3]; /** Screen-up direction (default +y); the horizontal cut uses +z so the front of the face is at the top. */ up?: Vec3 };
  /** Structures visible when this cut is chosen. */
  visible: string[];
  /** Curated labels, most important first (max 6). */
  labels: CutLabel[];
}
