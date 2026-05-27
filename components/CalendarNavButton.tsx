import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Route } from "next";

type CalendarNavButtonProps = {
  href: Route;
  className?: string;
};

export function CalendarNavButton({ href, className }: CalendarNavButtonProps) {
  return (
    <Link
      href={href}
      className={
        className ??
        "inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
      }
      aria-label="Ir al calendario"
    >
      <CalendarDays size={16} />
    </Link>
  );
}
