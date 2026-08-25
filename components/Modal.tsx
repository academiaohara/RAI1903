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
  size = "default",
  variant = "default",
}: {
  open: boolean;
  title: string;
  titleHref?: string;
  titleLinkLabel?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  size?: "default" | "wide" | "sm";
  /** "ticket" replica el estilo de los boletos de la quiniela. */
  variant?: "default" | "ticket";
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

  const isTicket = variant === "ticket";
  const maxWidth =
    size === "sm" ? "max-w-md" : size === "wide" || wide ? "max-w-6xl" : "max-w-4xl";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div
        className={
          isTicket
            ? `ticket-modal max-h-[92vh] w-full overflow-y-auto sm:max-h-[90vh] ${maxWidth}`
            : `max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-[#214C9B]/25 bg-white shadow-2xl shadow-slate-950/30 sm:max-h-[90vh] sm:rounded-3xl ${maxWidth}`
        }
      >
        <div
          className={
            isTicket
              ? "ticket-modal-header sticky top-0 z-10 flex items-start justify-between gap-3 p-3 backdrop-blur sm:items-center sm:p-4"
              : "sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#214C9B]/20 bg-white/95 p-4 backdrop-blur sm:items-center sm:p-5"
          }
        >
          <div className="flex min-w-0 items-center gap-2">
            <h2
              className={
                isTicket
                  ? "ticket-modal-title min-w-0 break-words text-xl uppercase leading-tight sm:text-2xl"
                  : "min-w-0 break-words text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:text-xl"
              }
            >
              {title}
            </h2>
            {titleHref ? (
              <a
                href={titleHref}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  isTicket
                    ? "inline-flex shrink-0 text-[#1c3f6e] transition hover:text-[#b5281f]"
                    : "inline-flex shrink-0 text-[#214C9B] transition hover:text-[#214C9B]/80"
                }
                aria-label={titleLinkLabel}
              >
                <ExternalLink size={18} aria-hidden />
              </a>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className={
              isTicket
                ? "ticket-modal-close shrink-0 p-2"
                : "shrink-0 rounded-full border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
            }
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className={isTicket ? "p-3 sm:p-5" : "p-4 sm:p-5"}>{children}</div>
      </div>
    </div>
  );
}
