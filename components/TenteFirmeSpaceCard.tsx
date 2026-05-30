import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FanMediaLink } from "@/types";

type TenteFirmeSpaceCardProps = {
  link: FanMediaLink;
};

export function TenteFirmeSpaceCard({ link }: TenteFirmeSpaceCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex h-full flex-col rounded-3xl border border-[#214C9B]/25 bg-white p-5 transition",
        "hover:-translate-y-0.5 hover:border-[#214C9B] hover:shadow-md",
      )}
    >
      {link.date && (
        <time dateTime={link.date} className="text-xs font-bold uppercase tracking-wide text-[#981915]">
          {link.date}
        </time>
      )}
      <h3 className="mt-2 font-extrabold uppercase leading-snug text-[#214C9B]">{link.name}</h3>
      {link.description && (
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{link.description}</p>
      )}
      <ExternalLink
        size={16}
        className="mt-4 shrink-0 self-end text-slate-400 transition group-hover:text-[#214C9B]"
        aria-hidden
      />
    </a>
  );
}
