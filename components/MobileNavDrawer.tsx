"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { isMobileNavItemActive, mobileNavSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[#244A86] text-white lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegacion"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={onClose}>
          <Image src="/logo.png" alt="RAI1903" width={44} height={44} className="h-10 w-10 shrink-0 object-contain" />
          <span className="truncate">
            <span className="block text-lg font-extrabold leading-tight tracking-tight">RAI1903</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">Fan made</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-[10px] p-2 text-white transition hover:bg-white/12"
          aria-label="Cerrar menu"
        >
          <X size={22} strokeWidth={2.25} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2" aria-label="Navegacion movil">
        {mobileNavSections.map((section, sectionIndex) => (
          <div key={section.title}>
            {sectionIndex > 0 && <div className="mx-3 my-1.5 border-b border-white/10" aria-hidden />}
            <h2 className="px-3 pb-0.5 pt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
              {section.title}
            </h2>
            <ul className="flex flex-col gap-0.5 px-1 pb-1">
              {section.items.map((item) => {
                const active = isMobileNavItemActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href as Route}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-[11px] px-4 py-3.5 text-[15px] font-semibold leading-tight transition",
                        active
                          ? "bg-white text-[#981915]"
                          : "text-white hover:bg-white/12 active:bg-white/15",
                      )}
                    >
                      <Icon
                        size={20}
                        strokeWidth={2.25}
                        className={cn("shrink-0", active ? "text-[#981915]" : "text-white")}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">{item.label}</span>
                      <ChevronRight
                        size={18}
                        strokeWidth={2.25}
                        className={cn("shrink-0", active ? "text-[#981915]/55" : "text-white/45")}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
