"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-4 border-[#8f0f14] bg-[#c4121a] text-white shadow-xl shadow-red-950/15">
      <div className="mx-auto flex h-20 max-w-[1480px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white text-[#c4121a] shadow-lg">
            <Shield className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-2xl font-black tracking-tight">RAI1903</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-white/75">No oficial</span>
          </span>
        </Link>

        <nav className="no-scrollbar ml-auto hidden items-center gap-1 overflow-x-auto lg:flex" aria-label="Navegacion principal">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("rounded-full px-4 py-2 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white hover:text-[#c4121a]", active && "bg-white text-[#c4121a] shadow-lg shadow-red-950/20")}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/competicion" className="ml-auto hidden rounded-full border-2 border-white bg-[#f7c948] px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#621114] shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-white sm:block lg:ml-4">
          Data hub
        </Link>
        <button type="button" onClick={() => setOpen((current) => !current)} className="ml-auto rounded-full border border-white/40 p-2 text-white lg:hidden" aria-expanded={open} aria-label="Abrir navegacion">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/20 bg-[#a80f16] px-4 py-4 shadow-xl lg:hidden">
          <nav className="mx-auto grid max-w-[1480px] gap-2" aria-label="Navegacion movil">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wide text-white", active && "bg-white text-[#c4121a]")}>
                  {item.label}
                </Link>
              );
            })}
            <Link href="/competicion" onClick={() => setOpen(false)} className="rounded-2xl bg-[#f7c948] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-[#621114]">
              Data hub
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
