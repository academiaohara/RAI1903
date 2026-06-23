"use client";

import { useState } from "react";
import type { ParseFixturesJsonResult } from "@/lib/cms/parse-fixtures-json";

type FixturesJsonPasteAccent = "club" | "femenino";

const ACCENT_STYLES: Record<
  FixturesJsonPasteAccent,
  { section: string; button: string; border: string; text: string }
> = {
  club: {
    section: "border-[#214C9B]/20 bg-blue-50/60",
    button: "border-[#214C9B]/25 text-[#214C9B]",
    border: "border-[#214C9B]/20",
    text: "text-[#214C9B]",
  },
  femenino: {
    section: "border-[#981915]/20 bg-red-50/60",
    button: "border-[#981915]/25 text-[#981915]",
    border: "border-[#981915]/20",
    text: "text-[#981915]",
  },
};

type FixturesJsonPasteSectionProps<T> = {
  hint: string;
  accent?: FixturesJsonPasteAccent;
  parse: (input: string) => ParseFixturesJsonResult<T>;
  onImport: (data: T, summary: string) => void;
};

export function FixturesJsonPasteSection<T>({
  hint,
  accent = "club",
  parse,
  onImport,
}: FixturesJsonPasteSectionProps<T>) {
  const styles = ACCENT_STYLES[accent];
  const [showJsonPaste, setShowJsonPaste] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  const closeJsonPaste = () => {
    setShowJsonPaste(false);
    setJsonError(null);
  };

  const applyJsonPaste = () => {
    const result = parse(jsonDraft);
    if (!result.ok) {
      setJsonError(result.error);
      setLastSummary(null);
      return;
    }
    setJsonError(null);
    onImport(result.data, result.summary);
    setLastSummary(result.summary);
    setShowJsonPaste(false);
    setJsonDraft("");
  };

  return (
    <section className={`rounded-2xl border p-4 ${styles.section}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-xs font-extrabold uppercase tracking-[0.14em] ${styles.text}`}>
          Importar calendario JSON
        </p>
        <button
          type="button"
          onClick={() => {
            setJsonError(null);
            setShowJsonPaste((open) => !open);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-extrabold uppercase hover:bg-white ${styles.button}`}
        >
          {showJsonPaste ? "Cerrar" : "Pegar JSON"}
        </button>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-500">{hint}</p>
      {lastSummary ? (
        <p className="mt-2 text-[11px] font-bold text-emerald-700">Importado: {lastSummary}</p>
      ) : null}
      {showJsonPaste ? (
        <div className={`mt-3 rounded-xl border bg-white p-3 ${styles.border}`}>
          <textarea
            value={jsonDraft}
            onChange={(e) => {
              setJsonDraft(e.target.value);
              setJsonError(null);
            }}
            rows={10}
            spellCheck={false}
            placeholder='{ "jornadas": [ { "jornada": 1, "partidos": [ { "fecha": "2026-01-10", "local": "Equipo A", "visitante": "Equipo B" } ] } ] }'
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-700"
          />
          {jsonError ? <p className="mt-2 text-[11px] font-bold text-[#981915]">{jsonError}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyJsonPaste}
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold uppercase text-white ${
                accent === "femenino" ? "bg-[#981915] hover:bg-[#7a1412]" : "bg-[#214C9B] hover:bg-[#173a78]"
              }`}
            >
              Aplicar al calendario
            </button>
            <button
              type="button"
              onClick={closeJsonPaste}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
