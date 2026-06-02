"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  ClubAnnouncementUrlField,
  clubAnnouncementFieldsFromUrlValue,
  clubAnnouncementUrlValueFromEntry,
} from "@/components/editor/ClubAnnouncementUrlField";
import { useTransferMarketEditOptional } from "@/components/editor/TransferMarketEditProvider";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { TransferRumor } from "@/types";

type PlayerClubAnnouncementEditPanelProps = {
  transfer: TransferRumor;
};

export function PlayerClubAnnouncementEditPanel({ transfer }: PlayerClubAnnouncementEditPanelProps) {
  const { editMode } = useInlineEditing();
  const marketEdit = useTransferMarketEditOptional();

  if (!editMode || !marketEdit) return null;

  const cmsEntry = marketEdit.getEntry(transfer.id);
  if (!cmsEntry) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Este movimiento no está en el bundle de la temporada vista.{" "}
        <Link href={"/fichajes" as Route} className="font-extrabold text-[#214C9B] underline">
          Añádelo en la página de fichajes
        </Link>{" "}
        (modo edición).
      </p>
    );
  }

  return (
    <section
      className="rounded-2xl border border-[#214C9B]/25 bg-blue-50/60 p-4"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">Editar comunicado del club</p>
      <div className="mt-3">
        <ClubAnnouncementUrlField
          value={clubAnnouncementUrlValueFromEntry(cmsEntry)}
          onChange={(value) => marketEdit.updateEntry(transfer.id, clubAnnouncementFieldsFromUrlValue(value))}
          inputClassName="mt-1 w-full rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-sm normal-case text-slate-800 outline-none focus:border-[#214C9B]"
          labelClassName="block text-xs font-bold uppercase tracking-wide text-slate-500"
          buttonClassName="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#214C9B] px-4 py-2 text-xs font-extrabold uppercase text-white disabled:opacity-50"
          showDetailFields
        />
      </div>
    </section>
  );
}
