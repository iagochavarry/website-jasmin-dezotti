import type { ProcedureDef } from "../types";
import { septoplastia } from "./septoplastia";

// Add new 3D procedures here (model in public/models, steps in ./<slug>.ts).
export const PROCEDURES: Record<string, ProcedureDef> = {
  septoplastia,
};
