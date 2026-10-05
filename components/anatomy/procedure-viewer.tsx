"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PROCEDURES } from "@/lib/anatomy/procedures";
import type { AnatomyEngine, PickInfo } from "./engine";

export default function ProcedureViewer({ slug }: { slug: string }) {
  const procedure = PROCEDURES[slug];
  const canvasRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AnatomyEngine | null>(null);
  const stepRef = useRef(0);
  const railRef = useRef<HTMLOListElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [layers, setLayers] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pick, setPick] = useState<PickInfo | null>(null);
  const [labels, setLabels] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [interacted, setInteracted] = useState(false);

  const steps = procedure.steps;
  const current = steps[step];

  useEffect(() => {
    let cancelled = false;
    let engine: AnatomyEngine | null = null;
    const canvas = canvasRef.current!, labelLayer = labelRef.current!;
    if (!hasWebGL()) { setStatus("error"); return; }
    import("./engine")
      .then(({ AnatomyEngine }) => {
        if (cancelled) return;
        engine = new AnatomyEngine({
          container: canvas,
          labelLayer,
          procedure,
          onProgress: setProgress,
          onReady: () => { engine!.setStep(stepRef.current, { instant: true }); setStatus("ready"); },
          onError: () => setStatus("error"),
          onPick: setPick,
          onLayersChange: setLayers,
        });
        engineRef.current = engine;
      })
      .catch(() => setStatus("error"));
    return () => {
      cancelled = true;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [procedure]);

  const goTo = useCallback((i: number) => {
    const next = Math.max(0, Math.min(steps.length - 1, i));
    stepRef.current = next;
    setStep(next);
    setInteracted(true); // the first-use hint has done its job once the story moves on
    engineRef.current?.setStep(next);
    const chip = railRef.current?.children[next] as HTMLElement | undefined;
    chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [steps.length]);

  const toggleLayer = (id: string) => engineRef.current?.setLayer(id, !layers[id]);

  const toggleLabels = () => {
    const next = !labels;
    setLabels(next);
    engineRef.current?.setLabelsVisible(next);
  };

  // Edge fades on horizontally scrolling rows (step rail, layer chips) only where more content hides.
  useEffect(() => {
    const els = [railRef.current, chipsRef.current].filter(Boolean) as HTMLElement[];
    const cleanups = els.map((el) => {
      const sync = () => {
        el.dataset.fadeL = el.scrollLeft > 4 ? "1" : "0";
        el.dataset.fadeR = el.scrollLeft + el.clientWidth < el.scrollWidth - 4 ? "1" : "0";
      };
      sync();
      el.addEventListener("scroll", sync, { passive: true });
      const ro = new ResizeObserver(sync);
      ro.observe(el);
      return () => { el.removeEventListener("scroll", sync); ro.disconnect(); };
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  // Expanded mode: lock page scroll, close with Escape.
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [expanded]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goTo(step + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goTo(step - 1); }
  };

  return (
    <div className={`anat${expanded ? " is-expanded" : ""}`} onKeyDown={onKeyDown}>
      <ol className="anat-rail" ref={railRef} aria-label="Etapas">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={i === step ? "is-active" : i < step ? "is-done" : ""}
              aria-current={i === step ? "step" : undefined}
              onClick={() => goTo(i)}
            >
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              {s.short}
            </button>
          </li>
        ))}
      </ol>

      <div
        className="anat-stage"
        onPointerDown={() => setInteracted(true)}
        role="region"
        tabIndex={0}
        aria-label="Modelo 3D interativo. Use as setas do teclado para mudar de etapa."
      >
        <div className="anat-canvas" ref={canvasRef} />
        <div className="anat-labels" ref={labelRef} aria-hidden="true" />

        <div className="anat-tools">
          <button type="button" onClick={toggleLabels} aria-pressed={labels} title={labels ? "Ocultar nomes" : "Mostrar nomes"} aria-label={labels ? "Ocultar nomes das estruturas" : "Mostrar nomes das estruturas"}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
              <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
              {!labels && <path d="M3 3l18 18" />}
            </svg>
          </button>
          <button type="button" onClick={() => engineRef.current?.resetView()} title="Centralizar visão" aria-label="Centralizar visão">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>
          <button type="button" onClick={() => setExpanded((v) => !v)} title={expanded ? "Sair da tela cheia" : "Tela cheia"} aria-label={expanded ? "Sair da tela cheia" : "Tela cheia"} aria-pressed={expanded}>
            {expanded ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
            )}
          </button>
        </div>

        {pick && (
          <div className="anat-pick" role="status">
            <button type="button" className="anat-pick-close" onClick={() => setPick(null)} aria-label="Fechar descrição">×</button>
            <strong>{pick.name}</strong>
            <p>{pick.description}</p>
          </div>
        )}

        {status === "ready" && !interacted && (
          <div className="anat-hint">
            <span className="wide">Arraste para girar · role para aproximar · clique para identificar</span>
            <span className="narrow">Arraste para girar · toque para identificar</span>
          </div>
        )}

        {/* Phones: step controls stay on the model while the text sits below. */}
        <div className="anat-stagebar">
          <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="Etapa anterior">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span>
            <em>{step + 1}/{steps.length}</em> {current.short}
          </span>
          <button type="button" onClick={() => goTo(step === steps.length - 1 ? 0 : step + 1)} aria-label={step === steps.length - 1 ? "Recomeçar" : "Próxima etapa"}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        {status !== "ready" && (
          <div className="anat-loading">
            {status === "loading" ? (
              <>
                <div className="anat-progress"><span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} /></div>
                <span>Carregando modelo 3D…</span>
              </>
            ) : (
              <span>Não foi possível carregar o modelo 3D neste navegador.</span>
            )}
          </div>
        )}
      </div>

      <aside className="anat-panel">
        <div className="anat-card" key={current.id}>
          <span className="anat-kicker">Etapa {step + 1} de {steps.length}</span>
          <h2>{current.title}</h2>
          <p>{current.body}</p>
          <div className="anat-nav">
            <button type="button" className="anat-btn" onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="Etapa anterior">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 19l-7-7 7-7" /></svg>
            </button>
            <div className="anat-dots" aria-hidden="true">
              {steps.map((s, i) => <span key={s.id} className={i === step ? "is-on" : ""} />)}
            </div>
            <button type="button" className="anat-btn is-primary" onClick={() => goTo(step === steps.length - 1 ? 0 : step + 1)}>
              {step === steps.length - 1 ? "Recomeçar" : "Próxima"}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="anat-layers">
          <span className="anat-kicker">Camadas</span>
          <div className="anat-chips" ref={chipsRef}>
            {procedure.layers.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`anat-chip${layers[l.id] ? " is-on" : ""}`}
                aria-pressed={!!layers[l.id]}
                onClick={() => toggleLayer(l.id)}
                disabled={status !== "ready"}
              >
                <span className="sw" style={{ background: l.swatch }} />
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
