"use client";

import { useState } from "react";

type MatchJsonPasteSectionProps<T> = {
  title: string;
  hint: string;
  applyLabel: string;
  placeholder: string;
  parse: (input: string) => { ok: true; data: T; summary: string } | { ok: false; error: string };
  onImport: (data: T, summary: string) => void;
  /** Serializa los datos actuales para editar en el textarea (en vez de empezar vacío). */
  serialize?: (data: T) => string;
  /** Datos actuales que se cargan al abrir el editor JSON. */
  currentData?: T;
};

export function MatchJsonPasteSection<T>({
  title,
  hint,
  applyLabel,
  placeholder,
  parse,
  onImport,
  serialize,
  currentData,
}: MatchJsonPasteSectionProps<T>) {
  const [showJsonPaste, setShowJsonPaste] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  const hasCurrentData = currentData !== undefined && serialize !== undefined;

  const openJsonEditor = () => {
    setJsonError(null);
    if (hasCurrentData) {
      setJsonDraft(serialize!(currentData!));
    }
    setShowJsonPaste(true);
  };

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
    <section className="rounded-2xl border border-[#214C9B]/20 bg-blue-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">{title}</p>
        <button
          type="button"
          onClick={() => {
            if (showJsonPaste) {
              closeJsonPaste();
            } else {
              openJsonEditor();
            }
          }}
          className="rounded-full border border-[#214C9B]/25 px-3 py-1 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-white"
        >
          {showJsonPaste ? "Cerrar" : hasCurrentData ? "Editar JSON" : "Pegar JSON"}
        </button>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-500">{hint}</p>
      {lastSummary ? (
        <p className="mt-2 text-[11px] font-bold text-emerald-700">Importado: {lastSummary}</p>
      ) : null}
      {showJsonPaste ? (
        <div className="mt-3 rounded-xl border border-[#214C9B]/20 bg-white p-3">
          {hasCurrentData ? (
            <p className="text-[11px] font-semibold text-slate-600">
              Edita el JSON actual. Al aplicar se sustituye el contenido completo.
            </p>
          ) : null}
          <textarea
            value={jsonDraft}
            onChange={(event) => {
              setJsonDraft(event.target.value);
              setJsonError(null);
            }}
            rows={12}
            spellCheck={false}
            placeholder={placeholder}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-700"
          />
          {jsonError ? <p className="mt-2 text-[11px] font-bold text-[#981915]">{jsonError}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyJsonPaste}
              className="rounded-full bg-[#214C9B] px-3 py-1.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78]"
            >
              {applyLabel}
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
