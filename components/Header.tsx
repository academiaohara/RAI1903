"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-4 border-[#981915] bg-[#214C9B] text-white shadow-xl shadow-blue-950/15">
      <div className="mx-auto flex h-20 max-w-[1480px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="RAI1903"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border-2 border-white bg-white object-contain p-1"
            priority
          />
          <span>
            <span className="block text-2xl font-extrabold tracking-tight">RAI1903</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">No oficial</span>
          </span>
        </Link>

        <nav className="no-scrollbar ml-auto hidden items-center gap-1 overflow-x-auto lg:flex" aria-label="Navegacion principal">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const hasChildren = "children" in item && item.children;
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  style={active ? { color: "#214C9B" } : undefined}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-transparent px-4 py-2 text-sm font-bold uppercase tracking-normal transition hover:border-white",
                    active ? "border-white bg-white shadow-lg shadow-blue-950/20" : "text-white",
                  )}
                >
                  {item.label}
                  {hasChildren && <ChevronDown size={14} className="transition group-hover:rotate-180" />}
                </Link>
                {hasChildren && (
                  <div className="invisible absolute right-0 top-full z-50 min-w-64 translate-y-2 rounded-3xl border border-blue-100 bg-white p-2 text-slate-900 opacity-0 shadow-2xl shadow-blue-950/15 transition group-hover:visible group-hover:translate-y-3 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-3 group-focus-within:opacity-100">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link key={child.href} href={child.href} className={cn("block rounded-2xl px-4 py-3 text-sm font-bold transition hover:bg-blue-50 hover:text-[#214C9B]", childActive && "bg-blue-50 text-[#214C9B]")}>
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button type="button" onClick={() => setOpen((current) => !current)} className="ml-auto rounded-full border border-white/40 p-2 text-white lg:hidden" aria-expanded={open} aria-label="Abrir navegacion">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/20 bg-[#173a78] px-4 py-4 shadow-xl lg:hidden">
          <nav className="mx-auto grid max-w-[1480px] gap-2" aria-label="Navegacion movil">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              const hasChildren = "children" in item && item.children;
              return (
                <div key={item.href} className="rounded-2xl border border-white/10 bg-white/5 p-1">
                  <Link href={item.href} style={active ? { color: "#214C9B" } : undefined} onClick={() => setOpen(false)} className={cn("block rounded-xl border border-transparent px-4 py-3 text-sm font-bold uppercase tracking-normal", active ? "border-white bg-white" : "text-white")}>
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <div className="grid gap-1 px-2 pb-2">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} onClick={() => setOpen(false)} className={cn("rounded-xl px-4 py-2 text-sm font-semibold text-white/85", pathname === child.href && "bg-white/15 text-white")}>
                          {child.label}
                        </Link>
                      ))}
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
