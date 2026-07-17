"use client";

import { useMemo, useState } from "react";
import { Construction } from "lucide-react";
import { EditorPanelFrame } from "@/components/editor/EditorPanelFrame";
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
    <EditorPanelFrame
      title="Secciones"
      subtitle={viewedSeason.label}
      onClose={onClose}
      busy={busy}
      message={message}
    >
      <p className="mb-3 text-xs leading-relaxed text-slate-600">
        Marca cada sección como en construcción. Los visitantes verán un cartel y no el contenido; en modo
        edición sigues viendo y modificando la sección.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
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
            className={`min-h-9 rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase ${
              scope === item ? "bg-[#214C9B] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100"
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
                className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                  underConstruction
                    ? "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100 active:bg-amber-200"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
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
    </EditorPanelFrame>
  );
}
