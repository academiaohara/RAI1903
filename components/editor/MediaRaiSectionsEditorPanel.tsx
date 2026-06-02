"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useMediaRaiSections } from "@/components/media-rai/MediaRaiSectionsProvider";
import {
  DEFAULT_MEDIA_RAI_SECTIONS,
  getMediaRaiSectionLabel,
  moveMediaRaiSection,
  uniqueMediaRaiSlug,
  type MediaRaiSectionEntry,
} from "@/lib/media-rai-sections";

type MediaRaiSectionsEditorPanelProps = {
  onClose: () => void;
};

export function MediaRaiSectionsEditorPanel({ onClose }: MediaRaiSectionsEditorPanelProps) {
  const { sections, persistSections } = useMediaRaiSections();
  const [draft, setDraft] = useState<MediaRaiSectionEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const order = draft ?? sections;

  const move = useCallback(
    (slug: string, direction: "up" | "down") => {
      setDraft((current) => moveMediaRaiSection(current ?? sections, slug, direction));
    },
    [sections],
  );

  const updateLabel = (slug: string, label: string) => {
    setDraft((current) => {
      const base = current ?? sections;
      return base.map((entry) => (entry.slug === slug ? { ...entry, label } : entry));
    });
  };

  const removeSection = (slug: string) => {
    setDraft((current) => {
      const base = current ?? sections;
      const next = base.filter((entry) => entry.slug !== slug);
      return next.length > 0 ? next : base;
    });
  };

  const addSection = () => {
    const name = window.prompt("Nombre de la nueva subsección");
    if (!name?.trim()) return;

    setDraft((current) => {
      const base = current ?? sections;
      const slug = uniqueMediaRaiSlug(
        name.trim(),
        base.map((entry) => entry.slug),
      );
      return [...base, { slug, label: name.trim() }];
    });
  };

  const reset = () => {
    setDraft([...DEFAULT_MEDIA_RAI_SECTIONS]);
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const result = await persistSections(order);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "No se pudo guardar las subsecciones");
      return;
    }
    setMessage("Subsecciones de Media RAI guardadas");
    setDraft(null);
  };

  return (
    <div className="w-[min(100vw-2rem,26rem)] rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">Media RAI</p>
          <h3 className="text-lg font-extrabold uppercase text-[#214C9B]">Subsecciones</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Añade, quita, renombra y reordena las pestañas de Media RAI. El slug de URL no cambia al
            renombrar.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[#214C9B]/20 p-1.5 text-[#214C9B] hover:bg-blue-50"
          aria-label="Cerrar panel de Media RAI"
        >
          <X size={16} />
        </button>
      </div>

      <ol className="max-h-[min(50vh,20rem)] space-y-2 overflow-y-auto pr-1">
        {order.map((entry, index) => (
          <li
            key={entry.slug}
            className="rounded-xl border border-[#214C9B]/15 bg-slate-50/80 px-3 py-2"
          >
            <div className="flex items-start gap-2">
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-xs font-extrabold text-[#214C9B]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <input
                  type="text"
                  value={entry.label ?? getMediaRaiSectionLabel(entry)}
                  onChange={(event) => updateLabel(entry.slug, event.target.value)}
                  className="w-full rounded-lg border border-[#214C9B]/25 bg-white px-2 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-[#214C9B]"
                  aria-label={`Nombre de ${entry.slug}`}
                />
                <p className="truncate text-[10px] font-semibold text-slate-400">/media-rai/{entry.slug}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(entry.slug, "up")}
                  className="rounded-lg border border-[#214C9B]/20 p-1 text-[#214C9B] enabled:hover:bg-blue-50 disabled:opacity-30"
                  aria-label="Subir subsección"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === order.length - 1}
                  onClick={() => move(entry.slug, "down")}
                  className="rounded-lg border border-[#214C9B]/20 p-1 text-[#214C9B] enabled:hover:bg-blue-50 disabled:opacity-30"
                  aria-label="Bajar subsección"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  disabled={order.length <= 1}
                  onClick={() => removeSection(entry.slug)}
                  className="rounded-lg border border-[#981915]/25 p-1 text-[#981915] enabled:hover:bg-red-50 disabled:opacity-30"
                  aria-label="Quitar subsección"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={addSection}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#214C9B]/30 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
      >
        <Plus size={14} />
        Añadir subsección
      </button>

      {message && (
        <p
          className={`mt-3 text-xs font-bold ${message.includes("guardad") ? "text-[#2E7D32]" : "text-[#981915]"}`}
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
