"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { ChevronDown, Menu, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { navItems, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
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
      className="fixed inset-x-0 top-0 z-40 border-b-4 border-[#981915] bg-[#214C9B] text-white shadow-xl shadow-blue-950/15"
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-20 max-w-[1480px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="RAI1903"
            width={52}
            height={52}
            className="h-[3.25rem] w-[3.25rem] object-contain"
            priority
          />
          <span>
            <span className="block text-2xl font-extrabold tracking-tight">RAI1903</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">Fan made</span>
          </span>
        </Link>

        <nav className="no-scrollbar ml-auto hidden items-center gap-1 overflow-x-auto lg:flex" aria-label="Navegacion principal">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            const hasChildren = Boolean(item.children?.length);
            const megaOpen = hoveredNav?.href === item.href;
            return (
              <div key={item.href} className="relative" onMouseEnter={() => openMega(item)}>
                <Link
                  href={item.href as Route}
                  style={active ? { color: "#214C9B" } : undefined}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-transparent px-4 py-2 text-sm font-bold uppercase tracking-normal transition hover:border-white",
                    active || megaOpen ? "border-white bg-white shadow-lg shadow-blue-950/20" : "text-white",
                    active || megaOpen ? "text-[#214C9B]" : "",
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
          aria-label="Abrir navegacion"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {hoveredNav?.children && (
        <div
          className="hidden border-t border-[#981915]/15 bg-white lg:block"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#981915]">{hoveredNav.label}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {hoveredNav.children.map((child) => {
                const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                const Icon = child.icon;
                return (
                  <Link
                    key={child.href}
                    href={child.href as Route}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition",
                      childActive
                        ? "border-[#981915] bg-[#981915]/5 text-[#981915] shadow-md shadow-[#981915]/10"
                        : "border-[#981915]/20 text-[#981915] hover:border-[#981915] hover:bg-[#981915]/5",
                    )}
                  >
                    <Icon size={32} strokeWidth={2.25} aria-hidden />
                    <span className="text-xs font-bold uppercase leading-tight tracking-normal">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="border-t border-white/20 bg-[#173a78] px-4 py-4 shadow-xl lg:hidden">
          <nav className="mx-auto grid max-w-[1480px] gap-2" aria-label="Navegacion movil">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              const hasChildren = Boolean(item.children?.length);
              return (
                <div key={item.href} className="rounded-2xl border border-white/10 bg-white/5 p-1">
                  <Link
                    href={item.href as Route}
                    style={active ? { color: "#214C9B" } : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl border border-transparent px-4 py-3 text-sm font-bold uppercase tracking-normal",
                      active ? "border-white bg-white" : "text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <div className="grid grid-cols-2 gap-2 px-2 pb-2 pt-1">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href;
                        const Icon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href as Route}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center",
                              childActive
                                ? "border-white bg-white text-[#981915]"
                                : "border-white/15 bg-white/5 text-white",
                            )}
                          >
                            <Icon size={24} aria-hidden />
                            <span className="text-[10px] font-bold uppercase leading-tight">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
