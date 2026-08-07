"use client";

import { useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { useAppDialog } from "@/components/AppDialogProvider";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";

type PublishCanteraFixturesButtonProps = {
  scope: CanteraCmsScope;
};

export function PublishCanteraFixturesButton({ scope }: PublishCanteraFixturesButtonProps) {
  const { viewedSeasonId, viewedSeason, refreshBundles } = useSeason();
  const { confirm } = useAppDialog();
  const { editMode, canEdit, localOnly } = useInlineEditing();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!canEdit || !editMode || localOnly) return null;

  const handlePublish = async () => {
    const confirmed = await confirm(
      `¿Publicar los cambios de Jornadas en el calendario CMS de «${viewedSeason.label}» (${scope})?\n\n` +
        "Se escribirá el bundle fixtures en Supabase.",
      { confirmLabel: "Publicar" },
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/cms/publish-cantera-fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonId: viewedSeasonId, scope }),
      });
      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "No se pudo publicar");
        return;
      }

      setMessage(payload.message ?? "Calendario publicado");
      await refreshBundles();
    } catch {
      setMessage("Error de red al publicar");
    } finally {
      setBusy(false);
      window.setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void handlePublish()}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-600/35 bg-amber-50 px-2.5 py-1.5 text-[11px] font-extrabold uppercase leading-none text-amber-900 hover:bg-amber-100 disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-xs"
      >
        {busy ? "Publicando…" : "Publicar calendario CMS"}
      </button>
      {message ? (
        <span className="max-w-[14rem] text-right text-[10px] font-bold leading-snug text-slate-600">
          {message}
        </span>
      ) : null}
    </div>
  );
}
