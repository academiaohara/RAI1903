import { ArrowUpRight } from "lucide-react";
import { NewsMedia } from "@/components/NewsMedia";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

export function ClubChronicleCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-[4.25rem] overflow-hidden rounded-xl border border-[#214C9B]/20 bg-white transition hover:border-[#214C9B] sm:min-h-[8.5rem]"
    >
      <NewsMedia item={item} variant="card" />
      <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:justify-between sm:p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-normal text-[#981915] sm:text-xs">
            Web oficial · {formatDate(item.date, { day: "numeric", month: "long" })}
          </p>
          <h3 className="mt-1 line-clamp-3 text-sm font-extrabold uppercase leading-snug text-[#214C9B] sm:line-clamp-none sm:text-lg sm:leading-tight">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 sm:line-clamp-3">{item.excerpt}</p>
        </div>
        <p className="mt-3 hidden items-center gap-1 text-xs font-bold uppercase text-[#214C9B] sm:flex">
          Leer en realavilesindustrial1903.com
          <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </p>
      </div>
    </a>
  );
}
