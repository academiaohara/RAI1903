"use client";

import { useEffect, useState } from "react";
import type { FilialFixturesBundle } from "@/lib/cms/filial-bundles";
import { parseCanteraFixturesJson } from "@/lib/cms/parse-fixtures-json";

const JSON_PLACEHOLDER = `{
  "competicion": "Liga",
  "jornadas": [
    {
      "jornada": 1,
      "partidos": [
        { "fecha": "2026-01-10", "hora": "17:00", "local": "Equipo A", "visitante": "Equipo B", "goles_local": null, "goles_visitante": null, "estado": "pendiente" }
      ]
    }
  ]
}`;

function serializeFixturesJson(fixtures: FilialFixturesBundle): string {
  return JSON.stringify(fixtures, null, 2);
}

type CanteraFixturesJsonEditorProps = {
  fixtures: FilialFixturesBundle;
  onApply: (fixtures: FilialFixturesBundle) => void;
  className?: string;
};

export function CanteraFixturesJsonEditor({
  fixtures,
  onApply,
  className = "",
}: CanteraFixturesJsonEditorProps) {
  const [jsonText, setJsonText] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  const snapshot = serializeFixturesJson(fixtures);
  const displayedJson = jsonDirty ? jsonText : snapshot;
  const matchCount = fixtures.jornadas.reduce((sum, j) => sum + j.partidos.length, 0);

  useEffect(() => {
    queueMicrotask(() => {
      setJsonDirty(false);
      setJsonText("");
      setJsonError(null);
    });
  }, [snapshot]);

  const applyJson = () => {
    const result = parseCanteraFixturesJson(displayedJson);
    if (!result.ok) {
      setJsonError(result.error);
      setLastSummary(null);
      return;
    }
    setJsonError(null);
    setLastSummary(`Aplicado: ${result.summary}`);
    setJsonDirty(false);
    onApply(result.data);
  };

  const reloadFromFixtures = () => {
    setJsonDirty(false);
    setJsonText("");
    setJsonError(null);
    setLastSummary("JSON recargado desde el calendario actual.");
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
    <section className={`rounded-2xl border border-[#214C9B]/20 bg-blue-50/60 p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">
          Calendario JSON
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {fixtures.jornadas.length} jornadas · {matchCount} partidos
        </p>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-500">
        Edita el JSON actual del calendario (fecha, hora, local, visitante, goles y estado). Pulsa «Aplicar
        JSON» y luego «Guardar» y revisa los equipos en Competición.
      </p>
      {lastSummary ? (
        <p className="mt-2 text-[11px] font-bold text-emerald-700">{lastSummary}</p>
      ) : null}
      <div className="mt-3 rounded-xl border border-[#214C9B]/20 bg-white p-3">
        <textarea
          value={displayedJson}
          onChange={(event) => {
            setJsonText(event.target.value);
            setJsonDirty(true);
            setJsonError(null);
            setLastSummary(null);
          }}
          rows={18}
          spellCheck={false}
          placeholder={JSON_PLACEHOLDER}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-700"
        />
        {jsonError ? <p className="mt-2 text-[11px] font-bold text-[#981915]">{jsonError}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyJson}
            className="rounded-full bg-[#214C9B] px-3 py-1.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78]"
          >
            Aplicar JSON
          </button>
          <button
            type="button"
            onClick={reloadFromFixtures}
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
