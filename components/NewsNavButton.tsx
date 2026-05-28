import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { Route } from "next";

type NewsNavButtonProps = {
  href: Route;
  className?: string;
};

export function NewsNavButton({ href, className }: NewsNavButtonProps) {
  return (
    <Link
      href={href}
      className={
        className ??
        "inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
      }
      aria-label="Ir a noticias"
    >
      <Newspaper size={16} />
    </Link>
  );
}
