"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  title,
  titleHref,
  titleLinkLabel = "Abrir enlace externo",
  children,
  onClose,
  wide = false,
}: {
  open: boolean;
  title: string;
  titleHref?: string;
  titleLinkLabel?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-[#214C9B]/25 bg-white shadow-2xl shadow-slate-950/30 sm:max-h-[90vh] sm:rounded-3xl ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#214C9B]/20 bg-white/95 p-4 backdrop-blur sm:items-center sm:p-5">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="min-w-0 break-words text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:text-xl">{title}</h2>
            {titleHref ? (
              <a
                href={titleHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 text-[#214C9B] transition hover:text-[#214C9B]/80"
                aria-label={titleLinkLabel}
              >
                <ExternalLink size={18} aria-hidden />
              </a>
            ) : null}
          </div>
          <button onClick={onClose} className="shrink-0 rounded-full border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
