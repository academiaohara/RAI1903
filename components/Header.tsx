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
          className="hidden border-t border-neutral-200/80 bg-[#f0f1f3] lg:block"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto flex max-w-[1480px] justify-center px-4 py-2.5 sm:px-6 lg:px-8">
            <nav
              className="flex flex-wrap items-center justify-center gap-2"
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
                      "flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center gap-1 rounded-[10px] border bg-white px-1 py-1.5 text-center transition",
                      childActive
                        ? "border-[#981915] shadow-sm shadow-[#981915]/10"
                        : "border-[#e0e0e0] hover:border-[#981915]/50 hover:shadow-sm",
                    )}
                  >
                    <Icon size={18} strokeWidth={2.25} className="shrink-0 text-[#981915]" aria-hidden />
                    <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-neutral-800">
                      {child.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
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
                    <div className="flex flex-wrap justify-center gap-2 px-2 pb-2 pt-1">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                        const Icon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href as Route}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center gap-1 rounded-[10px] border bg-white px-1 py-1.5 text-center",
                              childActive ? "border-[#981915] shadow-sm" : "border-[#e0e0e0]",
                            )}
                          >
                            <Icon size={18} strokeWidth={2.25} className="shrink-0 text-[#981915]" aria-hidden />
                            <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-neutral-800">
                              {child.label}
                            </span>
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
