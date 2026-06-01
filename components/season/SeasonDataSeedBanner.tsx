"use client";

import { useSeason } from "@/components/season/SeasonProvider";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { seasonHasCompetitionBundles, shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SeasonDataSeedBanner() {
  const { bundles, viewedSeason, bundlesLoading } = useSeason();
  const { canEdit, editMode } = useInlineEditing();

  if (!isSupabaseConfigured() || shouldUseMockCompetitionFallback() || bundlesLoading) return null;
  if (seasonHasCompetitionBundles(bundles)) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        canEdit && editMode
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
      role="status"
    >
      {canEdit && editMode ? (
        <>
          <p className="font-bold">Temporada {viewedSeason.label} sin datos en Supabase</p>
          <p className="mt-1 text-xs leading-relaxed">
            Abre <strong>Editar → Temporadas</strong> y pulsa <strong>Subir mock actual a «{viewedSeason.id}»</strong> para
            cargar plantilla, calendario y crónicas. Las imágenes (escudos) siguen en GitHub.
          </p>
        </>
      ) : (
        <p className="text-xs font-semibold">Contenido de competición en preparación para esta temporada.</p>
      )}
    </div>
  );
}
