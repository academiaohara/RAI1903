"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, RotateCcw } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
import { useHomeLayout } from "@/components/home/HomeLayoutProvider";
import {
  DEFAULT_HOME_SECTION_ORDER,
  HOME_SECTION_LABELS,
  moveHomeSection,
  type HomeSectionId,
} from "@/lib/home-layout";

const reorderButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-[#214C9B]/20 text-[#214C9B] enabled:hover:bg-blue-50 enabled:active:bg-blue-100 disabled:opacity-30";

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
    <EditorPanelFrame
      title="Orden de secciones"
      subtitle="Inicio"
      onClose={onClose}
      busy={busy}
      message={message}
      footer={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#214C9B] px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] active:bg-[#0f2d5c] disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
            Guardar
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 active:bg-blue-100 disabled:opacity-60"
          >
            <RotateCcw size={14} />
            Por defecto
          </button>
        </div>
      }
    >
      <p className="mb-3 text-xs font-semibold text-slate-500">
        El hero permanece arriba. El resto se reordena en la página de inicio.
      </p>

      <ol className="space-y-2">
        {order.map((id, index) => (
          <li
            key={id}
            className="flex items-center gap-2 rounded-xl border border-[#214C9B]/15 bg-slate-50/80 px-3 py-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-xs font-extrabold text-[#214C9B]">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm font-bold text-slate-800">{HOME_SECTION_LABELS[id]}</span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => move(id, "up")}
                className={reorderButtonClass}
                aria-label={`Subir ${HOME_SECTION_LABELS[id]}`}
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                disabled={index === order.length - 1}
                onClick={() => move(id, "down")}
                className={reorderButtonClass}
                aria-label={`Bajar ${HOME_SECTION_LABELS[id]}`}
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </EditorPanelFrame>
  );
}
