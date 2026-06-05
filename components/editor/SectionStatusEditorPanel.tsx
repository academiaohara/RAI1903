"use client";

import { useMemo, useState } from "react";
import { Construction, Loader2, X } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  getSectionStatusBundle,
  SECTION_STATUS_KEYS,
  SECTION_STATUS_SCOPE_LABELS,
  sectionStatusLabel,
  type SectionStatusKey,
  type SeasonSectionStatusBundle,
} from "@/lib/cms/section-status-bundle";
import { type SeasonBundleScope, upsertSeasonBundle } from "@/lib/cms/season-bundles";

const EDITABLE_SCOPES: SeasonBundleScope[] = ["masculino", "femenino", "filial", "juvenil"];

type SectionStatusEditorPanelProps = {
  onClose: () => void;
};

export function SectionStatusEditorPanel({ onClose }: SectionStatusEditorPanelProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const [scope, setScope] = useState<SeasonBundleScope>("masculino");
  const [statusOverride, setStatusOverride] = useState<SeasonSectionStatusBundle | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const statusFromBundles = useMemo(
    () => getSectionStatusBundle(bundles, scope),
    [bundles, scope],
  );
  const status = statusOverride ?? statusFromBundles;

  const saveStatus = async (nextStatus: SeasonSectionStatusBundle, success: string) => {
    setBusy(true);
    setMessage(null);
    const result = await upsertSeasonBundle(viewedSeasonId, scope, "section_status", nextStatus);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "No se pudo guardar");
      return;
    }
    setStatusOverride(nextStatus);
    setMessage(success);
    await refreshBundles();
    setStatusOverride(null);
  };

  const toggleSection = (section: SectionStatusKey) => {
    const next = { ...status, [section]: !status[section] };
    if (!next[section]) delete next[section];
    void saveStatus(
      next,
      next[section]
        ? `${sectionStatusLabel(scope, section)} marcada en construcción`
        : `${sectionStatusLabel(scope, section)} publicada`,
    );
  };

  return (
    <div className="w-[min(100vw-2rem,24rem)] rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Secciones</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-slate-600">
        Marca cada sección de <strong>{viewedSeason.label}</strong> como en construcción. Los visitantes verán un
        cartel y no el contenido; en modo edición sigues viendo y modificando la sección.
      </p>

      <div className="mb-3 flex flex-wrap gap-1">
        {EDITABLE_SCOPES.map((item) => (
          <button
            key={item}
            type="button"
            disabled={busy}
            onClick={() => {
              setScope(item);
              setStatusOverride(null);
              setMessage(null);
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase ${
              scope === item ? "bg-[#214C9B] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {SECTION_STATUS_SCOPE_LABELS[item]}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {SECTION_STATUS_KEYS.map((section) => {
          const underConstruction = status[section] === true;
          const label = sectionStatusLabel(scope, section);
          return (
            <li key={section}>
              <button
                type="button"
                disabled={busy}
                onClick={() => toggleSection(section)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                  underConstruction
                    ? "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                } disabled:opacity-50`}
              >
                <span className="font-bold">{label}</span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                    underConstruction ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {underConstruction ? (
                    <>
                      <Construction size={11} aria-hidden />
                      En construcción
                    </>
                  ) : (
                    "Publicada"
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {message && (
        <p className="mt-3 rounded-lg bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600">{message}</p>
      )}
      {busy && (
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Guardando…
        </p>
      )}
    </div>
  );
}
