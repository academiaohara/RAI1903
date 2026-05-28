"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { ChevronDown, Menu, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { navItems, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, item: NavItem) {
  const activeHref = item.activePrefix ?? item.href;
  return pathname === activeHref || (activeHref !== "/" && pathname.startsWith(`${activeHref}/`));
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<NavItem | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setHoveredNav(null), 120);
  }, [clearCloseTimer]);

  const openMega = useCallback(
    (item: NavItem) => {
      clearCloseTimer();
      if (item.children?.length) setHoveredNav(item);
      else setHoveredNav(null);
    },
    [clearCloseTimer],
  );

  return (
    <header
      className="sticky top-0 z-40 border-b-4 border-[#981915] bg-[#214C9B] text-white shadow-xl shadow-blue-950/15"
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="RAI1903"
            width={52}
            height={52}
            className="h-11 w-11 object-contain sm:h-[3.25rem] sm:w-[3.25rem]"
            priority
          />
          <span>
            <span className="block text-xl font-extrabold tracking-tight sm:text-2xl">RAI1903</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">Fan made</span>
          </span>
        </Link>

        <nav className="no-scrollbar ml-auto hidden items-center gap-1 overflow-x-auto lg:flex" aria-label="Navegacion principal">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item);
            const hasChildren = Boolean(item.children?.length);
            const megaOpen = hoveredNav?.href === item.href;
            return (
              <div key={item.href} className="relative" onMouseEnter={() => openMega(item)}>
                <Link
                  href={item.href as Route}
                  style={active ? { color: "#214C9B" } : undefined}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-transparent px-4 py-2 text-sm font-bold uppercase tracking-normal transition hover:border-white",
                    active
                      ? "border-white bg-white text-[#214C9B] shadow-lg shadow-blue-950/20"
                      : "bg-transparent text-white hover:bg-transparent hover:text-white",
                    megaOpen && !active ? "border-white bg-transparent text-white" : "",
                  )}
                >
                  {item.label}
                  {hasChildren && <ChevronDown size={14} className={cn("transition", megaOpen && "rotate-180")} />}
                </Link>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="ml-auto rounded-full border border-white/40 p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Cerrar navegacion" : "Abrir navegacion"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {hoveredNav?.children && (
        <div
          className="fixed inset-x-0 top-16 z-[999] hidden border-b-[3px] border-[var(--rai-red)] bg-[#f9f9f9] shadow-[0_10px_20px_rgba(0,0,0,0.15)] sm:top-20 lg:block"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <nav
            className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-6 px-8 py-10"
            aria-label={`Subsecciones de ${hoveredNav.label}`}
          >
            {hoveredNav.children.map((child) => {
              const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
              const Icon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href as Route}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "group flex flex-col items-center justify-center rounded-xl border border-[#e0e0e0] bg-white px-4 py-6 text-center text-[0.95rem] font-medium text-[#444] transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
                    childActive
                      ? "border-[var(--rai-red)] text-[var(--rai-red)] shadow-[0_4px_12px_rgba(152,25,21,0.15)]"
                      : "hover:-translate-y-0.5 hover:border-[var(--rai-red)]/40 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]",
                  )}
                >
                  <Icon
                    size={40}
                    strokeWidth={2}
                    className="mb-3 h-10 w-10 shrink-0 text-[var(--rai-red)] transition-transform duration-300 group-hover:scale-105"
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "line-clamp-2 leading-snug",
                      childActive ? "text-[var(--rai-red)]" : "text-[#444]",
                    )}
                  >
                    {child.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <MobileNavDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
