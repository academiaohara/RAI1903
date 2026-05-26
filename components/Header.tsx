"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#214C9B] via-white to-[#981915] text-slate-950 shadow-lg shadow-blue-950/40">
            <Shield className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-2xl font-black tracking-tight text-white">RAI1903</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-blue-200/70">No oficial</span>
          </span>
        </Link>

        <nav className="no-scrollbar ml-auto hidden items-center gap-1 overflow-x-auto xl:flex" aria-label="Navegacion principal">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("rounded-full px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white", active && "bg-white text-slate-950 shadow-lg shadow-white/10")}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 sm:block xl:ml-4">
          Blanquiazul data hub
        </div>
      </div>
    </header>
  );
}
