"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function NavRail() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-20 z-30 hidden h-[calc(100vh-5rem)] w-64 border-r border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl lg:block">
      <div className="mb-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#214C9B]/35 to-[#981915]/20 p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">Match center</p>
        <p className="mt-2 text-sm text-slate-300">Dashboard, quiniela, mercado y cantera en una experiencia unica para el entorno avilesino.</p>
      </div>
      <nav className="space-y-2" aria-label="Navegacion lateral">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-white/10 hover:bg-white/10 hover:text-white", active && "border-blue-300/30 bg-[#214C9B]/35 text-white shadow-lg shadow-blue-950/30")}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
