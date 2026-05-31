import type { Metadata } from "next";
import Link from "next/link";
import { EditorGuard } from "@/components/editor/EditorGuard";

export const metadata: Metadata = {
  title: "Editor | RAI1903",
  robots: { index: false, follow: false },
};

const editorNav = [
  { href: "/editor", label: "Inicio" },
  { href: "/editor/seasons", label: "Temporadas" },
  { href: "/editor/news", label: "Noticias" },
  { href: "/editor/players", label: "Jugadores" },
] as const;

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditorGuard>
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2 border-b border-[#214C9B]/15 pb-4">
          {editorNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-[#214C9B]/25 px-4 py-2 text-xs font-bold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </EditorGuard>
  );
}
