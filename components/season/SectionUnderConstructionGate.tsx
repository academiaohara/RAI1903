"use client";

import { Construction } from "lucide-react";
import type { ReactNode } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  isSectionUnderConstruction,
  sectionStatusLabel,
  type SectionStatusKey,
} from "@/lib/cms/section-status-bundle";
import type { SeasonBundleScope } from "@/lib/cms/season-bundles";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type SectionUnderConstructionGateProps = {
  scope: SeasonBundleScope;
  section: SectionStatusKey;
  /** Etiqueta visible en el cartel (p. ej. «Quiniela» cuando depende de jornadas). */
  labelOverride?: string;
  /** Texto extra para editores (p. ej. explicar qué toggle controla la sección). */
  editorHintOverride?: string;
  /** Texto extra para visitantes (p. ej. indicar que pueden cambiar de temporada). */
  publicHintOverride?: string;
  children: ReactNode;
};

export function SectionUnderConstructionBanner({
  scope,
  section,
  labelOverride,
  editorHintOverride,
  publicHintOverride,
}: {
  scope: SeasonBundleScope;
  section: SectionStatusKey;
  labelOverride?: string;
  editorHintOverride?: string;
  publicHintOverride?: string;
}) {
  const { viewedSeason } = useSeason();
  const { canEdit, editMode } = useInlineEditing();
  const label = labelOverride ?? sectionStatusLabel(scope, section);

  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        canEdit && editMode
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Construction
          size={20}
          className={canEdit && editMode ? "mt-0.5 shrink-0 text-amber-700" : "mt-0.5 shrink-0 text-slate-500"}
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-extrabold">
            {label} en construcción · temporada {viewedSeason.label}
          </p>
          {canEdit && editMode ? (
            <p className="text-xs leading-relaxed">
              {editorHintOverride ??
                "Los visitantes no ven el contenido de esta sección. Puedes seguir editándola y, cuando esté lista, desmarca «En construcción» en Editar → Secciones."}
            </p>
          ) : (
            <p className="text-xs leading-relaxed">
              {publicHintOverride ??
                `Estamos preparando esta sección para la temporada ${viewedSeason.label}. Vuelve pronto.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SectionUnderConstructionGate({
  scope,
  section,
  labelOverride,
  editorHintOverride,
  publicHintOverride,
  children,
}: SectionUnderConstructionGateProps) {
  const { bundles, bundlesLoading } = useSeason();
  const { canEdit, editMode } = useInlineEditing();

  if (!isSupabaseConfigured() || bundlesLoading) {
    return <>{children}</>;
  }

  const underConstruction = isSectionUnderConstruction(bundles, scope, section);
  const showContent = !underConstruction || (canEdit && editMode);

  return (
    <div className="space-y-4">
      {underConstruction && (
        <SectionUnderConstructionBanner
          scope={scope}
          section={section}
          labelOverride={labelOverride}
          editorHintOverride={editorHintOverride}
          publicHintOverride={publicHintOverride}
        />
      )}
      {showContent ? children : null}
    </div>
  );
}
