import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import type { FanMediaLink } from "@/types";

const platformLabels: Record<FanMediaLink["platform"], string> = {
  youtube: "YouTube",
  spotify: "Spotify",
  twitter: "X / Twitter",
  ivoox: "iVoox",
  apple: "Apple Podcasts",
  otro: "Enlace",
};

const platformBadgeTone: Record<FanMediaLink["platform"], "blue" | "red" | "green" | "amber" | "slate"> = {
  youtube: "red",
  spotify: "green",
  twitter: "slate",
  ivoox: "amber",
  apple: "slate",
  otro: "blue",
};

export function FanMediaLinkCard({ link }: { link: FanMediaLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col rounded-3xl border border-[#214C9B]/25 bg-white p-5 transition hover:-translate-y-1 hover:border-[#214C9B]"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone={platformBadgeTone[link.platform]}>{platformLabels[link.platform]}</Badge>
        <ExternalLink size={16} className="shrink-0 text-slate-400 transition group-hover:text-[#214C9B]" aria-hidden />
      </div>
      <h3 className="mt-4 text-2xl font-extrabold uppercase text-[#214C9B]">{link.name}</h3>
      {link.schedule && <p className="mt-2 text-xs font-bold uppercase tracking-normal text-[#981915]">{link.schedule}</p>}
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{link.description}</p>
      <p className="mt-4 text-sm font-bold text-[#214C9B] group-hover:underline">Abrir enlace</p>
    </a>
  );
}
