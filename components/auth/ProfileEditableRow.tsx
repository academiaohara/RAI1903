"use client";

import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileEditableRowProps = {
  label: string;
  children: React.ReactNode;
  editing: boolean;
  onEdit: () => void;
  onCancel?: () => void;
  editContent: React.ReactNode;
  className?: string;
};

export function ProfileEditableRow({
  label,
  children,
  editing,
  onEdit,
  onCancel,
  editContent,
  className,
}: ProfileEditableRowProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        {label ? (
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        ) : (
          <span />
        )}
        {editing ? (
          onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Cancelar edición"
            >
              <X size={14} aria-hidden />
            </button>
          ) : null
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#214C9B]/20 text-[#214C9B] transition hover:border-[#214C9B]/40 hover:bg-[#214C9B]/5"
            aria-label={`Editar ${label.toLowerCase()}`}
          >
            <Pencil size={14} aria-hidden />
          </button>
        )}
      </div>

      {editing ? editContent : <div>{children}</div>}
    </div>
  );
}
