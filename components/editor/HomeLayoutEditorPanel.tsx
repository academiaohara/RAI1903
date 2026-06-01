"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, RotateCcw, X } from "lucide-react";
import { useHomeLayout } from "@/components/home/HomeLayoutProvider";
import {
  DEFAULT_HOME_SECTION_ORDER,
  HOME_SECTION_LABELS,
  moveHomeSection,
  type HomeSectionId,
} from "@/lib/home-layout";

type HomeLayoutEditorPanelProps = {
  onClose: () => void;
};

export function HomeLayoutEditorPanel({ onClose }: HomeLayoutEditorPanelProps) {
  const { sectionOrder, persistSectionOrder } = useHomeLayout();
  const [draft, setDraft] = useState<HomeSectionId[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const order = draft ?? sectionOrder;

  const move = useCallback(
    (id: HomeSectionId, direction: "up" | "down") => {
      setDraft((current) => moveHomeSection(current ?? sectionOrder, id, direction));
    },
    [sectionOrder],
  );

  const reset = () => {
    setDraft([...DEFAULT_HOME_SECTION_ORDER]);
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const result = await persistSectionOrder(order);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "No se pudo guardar el orden");
      return;
    }
    setMessage("Orden de inicio guardado");
    setDraft(null);
  };

  return (
    <div className="w-[min(100vw-2rem,24rem)] rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">Inicio</p>
          <h3 className="text-lg font-extrabold uppercase text-[#214C9B]">Orden de secciones</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            El hero permanece arriba. El resto se reordena en la página de inicio.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[#214C9B]/20 p-1.5 text-[#214C9B] hover:bg-blue-50"
          aria-label="Cerrar panel de inicio"
        >
          <X size={16} />
        </button>
      </div>

      <ol className="space-y-2">
        {order.map((id, index) => (
          <li
            key={id}
            className="flex items-center gap-2 rounded-xl border border-[#214C9B]/15 bg-slate-50/80 px-3 py-2"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-xs font-extrabold text-[#214C9B]">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm font-bold text-slate-800">{HOME_SECTION_LABELS[id]}</span>
            <div className="flex shrink-0 flex-col gap-0.5">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => move(id, "up")}
                className="rounded-lg border border-[#214C9B]/20 p-1 text-[#214C9B] enabled:hover:bg-blue-50 disabled:opacity-30"
                aria-label={`Subir ${HOME_SECTION_LABELS[id]}`}
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                disabled={index === order.length - 1}
                onClick={() => move(id, "down")}
                className="rounded-lg border border-[#214C9B]/20 p-1 text-[#214C9B] enabled:hover:bg-blue-50 disabled:opacity-30"
                aria-label={`Bajar ${HOME_SECTION_LABELS[id]}`}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </li>
        ))}
      </ol>

      {message && (
        <p
          className={`mt-3 text-xs font-bold ${message.includes("guardado") ? "text-[#2E7D32]" : "text-[#981915]"}`}
        >
          {message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#214C9B] px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null}
          Guardar
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 disabled:opacity-60"
        >
          <RotateCcw size={14} />
          Por defecto
        </button>
      </div>
    </div>
  );
}
