"use client";

import { useEffect, useState } from "react";
import { parseCanteraSquadJson } from "@/lib/cms/parse-squad-json";
import { serializeCanteraSquadJson } from "@/lib/cantera-squad-json";
import type { CanteraSquadImport } from "@/types/cantera-squad-import";

type CanteraSquadJsonEditorAccent = "club" | "femenino";

const ACCENT_STYLES: Record<
  CanteraSquadJsonEditorAccent,
  { section: string; button: string; border: string; text: string }
> = {
  club: {
    section: "border-[#214C9B]/20 bg-blue-50/60",
    button: "bg-[#214C9B] hover:bg-[#173a78]",
    border: "border-[#214C9B]/20",
    text: "text-[#214C9B]",
  },
  femenino: {
    section: "border-[#981915]/20 bg-red-50/60",
    button: "bg-[#981915] hover:bg-[#7a1412]",
    border: "border-[#981915]/20",
    text: "text-[#981915]",
  },
};

const JSON_PLACEHOLDER = `{
  "entrenador": "Nombre del entrenador",
  "plantilla": [
    {
      "dorsal": 1,
      "jugador": "Nombre Apellido",
      "pos": "Portero",
      "edad": 18,
      "pc": 0,
      "pj": 0,
      "pt": 0,
      "min": 0,
      "goles": 0,
      "ta": 0,
      "tr": 0
    }
  ]
}`;

type CanteraSquadJsonEditorProps = {
  squad: CanteraSquadImport;
  onApply: (squad: CanteraSquadImport) => void;
  accent?: CanteraSquadJsonEditorAccent;
  className?: string;
};

export function CanteraSquadJsonEditor({
  squad,
  onApply,
  accent = "club",
  className = "",
}: CanteraSquadJsonEditorProps) {
  const styles = ACCENT_STYLES[accent];
  const [jsonText, setJsonText] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  const squadSnapshot = serializeCanteraSquadJson(squad);
  const displayedJson = jsonDirty ? jsonText : squadSnapshot;

  useEffect(() => {
    queueMicrotask(() => {
      setJsonDirty(false);
      setJsonText("");
      setJsonError(null);
    });
  }, [squadSnapshot]);

  const applyJson = () => {
    const result = parseCanteraSquadJson(displayedJson);
    if (!result.ok) {
      setJsonError(result.error);
      setLastSummary(null);
      return;
    }
    setJsonError(null);
    setLastSummary(result.summary);
    setJsonDirty(false);
    onApply(result.data);
  };

  const reloadFromSquad = () => {
    setJsonDirty(false);
    setJsonText("");
    setJsonError(null);
    setLastSummary("JSON recargado desde la plantilla actual.");
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(displayedJson);
      setLastSummary("JSON copiado al portapapeles.");
    } catch {
      setLastSummary(null);
      setJsonError("No se pudo copiar al portapapeles.");
    }
  };

  return (
    <section className={`rounded-2xl border p-4 ${styles.section} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-xs font-extrabold uppercase tracking-[0.14em] ${styles.text}`}>
          Plantilla JSON
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {squad.plantilla.length} jugadores
        </p>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-500">
        Edita el JSON directamente (entrenador y plantilla con dorsal, jugador, pos, edad, pc, pj, pt,
        min, goles, ta, tr, golesEncajados). También vale un array de jugadores. Pulsa «Aplicar JSON» y
        luego «Guardar».
      </p>
      {lastSummary ? (
        <p className="mt-2 text-[11px] font-bold text-emerald-700">{lastSummary}</p>
      ) : null}
      <div className={`mt-3 rounded-xl border bg-white p-3 ${styles.border}`}>
        <textarea
          value={displayedJson}
          onChange={(event) => {
            setJsonText(event.target.value);
            setJsonDirty(true);
            setJsonError(null);
            setLastSummary(null);
          }}
          rows={16}
          spellCheck={false}
          placeholder={JSON_PLACEHOLDER}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-700"
        />
        {jsonError ? <p className="mt-2 text-[11px] font-bold text-[#981915]">{jsonError}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyJson}
            className={`rounded-full px-3 py-1.5 text-xs font-extrabold uppercase text-white ${styles.button}`}
          >
            Aplicar JSON
          </button>
          <button
            type="button"
            onClick={reloadFromSquad}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
          >
            Recargar
          </button>
          <button
            type="button"
            onClick={() => void copyJson()}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
          >
            Copiar JSON
          </button>
        </div>
      </div>
    </section>
  );
}
