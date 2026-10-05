"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CUTS, GROUPS, MODEL_URL, STRUCTURES } from "@/lib/atlas/head";
import type { CutDef, StructureDef } from "@/lib/atlas/types";
import type { AtlasEngine, AtlasState } from "./atlas-engine";
import type { Rect } from "./atlas-labels";

const ALL_IDS = STRUCTURES.map((s) => s.id);

const visibleFor = (cut: CutDef) => {
  const set = new Set(cut.visible);
  return Object.fromEntries(ALL_IDS.map((id) => [id, set.has(id)])) as Record<string, boolean>;
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

type Selection = { type: "s" | "g" | "p"; id: string } | null;

export default function AtlasViewer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AtlasEngine | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);
  const [present, setPresent] = useState<Set<string> | null>(null);
  const [cutId, setCutId] = useState(CUTS[0].id);
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState<Record<string, boolean>>(() => visibleFor(CUTS[0]));
  const [sel, setSel] = useState<Selection>(null);
  const [isolate, setIsolate] = useState(false);
  const [labels, setLabels] = useState(true);
  const [tab, setTab] = useState<"cortes" | "estruturas">("cortes");
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(GROUPS.map((g) => [g.id, !!g.open])));
  const [fullscreen, setFullscreen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [more, setMore] = useState(false); // info card text expanded
  const [clamped, setClamped] = useState(false); // text is longer than the collapsed card

  const cut = CUTS.find((c) => c.id === cutId) ?? CUTS[0];
  const shown = useCallback((s: StructureDef) => !present || present.has(s.id), [present]);

  const membersOf = useCallback(
    (gid: string) => STRUCTURES.filter((s) => s.group === gid && shown(s)),
    [shown],
  );

  const selectedIds = useMemo(() => {
    if (!sel) return [] as string[];
    if (sel.type === "p") return [sel.id];
    return sel.type === "s" ? [sel.id] : membersOf(sel.id).map((s) => s.id);
  }, [sel, membersOf]);

  const card = useMemo(() => {
    if (!sel) return null;
    if (sel.type === "p") {
      const l = cut.labels.find((x) => x.structure === sel.id);
      return l ? { key: `p:${l.structure}`, name: l.text ?? l.structure, technical: undefined, text: l.info ?? "", color: "#FFFFFF" } : null;
    }
    if (sel.type === "s") {
      const s = STRUCTURES.find((x) => x.id === sel.id);
      return s ? { key: s.id, name: s.name, technical: s.technical, text: s.text, color: s.color } : null;
    }
    const g = GROUPS.find((x) => x.id === sel.id);
    if (!g) return null;
    const first = STRUCTURES.find((s) => s.group === g.id);
    return { key: `g:${g.id}`, name: g.name, technical: undefined, text: g.text, color: g.color ?? first?.color ?? "#999" };
  }, [sel, cut]);

  const clearSelection = useCallback(() => { setSel(null); setIsolate(false); }, []);

  // ── Engine lifecycle ──
  const keepOut = useCallback((): Rect[] => {
    const stage = stageRef.current;
    if (!stage) return [];
    const s = stage.getBoundingClientRect();
    const rects: Rect[] = [];
    for (const [el, panel] of [[dockRef.current, true], [toolsRef.current, false], [infoRef.current, true]] as const) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.top >= s.bottom - 4 || r.bottom <= s.top + 4) continue; // outside the stage (phone dock)
      rects.push({ x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height, panel: el === dockRef.current });
    }
    stage.querySelectorAll(".atlas-side, .atlas-badge").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width) rects.push({ x: r.left - s.left - 4, y: r.top - s.top - 4, w: r.width + 8, h: r.height + 8 });
    });
    return rects;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let engine: AtlasEngine | null = null;
    setStatus("loading");
    setProgress(0);
    if (!hasWebGL()) { setStatus("error"); return; }
    import("./atlas-engine")
      .then(({ AtlasEngine }) => {
        if (cancelled) return;
        const params = new URLSearchParams(window.location.search);
        const devModel = process.env.NODE_ENV !== "production" ? params.get("model") : null;
        try {
          engine = new AtlasEngine({
            container: canvasRef.current!,
            labelLayer: labelRef.current!,
            modelUrl: devModel || MODEL_URL,
            onProgress: setProgress,
            onReady: (ids) => { setPresent(new Set(ids)); setStatus("ready"); },
            onError: () => setStatus("error"),
            onPointLabel: (key) => setSel({ type: "p", id: key.replace(/^pt:/, "") }),
            onSelect: (id) => {
              if (!id) { clearSelection(); return; }
              setSel({ type: "s", id });
              setVisible((v) => (v[id] ? v : { ...v, [id]: true }));
            },
          });
          engineRef.current = engine;
          engine.setInsets({}, keepOut);
        } catch {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
    return () => {
      cancelled = true;
      engine?.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Push state to the engine.
  useEffect(() => {
    if (status !== "ready") return;
    const state: AtlasState = { cut: cutId, offset, visible, selected: selectedIds, isolate, labels };
    engineRef.current?.setState(state);
  }, [status, cutId, offset, visible, selectedIds, isolate, labels]);

  // Free area for the model: desktop = right of the panel (+ room for label columns, or the card);
  // phone / tablet portrait = above the bottom sheet.
  useEffect(() => {
    if (status !== "ready") return;
    const sync = () => {
      const stage = stageRef.current, dock = dockRef.current;
      if (!stage || !dock) return;
      const s = stage.getBoundingClientRect();
      const desktop = window.innerWidth >= 900;
      const c = infoRef.current?.getBoundingClientRect();
      if (desktop) {
        const dockRight = dock.getBoundingClientRect().right - s.left + 12;
        const gutter = labels ? Math.round(Math.min(150, Math.max(100, (s.width - dockRight) * 0.13))) : 0;
        if (c && c.width > 0) engineRef.current?.setInsets({ left: Math.max(dockRight, c.right - s.left + 12), right: gutter }, keepOut);
        else engineRef.current?.setInsets({ left: dockRight + gutter, right: gutter }, keepOut);
      } else {
        engineRef.current?.setInsets({ bottom: c && c.height > 0 ? c.height + 10 : 0 }, keepOut);
      }
    };
    sync();
    const mq = window.matchMedia("(min-width: 900px)");
    mq.addEventListener("change", sync);
    const ro = new ResizeObserver(sync);
    if (dockRef.current) ro.observe(dockRef.current);
    if (infoRef.current) ro.observe(infoRef.current);
    return () => { mq.removeEventListener("change", sync); ro.disconnect(); };
  }, [status, keepOut, fullscreen, labels, card?.key, more]);

  // Touch: on phones a vertical swipe scrolls the page and a horizontal drag orbits; fullscreen / desktop give the model everything.
  useEffect(() => {
    if (status !== "ready") return;
    const mq = window.matchMedia("(min-width: 900px)");
    const sync = () => engineRef.current?.setTouchAction(fullscreen || mq.matches ? "none" : "pan-y");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [status, fullscreen]);

  // Info card: collapse to ~4 lines, with "mais" when the text is longer.
  useEffect(() => { setMore(false); }, [card?.key]);
  useEffect(() => {
    const el = textRef.current;
    if (!el || more) return;
    setClamped(el.scrollHeight > el.clientHeight + 2);
  }, [card?.key, more, fullscreen, status]);

  // ── Actions ──
  const chooseCut = useCallback((id: string) => {
    const c = CUTS.find((x) => x.id === id);
    if (!c) return;
    setCutId(id);
    setOffset(c.plane?.offset ?? 0);
    setVisible(visibleFor(c));
    clearSelection();
    setTouched(true);
  }, [clearSelection]);

  const toggleStruct = (id: string) => {
    setVisible((v) => ({ ...v, [id]: !v[id] }));
    if (visible[id] && selectedIds.includes(id)) clearSelection();
  };

  const toggleGroup = (gid: string) => {
    const ids = membersOf(gid).map((s) => s.id);
    const anyOn = ids.some((id) => visible[id]);
    setVisible((v) => ({ ...v, ...Object.fromEntries(ids.map((id) => [id, !anyOn])) }));
    if (anyOn && selectedIds.some((id) => ids.includes(id))) clearSelection();
  };

  const selectStruct = (id: string) => {
    if (sel?.type === "s" && sel.id === id) { clearSelection(); return; }
    setSel({ type: "s", id });
    setVisible((v) => (v[id] ? v : { ...v, [id]: true }));
    setTouched(true);
  };

  const selectGroup = (gid: string) => {
    if (sel?.type === "g" && sel.id === gid) { clearSelection(); return; }
    const ids = membersOf(gid).map((s) => s.id);
    setSel({ type: "g", id: gid });
    setVisible((v) => ({ ...v, ...Object.fromEntries(ids.map((id) => [id, true])) }));
    setTouched(true);
  };

  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (fullscreen) {
      if (document.fullscreenElement) void document.exitFullscreen?.();
      setFullscreen(false);
    } else {
      setFullscreen(true);
      try { void el.requestFullscreen?.().catch(() => undefined); } catch { /* the CSS fallback covers it */ }
    }
  }, [fullscreen]);

  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFullscreen(false); };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  // Keyboard: 1-5 switch cuts, Esc clears the selection (then leaves fullscreen).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).type !== "range"))) return;
      if (status !== "ready") return;
      const n = Number(e.key);
      if (n >= 1 && n <= CUTS.length) { chooseCut(CUTS[n - 1].id); return; }
      if (e.key === "Escape") {
        if (sel) clearSelection();
        else if (fullscreen) { if (document.fullscreenElement) void document.exitFullscreen?.(); setFullscreen(false); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, sel, fullscreen, chooseCut, clearSelection]);

  // Fade at the bottom of the structures list only while more rows are hidden below.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const sync = () => { el.dataset.more = el.scrollTop + el.clientHeight < el.scrollHeight - 4 ? "1" : "0"; };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => { el.removeEventListener("scroll", sync); ro.disconnect(); };
  });

  const groups = useMemo(
    () => GROUPS.map((g) => ({ g, items: STRUCTURES.filter((s) => s.group === g.id && shown(s)) })).filter((x) => x.items.length),
    [shown],
  );

  const plane = cut.plane;
  const defPct = plane ? ((plane.offset - plane.min) / (plane.max - plane.min)) * 100 : 0;
  const onSlide = (raw: number) => {
    if (!plane) return;
    setOffset(Math.abs(raw - plane.offset) < 0.1 ? plane.offset : raw);
    setTouched(true);
  };

  const retry = () => { setStatus("loading"); setAttempt((a) => a + 1); };

  return (
    <div ref={rootRef} className={`atlas${fullscreen ? " is-fs" : ""}`} data-tab={tab} data-status={status}>
      <div className="atlas-stage" ref={stageRef} onPointerDown={() => setTouched(true)}>
        <div className="atlas-canvas" ref={canvasRef} role="img" aria-label="Modelo 3D interativo da cabeça, com o nariz e os seios da face. Arraste para girar." />
        <div className="atlas-labels" ref={labelRef} aria-hidden="true" />

        <div className="atlas-tools" ref={toolsRef}>
          <ToolButton on={labels} label={labels ? "Ocultar nomes" : "Mostrar nomes"} onClick={() => setLabels((v) => !v)} pressed>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
              <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
              {!labels && <path d="M3 3l18 18" />}
            </svg>
          </ToolButton>
          <ToolButton label="Voltar à posição inicial" onClick={() => engineRef.current?.resetView()}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </ToolButton>
          <ToolButton label={fullscreen ? "Sair da tela cheia" : "Tela cheia"} onClick={toggleFullscreen} on={fullscreen} pressed>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {fullscreen ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
            </svg>
          </ToolButton>
        </div>

        {(cut.id === "sagital" || cut.id === "coronal" || cut.id === "axial") && (
          <div className="atlas-sides" aria-hidden="true">
            {cut.id === "sagital" ? (
              <span className="atlas-side l" title="A frente do rosto fica à esquerda da tela">← Frente</span>
            ) : (
              <>
                <span className="atlas-side l" title="Direita do paciente">D</span>
                <span className="atlas-side r" title="Esquerda do paciente">E</span>
              </>
            )}
          </div>
        )}
        <span className="atlas-badge">Modelo ilustrativo</span>

        {card && (
          <div className="atlas-info" ref={infoRef} role="status" key={card.key}>
            <button type="button" className="atlas-info-close" onClick={clearSelection} aria-label="Fechar descrição">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <div className="atlas-info-head">
              <span className="atlas-dot" style={{ background: card.color }} data-point={sel?.type === "p" ? "1" : undefined} />
              <h2>{card.name}</h2>
            </div>
            {card.technical && <p className="atlas-info-tech">{card.technical}</p>}
            <div className={`atlas-info-body${more ? " is-more" : ""}`}>
              <p className={`atlas-info-text${more ? "" : " is-clamped"}`} ref={textRef}>{card.text}</p>
              {(clamped || more) && (
                <button type="button" className="atlas-more" onClick={() => setMore((v) => !v)} aria-expanded={more}>{more ? "menos" : "mais"}</button>
              )}
            </div>
            <button type="button" className="atlas-chip-btn" aria-pressed={isolate} onClick={() => setIsolate((v) => !v)}>
              <span className="atlas-switch" aria-hidden="true" />
              Mostrar só {sel?.type === "g" ? "este grupo" : "esta"}
            </button>
          </div>
        )}

        {status === "ready" && !touched && !card && (
          <div className="atlas-hint">
            <span className="wide">Arraste para girar · role para aproximar · clique numa estrutura para saber mais</span>
            <span className="narrow">Arraste para os lados para girar · dois dedos para aproximar</span>
          </div>
        )}

        {status !== "ready" && (
          <div className="atlas-loading" role={status === "error" ? "alert" : "status"}>
            {status === "loading" ? (
              <>
                <div className="atlas-skel" aria-hidden="true"><span /><span /><span /></div>
                <div className="atlas-progress"><span style={{ transform: `scaleX(${Math.max(0.05, progress)})` }} /></div>
                <span>Carregando o modelo 3D…</span>
              </>
            ) : (
              <>
                <span className="atlas-error">Não foi possível carregar o modelo 3D neste navegador. Verifique a conexão ou tente abrir em outro navegador.</span>
                <button type="button" className="btn btn-primary atlas-retry" onClick={retry}>Tentar de novo</button>
              </>
            )}
          </div>
        )}
      </div>

      <div className={`atlas-dock${status === "ready" ? "" : " is-busy"}`} ref={dockRef} inert={status !== "ready"} aria-busy={status === "loading"}>
        <div className="atlas-seg" role="tablist" aria-label="Controles">
          {(["cortes", "estruturas"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>
              {t === "cortes" ? "Cortes" : "Estruturas"}
            </button>
          ))}
        </div>

        <section className="atlas-sec atlas-sec-cuts" aria-labelledby="atlas-cuts-h">
          <h3 id="atlas-cuts-h" className="atlas-h">Corte</h3>
          <div className="atlas-cuts" role="group" aria-label="Escolha o corte">
            {CUTS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className="atlas-cut"
                aria-pressed={c.id === cutId}
                aria-label={`${c.name} (tecla ${i + 1})`}
                title={`${c.short} (${i + 1})`}
                onClick={() => chooseCut(c.id)}
              >
                <span className="atlas-cut-key" aria-hidden="true">{i + 1}</span>
                <CutIcon id={c.id} />
                <span>{c.short}</span>
              </button>
            ))}
          </div>
          <p className="atlas-hint-line">{cut.hint}</p>
          {plane ? (
            <div className="atlas-slider" style={{ ["--def" as string]: `${defPct}%` }}>
              <label htmlFor="atlas-offset">Posição do corte</label>
              <div className="atlas-range">
                <input
                  id="atlas-offset"
                  type="range"
                  min={plane.min}
                  max={plane.max}
                  step={0.05}
                  value={offset}
                  onChange={(e) => onSlide(Number(e.target.value))}
                  aria-valuetext={`${offset.toFixed(1).replace(".", ",")} centímetros`}
                />
                <span className="atlas-tick" aria-hidden="true" />
              </div>
              <div className="atlas-range-ends"><span>{plane.minLabel}</span><span>{plane.maxLabel}</span></div>
            </div>
          ) : (
            <p className="atlas-slider-off">Sem corte: gire o modelo e escolha um corte para ver por dentro.</p>
          )}
        </section>

        <section className="atlas-sec atlas-sec-structs" aria-labelledby="atlas-structs-h">
          <h3 id="atlas-structs-h" className="atlas-h">Estruturas</h3>
          <div className="atlas-list" ref={listRef}>
            {groups.map(({ g, items }) => {
              const rows = (
                <ul>
                  {items.map((s) => (
                    <li key={s.id} className={`atlas-row${selectedIds.includes(s.id) ? " is-sel" : ""}${visible[s.id] ? "" : " is-off"}`}>
                      <button type="button" className="atlas-row-main" onClick={() => selectStruct(s.id)} aria-pressed={sel?.type === "s" && sel.id === s.id} aria-label={`${s.name}: ver explicação`}>
                        <span className="atlas-dot" style={{ background: s.color }} />
                        <span className="atlas-row-name">{s.name}</span>
                      </button>
                      <button type="button" className="atlas-eye" aria-pressed={!!visible[s.id]} aria-label={`${visible[s.id] ? "Ocultar" : "Mostrar"} ${s.name}`} onClick={() => toggleStruct(s.id)}>
                        <EyeIcon off={!visible[s.id]} />
                      </button>
                    </li>
                  ))}
                </ul>
              );
              if (items.length === 1) return <div key={g.id} className="atlas-group is-single">{rows}</div>;
              const on = items.filter((s) => visible[s.id]).length;
              const gSel = sel?.type === "g" && sel.id === g.id;
              return (
                <div key={g.id} className={`atlas-group${open[g.id] ? " is-open" : ""}${gSel ? " is-sel" : ""}`}>
                  <div className="atlas-group-head">
                    <button type="button" className="atlas-chev" aria-expanded={!!open[g.id]} aria-label={`${open[g.id] ? "Recolher" : "Expandir"} ${g.name}`} onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}>
                      <svg className="chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                    </button>
                    <button type="button" className="atlas-group-btn" aria-pressed={gSel} onClick={() => selectGroup(g.id)} aria-label={`${g.name}: ver explicação do grupo`}>
                      <span>{g.name}</span>
                      <em>{on}/{items.length}</em>
                    </button>
                    <button type="button" className="atlas-eye" aria-pressed={on > 0} aria-label={`${on > 0 ? "Ocultar" : "Mostrar"} grupo ${g.name}`} onClick={() => toggleGroup(g.id)}>
                      <EyeIcon off={on === 0} />
                    </button>
                  </div>
                  {open[g.id] && rows}
                  {open[g.id] && g.note && <p className="atlas-group-note">{g.note}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function ToolButton({ children, label, onClick, on, pressed }: { children: React.ReactNode; label: string; onClick: () => void; on?: boolean; pressed?: boolean }) {
  return (
    <button type="button" className="atlas-tool" onClick={onClick} title={label} aria-label={label} aria-pressed={pressed ? !!on : undefined}>
      {children}
    </button>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

/** Tiny pictogram: head silhouette (front or profile) with the cut plane as a line; the kept part is tinted. */
const FRONT = "M20 5c-6.4 0-10.5 4.6-10.5 11 0 4 1.2 7.2 3.2 9.6.9 1.1 1.3 2.2 1.3 3.6V33h12v-3.8c0-1.4.4-2.5 1.3-3.6 2-2.4 3.2-5.6 3.2-9.6C30.5 9.6 26.4 5 20 5Z";
const PROFILE = "M18.5 5C12.3 5 8 9.6 8 15.6c0 3.4 1.2 6 3.3 8.3.8.9 1.2 1.9 1.2 3.1V33H25v-4.5h2.6c1 0 1.7-.8 1.7-1.7v-3.2l1.9-.5c.5-.1.6-.8.2-1.1l-2.7-2.3c-.2-.2-.3-.5-.3-.8C28.4 9.8 24.4 5 18.5 5Z";
const ICON: Record<string, { path: string; line?: string; keep?: [number, number, number, number] }> = {
  inteiro: { path: PROFILE },
  sagital: { path: FRONT, line: "M20 2.5v35", keep: [0, 0, 20, 40] },
  parede: { path: FRONT, line: "M15 2.5v35", keep: [0, 0, 15, 40] },
  coronal: { path: PROFILE, line: "M21.5 2.5v35", keep: [0, 0, 21.5, 40] },
  axial: { path: PROFILE, line: "M4 17.5h32", keep: [0, 0, 40, 17.5] },
};

function CutIcon({ id }: { id: string }) {
  const ic = ICON[id] ?? ICON.inteiro;
  const clip = `atlas-clip-${id}`;
  return (
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="atlas-cut-icon">
      {ic.keep && (
        <>
          <clipPath id={clip}><rect x={ic.keep[0]} y={ic.keep[1]} width={ic.keep[2]} height={ic.keep[3]} /></clipPath>
          <path d={ic.path} className="keep" clipPath={`url(#${clip})`} />
        </>
      )}
      <path d={ic.path} className="sil" />
      {ic.line ? <path d={ic.line} className="cutline" /> : <circle cx="17.5" cy="16" r="2.4" className="dotfill" />}
    </svg>
  );
}
